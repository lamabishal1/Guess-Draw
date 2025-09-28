"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabase";
import { fetchUserById, getUserSession } from "@/app/services/user.service";
import { DrawingPen } from "./BoardContainer";
import { Room, ExtendedSession } from "@/types/supabase";

interface BoardProps {
  room: Room;
  drawingPen: DrawingPen;
  isEraserActive: boolean;
}

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

function WhiteBoard({ room, drawingPen, isEraserActive }: BoardProps) {
  const MOUSE_EVENT = "cursor";

  const [session, setSession] = useState<ExtendedSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [drawingData, setDrawingData] = useState<string | null>(null);

  const boardAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const createdCursorsRef = useRef<string[]>([]);
  

  /* -------------------- Cursor helpers (unchanged) -------------------- */

  const createUserMouseCursor = async (userId: string) => {
    if (createdCursorsRef.current.includes(userId)) return;
    if (document.getElementById(userId + "-cursor")) return;

    try {
      const cursorDiv = document.createElement("div");
      cursorDiv.id = userId + "-cursor";
      cursorDiv.classList.add("h-4", "w-4", "absolute", "z-50", "-scale-x-100");

      const svgElem = document.createElement("div");
      svgElem.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
          fill="currentColor" class="bi bi-cursor-fill" viewBox="0 0 16 16">
          <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"/>
        </svg>
      `;

      const { user } = await fetchUserById(userId);
      if (user?.user_metadata?.userColor) {
        cursorDiv.style.color = user.user_metadata.userColor;
      }

      cursorDiv.appendChild(svgElem);
      boardAreaRef.current?.appendChild(cursorDiv);
      createdCursorsRef.current.push(userId);
    } catch (error) {
      console.error("Error creating user cursor:", error);
    }
  };

  const receivedCursorPosition = useCallback((broadcastData: BroadcastPayload) => {
    const { userId, x, y } = broadcastData.payload || {};
    if (!userId || typeof x !== "number" || typeof y !== "number") return;

    const cursorDiv = document.getElementById(userId + "-cursor");
    if (cursorDiv) {
      cursorDiv.style.left = `${x}px`;
      cursorDiv.style.top = `${y}px`;
    } else {
      createUserMouseCursor(userId);
    }
  }, []);

  const sendMousePosition = (
    channel: RealtimeChannel,
    userId: string,
    x: number,
    y: number
  ) => {
    const payload: CursorPayload = { userId, x, y };
    channel.send({ type: "broadcast", event: MOUSE_EVENT, payload });
  };

  /* -------------------- Cursor tracking & subscriptions -------------------- */

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
      return () => boardArea.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isAuthenticated, channel, session?.user?.id]);

  useEffect(() => {
    if (channel) {
      const subscription = channel
        .on("broadcast", { event: MOUSE_EVENT }, (payload: BroadcastPayload) => {
          receivedCursorPosition(payload);
        })
        .subscribe();

      return () => {
        void subscription.unsubscribe();
      };
    }
  }, [channel, receivedCursorPosition]);

  /* -------------------- Realtime DB + channel setup -------------------- */

  useEffect(() => {
    if (isAuthenticated && room.id) {
      const client = supabase;
      const roomChannel = client.channel(room.id);
      setChannel(roomChannel);

      const dbSubscription = client
        .channel("drawing-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "drawing-rooms", filter: `id=eq.${room.id}` },
          (payload: DatabaseChange) => {
            if (payload.new?.drawing) setDrawingData(payload.new.drawing);
          }
        )
        .subscribe();

      return () => {
        void roomChannel.unsubscribe();
        void dbSubscription.unsubscribe();
      };
    }
  }, [isAuthenticated, room.id]);

  /* -------------------- Session init -------------------- */

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

  /* -------------------- drawingData initial load -------------------- */

  useEffect(() => {
    if (room.drawing) setDrawingData(room.drawing);
  }, [room.drawing]);

  /* -------------------- Canvas sizing & preserving image (mount + resize) -------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const sketch = boardAreaRef.current;
    if (!canvas || !sketch) return;

    const resizeCanvas = () => {
      const sketchStyle = getComputedStyle(sketch);
      const w = Math.max(1, Math.floor(parseFloat(sketchStyle.getPropertyValue("width"))));
      const h = Math.max(1, Math.floor(parseFloat(sketchStyle.getPropertyValue("height"))));

      // If canvas already at size, do nothing
      if (canvas.width === w && canvas.height === h) return;

      // Save current image (if any) so we can redraw after resizing
      const saved = canvas.toDataURL();

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill background white (so eraser will paint white pixels consistently)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Restore previous content if there was any
      if (saved) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = saved;
      }
    };

    // initial sizing
    resizeCanvas();

    // listen for window resize
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
    // include drawingData so when image arrives we can ensure sizing/redraw (but we also handle drawingData separately)
  }, [drawingData]);

  /* -------------------- Painting effect (separate) -------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = "source-over";

    let painting = false;
    const mouse = { x: 0, y: 0 };
    const lastMouse = { x: 0, y: 0 };

    const getCanvasOffset = () => {
      const rect = canvas.getBoundingClientRect();
      return { left: rect.left, top: rect.top };
    };

    const handleMove = (e: MouseEvent) => {
      const offset = getCanvasOffset();
      // shift previous mouse
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
      mouse.x = e.clientX - offset.left;
      mouse.y = e.clientY - offset.top;
    };

    // Use RAF loop while painting for smooth strokes and to avoid adding/removing paint handler repeatedly
    let rafId: number | null = null;
    const paintLoop = () => {
      if (painting) {
        ctx.lineWidth = drawingPen.size;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.globalCompositeOperation = "source-over"; // always normal
        ctx.strokeStyle = isEraserActive ? "#FFFFFF" : drawingPen.color;

        ctx.beginPath();
        ctx.moveTo(lastMouse.x, lastMouse.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
      rafId = requestAnimationFrame(paintLoop);
    };

    const handleDown = (e: MouseEvent) => {
      painting = true;
      handleMove(e); // capture initial mouse position
    };

    const handleUp = () => {
      painting = false;
      // ensure next stroke doesn't connect to last position
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    // start the RAF loop
    rafId = requestAnimationFrame(paintLoop);

    return () => {
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
    // only depend on actual drawing params (not resizing)
  }, [drawingPen.size, drawingPen.color, isEraserActive]);

  /* -------------------- Draw stored image when drawingData arrives -------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.onload = () => {
      // fill white background first so transparency is white
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
    };
    image.src = drawingData;
  }, [drawingData]);

  /* -------------------- JSX -------------------- */
  return (
    <div className="my-auto w-full h-full border p-2">
      <div className="w-full h-full relative" id="sketch" ref={boardAreaRef}>
        <div id="container" className="w-full h-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            id="board"
          />
        </div>
      </div>
    </div>
  );
}

export default WhiteBoard;
