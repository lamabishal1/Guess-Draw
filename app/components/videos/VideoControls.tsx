"use client";

import React from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

const VideoControls = () => {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  
  const { microphone, isMute } = useMicrophoneState();
  const { camera, isEnabled } = useCameraState();
  
  // Check if we have valid state before rendering
  if (!microphone || !camera) return null;

  const handleToggleMute = () => {
    microphone.toggle();
  };

  const handleToggleCamera = () => {
    camera.toggle();
  };

  return (
    <div className="w-full bg-slate-900 px-3 py-2 flex gap-2 justify-center items-center rounded-b-lg border-t border-slate-700">
      {/* Mute/Unmute Button */}
      <button
        onClick={handleToggleMute}
        className={`flex items-center justify-center gap-1 px-3 py-1 rounded font-medium transition-colors text-xs ${
          isMute
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-slate-700 hover:bg-slate-600 text-white"
        }`}
        title={isMute ? "Unmute microphone" : "Mute microphone"}
      >
        {isMute ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-3 h-3"
          >
            <path d="M13 2a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1zm-5 3a1 1 0 0 0-.707.293l-2.828 2.829a1 1 0 1 0 1.414 1.414l2.121-2.121A1 1 0 0 0 8 5zm10 0a1 1 0 0 0-.707.293l-.707.707a1 1 0 1 0 1.414 1.414l.707-.707A1 1 0 0 0 18 5zm-5 7a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0v-4a3 3 0 0 0-3-3zm-5 3a1 1 0 0 0-1 1v1a7 7 0 0 0 7 7 7 7 0 0 0 7-7v-1a1 1 0 0 0-2 0v1a5 5 0 0 1-10 0v-1a1 1 0 0 0-1-1z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-3 h-3"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        )}
        <span className="hidden sm:inline">{isMute ? "Unmute" : "Mute"}</span>
      </button>

      {/* Camera On/Off Button */}
      <button
        onClick={handleToggleCamera}
        className={`flex items-center justify-center gap-1 px-3 py-1 rounded font-medium transition-colors text-xs ${
          !isEnabled
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-slate-700 hover:bg-slate-600 text-white"
        }`}
        title={!isEnabled ? "Turn on camera" : "Turn off camera"}
      >
        {!isEnabled ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-3 h-3"
          >
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-12-3l2.5-3.15L14 16l3-3.87v-2.3l-4-5.23-5 6.65V16z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-3 h-3"
          >
            <path d="M15 8.8l6-3.6v10.9l-6-3.6V15c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v-.2z" />
          </svg>
        )}
        <span className="hidden sm:inline">{!isEnabled ? "Off" : "On"}</span>
      </button>

      {/* End Call Button */}
      <button
        onClick={() => window.location.href = "/"}
        className="flex items-center justify-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors text-xs"
        title="End call"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-3 h-3"
        >
          <path d="M17.5 1H6.5C4.57 1 3 2.57 3 4.5v15C3 21.43 4.57 23 6.5 23h11c1.93 0 3.5-1.57 3.5-3.5v-15C21 2.57 19.43 1 17.5 1zm-4 21h-3v-2h3v2z" />
        </svg>
        <span className="hidden sm:inline">End</span>
      </button>
    </div>
  );
};

export default VideoControls;