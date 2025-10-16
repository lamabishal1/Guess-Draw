"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import { Room, ExtendedSession } from "@/types/supabase";
import { getUserSession } from "@/app/services/user.service";
import { DrawingPen } from "./BoardContainer";

export interface Stroke {
  userId: string;
  color: string;
  size: number;
  path: { x: number; y: number }[];
}

interface BoardProps {
  room: Room;
  drawingPen: DrawingPen;
  isEraserActive: boolean;
}

interface BroadcastPayload {
  type: "broadcast";
  event: string;
  payload: Stroke;
}

const WhiteBoard: React.FC<BoardProps> = ({ room, drawingPen, isEraserActive }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [session, setSession] = useState<ExtendedSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const channel = supabase.channel(room.id);
  const [drawingData, setDrawingData] = useState<Stroke[]>([]);

  /* -------------------- Init session -------------------- */
  useEffect(() => {
    const init = async () => {
      const userSession = await getUserSession();
      if (userSession?.user?.id) {
        setSession(userSession as ExtendedSession);
        setIsAuthenticated(true);
      }
    };
    void init();
  }, []);

  useEffect(() => {
    if (room.drawing) {
      try {
        // If stored as JSON string
        const strokes: Stroke[] =
          typeof room.drawing === "string" ? JSON.parse(room.drawing) : room.drawing;
        setDrawingData(strokes);
      } catch (error) {
        console.error("Failed to parse drawing data:", error);
        setDrawingData([]);
      }
    } else {
      setDrawingData([]);
    }
  }, [room.drawing]);
  

  /* -------------------- Resize canvas -------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    if (!canvas || !board) return;

    const resize = () => {
      const { width, height } = board.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* -------------------- Draw function -------------------- */
  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.path.length < 2) return;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(stroke.path[0].x, stroke.path[0].y);
    stroke.path.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  }, []);

  /* -------------------- Render all strokes -------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawingData.forEach((stroke) => drawStroke(ctx, stroke));
  }, [drawingData, drawStroke]);

  /* -------------------- Mouse drawing -------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isAuthenticated || !session) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mouse = { x: 0, y: 0 };
    const lastMouse = { x: 0, y: 0 };
    let painting = false;
    let currentStroke: Stroke = {
      userId: session.user.id,
      color: drawingPen.color,
      size: drawingPen.size,
      path: [],
    };

    const getOffset = () => canvas.getBoundingClientRect();

    const start = (e: MouseEvent) => {
      painting = true;
      const rect = getOffset();
      lastMouse.x = e.clientX - rect.left;
      lastMouse.y = e.clientY - rect.top;
      currentStroke = {
        userId: session.user.id,
        color: isEraserActive ? "#FFFFFF" : drawingPen.color,
        size: drawingPen.size,
        path: [{ x: lastMouse.x, y: lastMouse.y }],
      };
    };

    const move = (e: MouseEvent) => {
      if (!painting) return;
      const rect = getOffset();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.size;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(lastMouse.x, lastMouse.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();

      currentStroke.path.push({ x: mouse.x, y: mouse.y });
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
    };

    const end = async () => {
      if (!painting) return;
      painting = false;

      setDrawingData((prev) => [...prev, currentStroke]);

      // save to Supabase
      await supabase
        .from("drawing-rooms")
        .update({ drawing: [...drawingData, currentStroke] })
        .eq("id", room.id);

      // broadcast
      channel.send({ type: "broadcast", event: "new-stroke", payload: currentStroke });
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
    };
  }, [
    isAuthenticated,
    drawingPen.color,
    drawingPen.size,
    isEraserActive,
    session,
    channel,
    room.id,
    drawingData,
  ]);

  /* -------------------- Receive strokes from others -------------------- */
  useEffect(() => {
    const subscription = channel
      .on("broadcast", { event: "new-stroke" }, (payload: BroadcastPayload) => {
        setDrawingData((prev) => [...prev, payload.payload]);
      })
      .subscribe();

    return () => void subscription.unsubscribe();
  }, [channel]);

  return (
    <div ref={boardRef} className="w-full h-full relative border">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default WhiteBoard;
