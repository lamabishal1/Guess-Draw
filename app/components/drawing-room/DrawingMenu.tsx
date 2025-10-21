"use client";

import React, { useState } from "react";
import { DrawingPen } from "./BoardContainer";

interface DrawingMenuProps {
  drawingPen: DrawingPen;
  setDrawingPen: (pen: DrawingPen | ((prev: DrawingPen) => DrawingPen)) => void;
  isEraserActive: boolean;
  setIsEraserActive: (active: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
}

const COLORS = ["#FF0000", "#00FF00", "#0000FF"];
const SIZES = [1, 2, 5, 10, 15, 20, 50];

declare global {
  interface Window {
    whiteboardUndo?: () => void;
    whiteboardRedo?: () => void;
    whiteboardClear?: () => void;
  }
}

const DrawingMenu: React.FC<DrawingMenuProps> = ({
  drawingPen,
  setDrawingPen,
  isEraserActive,
  setIsEraserActive,
  canUndo,
  canRedo,
}) => {
  const [previousColor, setPreviousColor] = useState(drawingPen.color);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toggleEraser = () => {
    if (!isEraserActive) {
      setPreviousColor(drawingPen.color);
      setIsEraserActive(true);
    } else {
      setDrawingPen((prev) => ({ ...prev, color: previousColor }));
      setIsEraserActive(false);
    }
  };

  const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setDrawingPen((prev) => ({ ...prev, color: newColor }));
    if (isEraserActive) setIsEraserActive(false);
  };

  const selectColor = (color: string) => {
    setDrawingPen((prev) => ({ ...prev, color }));
    if (isEraserActive) setIsEraserActive(false);
  };

  const handleUndo = () => {
    if (window.whiteboardUndo) {
      window.whiteboardUndo();
    }
  };

  const handleRedo = () => {
    if (window.whiteboardRedo) {
      window.whiteboardRedo();
    }
  };

  const saveCanvasAsImage = (format: "png" | "jpeg") => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const link = document.createElement("a");
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `drawing-${timestamp}.${format === "png" ? "png" : "jpg"}`;

    if (format === "png") {
      link.href = canvas.toDataURL("image/png");
    } else {
      link.href = canvas.toDataURL("image/jpeg", 0.95);
    }

    link.download = filename;
    link.click();
    setShowFormatMenu(false);
  };

  const handleClearCanvas = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reload page to reset drawing state
    if (window.whiteboardClear) {
      window.whiteboardClear();
    }
  };

  return (
    <div className="fixed z-10 top-1/2 left-4 transform -translate-y-1/2 flex flex-col gap-4 bg-white p-3 rounded-lg shadow-md">
      {/* Room colors and main eraser button */}
      <div
        className="cursor-pointer flex items-center justify-center h-10 w-10 rounded-full border border-slate-400 relative"
        style={{ background: isEraserActive ? "#f1f5f9" : drawingPen.color }}
      >
        <input
          type="color"
          value={isEraserActive ? previousColor : drawingPen.color}
          onChange={changeColor}
          className="appearance-none bg-transparent opacity-90 cursor-pointer border-none h-10 w-10 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
        />
        {isEraserActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Preset colors */}
      {COLORS.map((color) => (
        <div
          key={color}
          className="cursor-pointer h-10 w-10 rounded-full border border-slate-400 hover:border-slate-600 transition-colors"
          style={{ backgroundColor: color }}
          onClick={() => selectColor(color)}
        />
      ))}

      {/* Brush size button with hover menu */}
      <div className="relative group">
        <div
          className="cursor-pointer rounded-full border border-slate-400 text-slate-800 opacity-90 h-10 w-10 flex items-center justify-center hover:bg-slate-300 transition-colors"
          title="Brush sizes"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20v-8m0 0V4m0 8h8m-8 0H4"
            />
          </svg>
        </div>

        {/* Pop-up menu for brush circles */}
        <div className="absolute left-12 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 bg-slate-700 p-3 rounded-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition duration-300">
          {SIZES.map((size, index) => {
            const circleSizes = [6, 10, 14, 18, 22, 28, 36];
            return (
              <div
                key={size}
                className="rounded-full border border-slate-200 cursor-pointer hover:border-white transition-all"
                style={{
                  width: circleSizes[index],
                  height: circleSizes[index],
                  backgroundColor:
                    drawingPen.size === size
                      ? isEraserActive
                        ? "#ffffff"
                        : drawingPen.color
                      : "transparent",
                }}
                onClick={() => setDrawingPen((prev) => ({ ...prev, size }))}
              />
            );
          })}
        </div>
      </div>

      {/* Eraser toggle button */}
      <div
        className="cursor-pointer rounded-full border border-slate-400 text-slate-800 opacity-90 h-10 w-10 flex items-center justify-center hover:bg-slate-300 transition-colors"
        style={{
          background: isEraserActive ? "#cbd5e1" : "transparent",
          borderColor: isEraserActive ? "#64748b" : "#cbd5e1",
        }}
        onClick={toggleEraser}
        title={isEraserActive ? "Switch to Pen" : "Switch to Eraser"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
          />
        </svg>
      </div>

      {/* Undo/Redo buttons - half size */}
      <div className="flex gap-2 justify-center pt-2 border-t border-slate-300">
        <button
          type="button"
          onClick={handleUndo}
          disabled={!canUndo}
          className="h-5 w-5 rounded flex items-center justify-center border border-slate-300 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Undo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-3 h-3 text-slate-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15L3 9m0 0l6-6m-6 6h12a6 6 0 010 12h-3"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleRedo}
          disabled={!canRedo}
          className="h-5 w-5 rounded flex items-center justify-center border border-slate-300 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Redo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-3 h-3 text-slate-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
            />
          </svg>
        </button>
      </div>

      {/* Download Canvas Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowFormatMenu(!showFormatMenu)}
          className="w-full h-10 rounded-full flex items-center justify-center border border-slate-300 hover:bg-slate-200 transition-colors"
          title="Download Canvas"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-slate-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>

        {/* Format selection menu */}
        {showFormatMenu && (
          <div className="absolute left-12 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 bg-white border border-slate-300 p-2 rounded-lg shadow-lg z-50">
            <button
              type="button"
              onClick={() => saveCanvasAsImage("png")}
              className="px-4 py-2 text-left hover:bg-slate-100 rounded transition-colors text-sm font-medium text-slate-700"
            >
              Save as PNG
            </button>
            <button
              type="button"
              onClick={() => saveCanvasAsImage("jpeg")}
              className="px-4 py-2 text-left hover:bg-slate-100 rounded transition-colors text-sm font-medium text-slate-700"
            >
              Save as JPEG
            </button>
          </div>
        )}
      </div>

      {/* Clear Canvas Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowClearConfirm(!showClearConfirm)}
          className="w-full h-10 rounded-full flex items-center justify-center border border-slate-300 hover:bg-slate-200 transition-colors"
          title="Clear Canvas"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-slate-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 2.98a1.978 1.978 0 00-2.798-1.998L6.582 5.5M9 7v5.5m3-7v5.5m3-7v5.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* Clear confirmation menu */}
        {showClearConfirm && (
          <div className="absolute left-12 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 bg-white border border-red-300 p-3 rounded-lg shadow-lg z-50">
            <p className="text-sm font-medium text-slate-700">Clear all drawings?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClearCanvas}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
              >
                Yes, Clear
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingMenu;