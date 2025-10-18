"use client";

import React, { useState } from "react";
import DrawingMenu from "./DrawingMenu";
import WhiteBoard from "./WhiteBoard";
import { Room } from "@/types/supabase";

export interface DrawingPen {
  color: string;
  size: number;
}

interface BoardContainerProps {
  room: Room | null;
}



const BoardContainer: React.FC<BoardContainerProps> = ({ room }) => {

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [drawingPen, setDrawingPen] = useState<DrawingPen>({
    color: "#000000",
    size: 5,
  });
  const [isEraserActive, setIsEraserActive] = useState(false);

  if (!room) {
    return (
      <section className="relative flex items-center justify-center bg-white h-screen">
        <p className="text-gray-500">Loading room...</p>
      </section>
    );
  }

  return (
    <section className="relative flex flex-col xl:flex-row gap-1 bg-white h-screen">

      <div className="flex-1">
        <WhiteBoard
          room={room}
          drawingPen={drawingPen}
          isEraserActive={isEraserActive}
          onUndoRedoChange={(canUndo, canRedo) => {
            setCanUndo(canUndo);
            setCanRedo(canRedo);
          }}
        />
      </div>

      <DrawingMenu
        drawingPen={drawingPen}
        setDrawingPen={setDrawingPen}
        isEraserActive={isEraserActive}
        setIsEraserActive={setIsEraserActive}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </section>
  );
};

export default BoardContainer;
