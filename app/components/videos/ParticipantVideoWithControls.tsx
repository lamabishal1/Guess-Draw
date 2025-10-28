// ParticipantVideoWithControls.tsx
"use client";

import React from "react";
import { ParticipantView, StreamVideoParticipant } from "@stream-io/video-react-sdk";

interface Props {
  participant: StreamVideoParticipant;
  isLocal?: boolean;
}

const ParticipantVideoWithControls: React.FC<Props> = ({ participant, isLocal = false }) => {
  const [showVolume, setShowVolume] = React.useState(false);
  const [volume, setVolume] = React.useState(100);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    // Apply volume to participant's audio
    const audioElement = document.querySelector(
      `[data-participant-id="${participant.sessionId}"] audio`
    ) as HTMLAudioElement;
    if (audioElement) {
      audioElement.volume = newVolume / 100;
    }
  };

  return (
    <div className="relative group w-full h-full">
      {/* Participant Video */}
      <ParticipantView
        participant={participant}
        className="w-full h-full object-cover"
      />

      {/* Participant Name Badge */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-xs font-medium">
        {participant.name || "Guest"} {isLocal && "(You)"}
      </div>

      {/* Individual Controls - Show on hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 flex gap-2 justify-center items-center">
        
        {/* Mute Status Indicator (for remote participants) */}
        {!isLocal && (
          <div className="flex items-center gap-1">
            {participant.audioStream  ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-4 h-4 text-green-400"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-4 h-4 text-red-400"
              >
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
              </svg>
            )}
          </div>
        )}

        {/* Camera Status Indicator */}
        <div className="flex items-center gap-1">
          {participant.videoStream ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-4 h-4 text-green-400"
            >
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-4 h-4 text-red-400"
            >
              <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
            </svg>
          )}
        </div>

        {/* Volume Control (for remote participants only) */}
        {!isLocal && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVolume(!showVolume)}
              className="p-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              title="Volume"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
            </button>

            {/* Volume Slider */}
            {showVolume && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-800 p-2 rounded shadow-lg">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 accent-blue-500"
                />
                <div className="text-white text-xs text-center mt-1">{volume}%</div>
              </div>
            )}
          </div>
        )}

        {/* Pin/Unpin (optional feature) */}
        <button
          type="button"
          className="p-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          title="Pin participant"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-4 h-4 text-white"
          >
            <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ParticipantVideoWithControls;