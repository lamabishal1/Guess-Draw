"use client";

import React, { useEffect, useRef, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { updateRoomDrawing } from "@/app/services/drawing-room.service";
import { supabase } from "@/app/lib/supabase";
import { fetchUserById, getUserSession } from "@/app/services/user.service";
import { DrawingPen } from "./BoardContainer";
import { Room, ExtendedSession } from "@/types/supabase";

interface BoardProps {
  room: Room;
  drawingPen: DrawingPen;
}

// Define payload types for realtime events
interface CursorPayload {
  userId: string;
  x: number;
  y: number;
}

interface BroadcastPayload {
  type: "broadcast";
  event: string;
  payload: CursorPayload;
}

interface DatabaseChange {
  eventType: string;
  new: {
    drawing?: string;
    [key: string]: unknown;
  };
  old: Record<string, unknown>;
  schema: string;
  table: string;
}

function WhiteBoard({ room, drawingPen }: BoardProps) {
  const MOUSE_EVENT = "cursor";

  const [session, setSession] = useState<ExtendedSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [drawingData, setDrawingData] = useState<string | null>(null);

  const boardAreaRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const createdCursorsRef = useRef<string[]>([]);

  const createUserMouseCursor = async (userId: string): Promise<void> => {
    // Check if the cursor for this user has already been created
    if (createdCursorsRef.current.includes(userId)) {
      return;
    }

    // Check if the cursor div for this user already exists
    const existingCursorDiv = document.getElementById(userId + "-cursor");
    if (existingCursorDiv) {
      return;
    }

    try {
      const cursorDiv = document.createElement("div");
      const svgElem = document.createElement("div");
      svgElem.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cursor-fill" viewBox="0 0 16 16">  
          <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"/>
        </svg>
      `;

      cursorDiv.id = userId + "-cursor";
      cursorDiv.classList.add("h-4", "w-4", "absolute", "z-50", "-scale-x-100");
      
      const { user } = await fetchUserById(userId);
      if (user?.user_metadata?.userColor) {
        cursorDiv.style.color = user.user_metadata.userColor;
      }

      cursorDiv.appendChild(svgElem);
      if (boardAreaRef.current) {
        boardAreaRef.current.appendChild(cursorDiv);
      }

      // Add the user to the list of created cursors
      createdCursorsRef.current.push(userId);
    } catch (error) {
      console.error("Error creating user cursor:", error);
    }
  };

  const receivedCursorPosition = React.useCallback((broadcastData: BroadcastPayload): void => {
    const { userId, x, y } = broadcastData.payload || {};
    
    if (!userId || typeof x !== 'number' || typeof y !== 'number') {
      return;
    }

    const cursorDiv = document.getElementById(userId + "-cursor");

    if (cursorDiv) {
      cursorDiv.style.left = x + "px";
      cursorDiv.style.top = y + "px";
    } else {
      createUserMouseCursor(userId);
    }
  }, []);

  const sendMousePosition = (
    channel: RealtimeChannel,
    userId: string,
    x: number,
    y: number
  ): void => {
    const payload: CursorPayload = { userId, x, y };
    channel.send({
      type: "broadcast",
      event: MOUSE_EVENT,
      payload,
    });
  };

  // Mouse movement tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isAuthenticated && channel && session?.user?.id) {
        const container = document.querySelector("#container");
        if (!container) return;

        const containerOffset = container.getBoundingClientRect();
        const relativeX = e.clientX - containerOffset.left;
        const relativeY = e.clientY - containerOffset.top;

        sendMousePosition(channel, session.user.id, relativeX, relativeY);
      }
    };

    const boardArea = boardAreaRef.current;
    if (boardArea) {
      boardArea.addEventListener("mousemove", handleMouseMove);
      return () => {
        boardArea.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [isAuthenticated, channel, session?.user?.id]);

  // Subscribe to cursor movements
  useEffect(() => {
    if (channel) {
      const subscription = channel
        .on("broadcast", { event: MOUSE_EVENT }, (payload: BroadcastPayload) => {
          receivedCursorPosition(payload);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [channel, receivedCursorPosition]);

  // Setup realtime channels
  useEffect(() => {
    if (isAuthenticated && room.id) {
      const client = supabase;
      const roomChannel = client.channel(room.id);
      setChannel(roomChannel);

      // Subscribe to database changes
      const dbSubscription = client
        .channel("drawing-changes")
        .on(
          "postgres_changes",
          { 
            event: "*", 
            schema: "public", 
            table: "drawing-rooms",
            filter: `id=eq.${room.id}` // Fixed: using template string for filter
          },
          (payload: DatabaseChange) => {
            if (payload.new?.drawing) {
              setDrawingData(payload.new.drawing);
            }
          }
        )
        .subscribe();

      return () => {
        roomChannel.unsubscribe();
        dbSubscription.unsubscribe();
      };
    }
  }, [isAuthenticated, room.id]);

  // Initialize user session
  useEffect(() => {
    const initSession = async () => {
      try {
        const userSession = await getUserSession();
        if (userSession?.user?.id) {
          setSession(userSession as ExtendedSession);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error getting user session:", error);
        setIsAuthenticated(false);
      }
    };

    initSession();
  }, []);

  // Set initial drawing data
  useEffect(() => {
    if (room.drawing) {
      setDrawingData(room.drawing);
    }
  }, [room.drawing]);

  // Canvas drawing logic
  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#board");
    if (!canvas) return;

    const sketch = document.querySelector("#sketch");
    if (!sketch) return;

    const sketchStyle = getComputedStyle(sketch);
    canvas.width = parseInt(sketchStyle.getPropertyValue("width"));
    canvas.height = parseInt(sketchStyle.getPropertyValue("height"));

    const mouse = { x: 0, y: 0 };
    const lastMouse = { x: 0, y: 0 };

    const getCanvasOffset = () => {
      const rect = canvas.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
      };
    };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Drawing configuration
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = drawingPen.size;
    ctx.strokeStyle = drawingPen.color;

    // Load initial drawing data
    if (drawingData) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
      };
      image.src = drawingData;
    }

    const onPaint = () => {
      ctx.beginPath();
      ctx.moveTo(lastMouse.x, lastMouse.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.closePath();
      ctx.stroke();

      // Debounced save to database
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(async () => {
        try {
          const base64ImageData = canvas.toDataURL("image/png");
          await updateRoomDrawing(room.id, base64ImageData);
        } catch (error) {
          console.error("Failed to save drawing:", error);
        }
      }, 1000);
    };

    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const canvasOffset = getCanvasOffset();
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;

      mouse.x = e.clientX - canvasOffset.left;
      mouse.y = e.clientY - canvasOffset.top;
    };

    const handleMouseDown = () => {
      canvas.addEventListener("mousemove", onPaint);
    };

    const handleMouseUp = () => {
      canvas.removeEventListener("mousemove", onPaint);
    };

    // Add event listeners
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);

    // Cleanup
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", onPaint);
    };
  }, [room.id, drawingData, room.drawing, drawingPen]);

  // Update canvas drawing style when pen changes
  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#board");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = drawingPen.size;
    ctx.strokeStyle = drawingPen.color;
  }, [drawingPen.size, drawingPen.color]);

  return (
    <div className="my-auto w-full h-full border p-2">
      <div className="w-full h-full relative" id="sketch" ref={boardAreaRef}>
        <div id="container" className="w-full h-full">
          <canvas className="w-full h-full" id="board"></canvas>
        </div>
      </div>
    </div>
  );
}

export default WhiteBoard;