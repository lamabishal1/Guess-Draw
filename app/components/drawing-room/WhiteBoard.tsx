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

  /* -------------------- Load existing drawing -------------------- */
  useEffect(() => {
    if (room.drawing) {
      try {
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

  /* -------------------- Draw stroke helper -------------------- */
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

  /* -------------------- Render strokes -------------------- */
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

  /* -------------------- Drawing logic (mouse + touch) -------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isAuthenticated || !session) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let painting = false;
    let currentStroke: Stroke = {
      userId: session.user.id,
      color: drawingPen.color,
      size: drawingPen.size,
      path: [],
    };
    let primaryPointerId: number | null = null;
    let lastPos = { x: 0, y: 0 };

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const startDraw = (e: PointerEvent) => {
      if (primaryPointerId !== null) return; // ignore additional pointers
      primaryPointerId = e.pointerId;
      painting = true;
      const pos = getPos(e);
      currentStroke = {
        userId: session.user.id,
        color: isEraserActive ? "#FFFFFF" : drawingPen.color,
        size: drawingPen.size,
        path: [pos],
      };
      lastPos = pos;
    };

    const draw = (e: PointerEvent) => {
      if (!painting || e.pointerId !== primaryPointerId) return;
      const pos = getPos(e);
      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.size;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      currentStroke.path.push(pos);
      lastPos = pos;
    };

    const endDraw = async (e?: PointerEvent) => {
      if (!painting || (e && e.pointerId !== primaryPointerId)) return;
      painting = false;
      primaryPointerId = null;
      setDrawingData((prev) => [...prev, currentStroke]);
      await supabase
        .from("drawing-rooms")
        .update({ drawing: [...drawingData, currentStroke] })
        .eq("id", room.id);
      channel.send({ type: "broadcast", event: "new-stroke", payload: currentStroke });
    };

    /* -------------------- Pointer Events -------------------- */
    canvas.addEventListener("pointerdown", startDraw);
    canvas.addEventListener("pointermove", draw);
    window.addEventListener("pointerup", endDraw);
    window.addEventListener("pointercancel", endDraw);

    return () => {
      canvas.removeEventListener("pointerdown", startDraw);
      canvas.removeEventListener("pointermove", draw);
      window.removeEventListener("pointerup", endDraw);
      window.removeEventListener("pointercancel", endDraw);
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

  /* -------------------- Receive strokes -------------------- */
  useEffect(() => {
    const subscription = channel
      .on("broadcast", { event: "new-stroke" }, (payload: BroadcastPayload) => {
        setDrawingData((prev) => [...prev, payload.payload]);
      })
      .subscribe();

    return () => void subscription.unsubscribe();
  }, [channel]);

  return (
    <div
      ref={boardRef}
      className="w-full h-full relative border overflow-auto"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default WhiteBoard;
