"use client";

import React, { useState } from "react";
import DrawingMenu from "./DrawingMenu";
import WhiteBoard from "./WhiteBoard";
import { Room } from "@/types/supabase";

interface BoardContainerProps {
  room: Room | null;
}

export interface DrawingPen {
  color: string;
  size: number;
}

const BoardContainer: React.FC<BoardContainerProps> = ({ room }) => {
  const [drawingPen, setDrawingPen] = useState<DrawingPen>({ color: "#000000", size: 5 });
  const [isEraserActive, setIsEraserActive] = useState(false);

  if (!room) {
    return (
      <section className="relative flex flex-col xl:flex-row gap-1 bg-white h-screen">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading room...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex flex-col xl:flex-row gap-1 bg-white h-screen">
      <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
        <h2 className="text-sm font-medium text-gray-800">{room.name}</h2>
        <p className="text-xs text-gray-600">{room.isPublic ? "Public Room" : "Private Room"}</p>
      </div>

      <div className="flex-1">
        <WhiteBoard room={room} drawingPen={drawingPen} isEraserActive={isEraserActive} />
      </div>

      <DrawingMenu
        drawingPen={drawingPen}
        setDrawingPen={setDrawingPen}
        isEraserActive={isEraserActive}
        setIsEraserActive={setIsEraserActive}
      />
    </section>
  );
};

export default BoardContainer;
