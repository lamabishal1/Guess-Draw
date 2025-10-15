import React, { useState } from "react";
import { DrawingPen } from "./BoardContainer";

type DrawingMenuProp = {
  drawingPen: DrawingPen;
  setDrawingPen: (pen: DrawingPen | ((prevState: DrawingPen) => DrawingPen)) => void;
  isEraserActive: boolean;
  setIsEraserActive: (active: boolean) => void;
};

const DEFAULT_COLORS = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"];

const DRAW_SIZES = [
  { size: 1, height: 10, width: 10 },
  { size: 2, height: 15, width: 15 },
  { size: 5, height: 20, width: 20 },
  { size: 10, height: 25, width: 25 },
  { size: 15, height: 30, width: 30 },
  { size: 20, height: 35, width: 35 },
  { size: 50, height: 40, width: 40 },
];

const DrawingMenu = (props: DrawingMenuProp) => {
  const { drawingPen, setDrawingPen, isEraserActive, setIsEraserActive } = props;
  const [previousColor, setPreviousColor] = useState<string>(""); // Store the previous color

  const toggleEraser = () => {
    if (!isEraserActive) {
      // Activate eraser - store current color and don't change drawingPen.color
      setPreviousColor(drawingPen.color);
      setIsEraserActive(true);
    } else {
      // Deactivate eraser - restore previous color
      setDrawingPen((prevState: DrawingPen) => ({
        ...prevState,
        color: previousColor,
      }));
      setIsEraserActive(false);
    }
  };

  const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setDrawingPen((prevState: DrawingPen) => ({
      ...prevState,
      color: newColor,
    }));
    // If eraser was active, deactivate it when changing color
    if (isEraserActive) {
      setIsEraserActive(false);
    }
  };

  const selectColor = (color: string) => {
    setDrawingPen((prevState: DrawingPen) => ({
      ...prevState,
      color,
    }));
    // If eraser was active, deactivate it when selecting a color
    if (isEraserActive) {
      setIsEraserActive(false);
    }
  };

  return (
    <div className='fixed z-10 bottom-0 border-t mx-auto w-full justify-center items-center flex xl:w-auto xl:relative xl:flex-col gap-10 xl:justify-start bg-white xl:rounded-sm p-4'>
      <div className='xl:flex flex-col max-w-[100px] gap-3 bg-white rounded-lg'>
        <div
          className='cursor-pointer flex items-center justify-center h-10 w-10 rounded-full border border-slate-400 opacity-90'
          style={{ 
            background: isEraserActive ? "#f1f5f9" : drawingPen.color 
          }}
        >
          <input
            type='color'
            value={isEraserActive ? previousColor || "#000000" : drawingPen.color}
            onChange={changeColor}
            className='appearance-none bg-transparent opacity-90 cursor-pointer border-none h-10 w-10 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none'
          />
          {/* Show eraser icon when in eraser mode */}
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
        {DEFAULT_COLORS.map((color) => (
          <div
            key={color}
            className='hidden xl:flex cursor-pointer h-10 w-10 rounded-full border border-slate-400 opacity-90 hover:border-slate-600 transition-colors'
            style={{ background: color }}
            onClick={() => selectColor(color)}
          />
        ))}
      </div>
      
      <div className='relative group'>
        <div className='cursor-pointer rounded-full border border-slate-400 text-slate-800 opacity-90 h-10 w-10 flex items-center justify-center group-hover:bg-slate-300'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-6 h-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42'
            />
          </svg>
        </div>
        <div className='absolute z-10 bottom-12 left-1/2 transform -translate-x-1/2 p-3 rounded-lg border bg-slate-700 justify-center gap-2.5 items-center group-hover:flex flex-col min-w-max opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-1000'>
          {DRAW_SIZES.map(({ size, width, height }) => (
            <div
              className='flex gap-3 items-center text-slate-200 justify-between w-full hover:bg-slate-600 p-2 rounded cursor-pointer'
              key={size}
              onClick={() => {
                setDrawingPen((prevState: DrawingPen) => ({
                  ...prevState,
                  size: Number(size),
                }));
              }}
            >
              <span className='text-xs min-w-[20px]'>{size}px</span>
              <div
                className='rounded-full border border-slate-200 opacity-90 flex-shrink-0'
                style={{
                  width: Math.min(width, 35),
                  height: Math.min(height, 35),
                  background: drawingPen.size === size ? 
                    (isEraserActive ? "#ffffff" : drawingPen.color) : 
                    "transparent",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className='cursor-pointer rounded-full border border-slate-400 text-slate-800 opacity-90 h-10 w-10 flex items-center justify-center hover:bg-slate-300 transition-colors'
        style={{
          background: isEraserActive ? "#cbd5e1" : "transparent",
          borderColor: isEraserActive ? "#64748b" : "#cbd5e1",
        }}
        onClick={toggleEraser}
        title={isEraserActive ? "Switch to Pen" : "Switch to Eraser"}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-6 h-6'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z'
          />
        </svg>
      </div>
    </div>
  );
};

export default DrawingMenu;