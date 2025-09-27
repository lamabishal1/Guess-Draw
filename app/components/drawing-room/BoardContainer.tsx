"use client";

import React, { useState } from "react";
import DrawingMenu from "./DrawingMenu";
import { Room } from "@/types/supabase";
import WhiteBoard from "./WhiteBoard";

interface BoardContainerProps {
  room: Room | null;
}

export interface DrawingPen {
  color: string;
  size: number;
}

const BoardContainer: React.FC<BoardContainerProps> = ({ room }) => {
  const [drawingPen, setDrawingPen] = useState<DrawingPen>({
    color: "#000000",
    size: 5,
  });

  return (
    <section className="relative flex flex-col xl:flex-row gap-1 bg-white h-screen">
      {/* Room info section - using the room prop */}
      {room && (
        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
          <h2 className="text-sm font-medium text-gray-800">{room.name}</h2>
          <p className="text-xs text-gray-600">
            {room.isPublic ? "Public Room" : "Private Room"}
          </p>
        </div>
      )}

      {/* Drawing canvas area - placeholder for now */}
      <div className="flex-1 bg-gray-50 relative">
        {/* This is where your drawing canvas component will go */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <p>Drawing Canvas Area</p>
        </div>
      </div>

      <DrawingMenu drawingPen={drawingPen} setDrawingPen={setDrawingPen} />
      <WhiteBoard drawingPen={drawingPen} room={room} />
    </section>
  );
};

export default BoardContainer;