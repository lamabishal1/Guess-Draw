"use client";

import React from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

const VideoControls = () => {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();

  const { microphone, isMute } = useMicrophoneState();
  const { camera, isEnabled } = useCameraState();

  if (!microphone || !camera) return null;

  const handleToggleMute = () => {
    microphone.toggle();
  };

  const handleToggleCamera = () => {
    camera.toggle();
  };

  return (
    <div className="w-full bg-slate-900 px-3 py-2 flex flex-wrap gap-2 justify-center items-center rounded-b-lg border-t border-slate-700">
      <button
        onClick={handleToggleMute}
        className={`flex items-center justify-center gap-1 px-3 py-2 rounded font-medium transition-colors text-xs sm:text-sm ${
          isMute
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-slate-700 hover:bg-slate-600 text-white"
        }`}
        title={isMute ? "Unmute microphone" : "Mute microphone"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {isMute ? (
            <path d="M16.5 12c0 1.77-1.02 3.29-2.5 4.03V19h-4v-2.97c-1.48-.74-2.5-2.26-2.5-4.03V7h9v5zm-9-7v5h9V5h-9zm12.19 14.19l-1.41 1.41L3.81 4.81 5.22 3.4l15.97 15.97z" />
          ) : (
            <path d="M12 14c1.66 0 3-1.34 3-3V5h-6v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          )}
        </svg>
      </button>

      <button
        onClick={handleToggleCamera}
        className={`flex items-center justify-center gap-1 px-3 py-2 rounded font-medium transition-colors text-xs sm:text-sm ${
          !isEnabled
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-slate-700 hover:bg-slate-600 text-white"
        }`}
        title={!isEnabled ? "Turn on camera" : "Turn off camera"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {!isEnabled ? (
            <path d="M21 6.5l-4 4V7c0-1.1-.9-2-2-2H7.83l9.67 9.67L21 13.5v-7zM2.1 3.51L.69 4.92l2.1 2.1C2.28 7.36 2 7.66 2 8v8c0 1.1.9 2 2 2h12c.34 0 .64-.28.98-.69l2.1 2.1 1.41-1.41L2.1 3.51z" />
          ) : (
            <path d="M17 10.5V7c0-1.1-.9-2-2-2H5C3.9 5 3 5.9 3 7v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3.5l4 4v-11l-4 4z" />
          )}
        </svg>
      </button>

      <button
        onClick={() => window.location.href = "/"}
        className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors text-xs sm:text-sm"
        title="End call"
      >
        {/* End Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.5 1H6.5C4.57 1 3 2.57 3 4.5v15C3 21.43 4.57 23 6.5 23h11c1.93 0 3.5-1.57 3.5-3.5v-15C21 2.57 19.43 1 17.5 1zm-4 21h-3v-2h3v2z" />
        </svg>
      </button>
    </div>
  );
};

export default VideoControls;