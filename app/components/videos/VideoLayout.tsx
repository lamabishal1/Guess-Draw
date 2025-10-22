// VideoLayout.tsx - Updated to use individual controls
"use client";

import React, { useEffect } from "react";
import {
  CallingState,
  StreamTheme,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import Spinner from "./Spinner";
import ParticipantVideoWithControls from "./ParticipantVideoWithControls";
import VideoControls from "./VideoControls"; // Keep global controls too

type VideoLayoutProps = {
  setParticipantCount: (count: number) => void;
};

const VideoLayout: React.FC<VideoLayoutProps> = ({ setParticipantCount }) => {
  const {
    useCallCallingState,
    useParticipantCount,
    useLocalParticipant,
    useRemoteParticipants,
  } = useCallStateHooks();

  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const participantCount = useParticipantCount();

  useEffect(() => {
    setParticipantCount(participantCount);
  }, [participantCount, setParticipantCount]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <StreamTheme>
      <div className="group flex flex-col w-full h-full overflow-hidden">
        {/* Videos Grid with Individual Controls */}
        <div className="flex-1 overflow-auto p-2 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 auto-rows-fr">
            {/* Local Participant */}
            {localParticipant && (
              <div className="w-full h-64 md:h-80 lg:h-96 rounded overflow-hidden">
                <ParticipantVideoWithControls 
                  participant={localParticipant} 
                  isLocal={true}
                />
              </div>
            )}

            {/* Remote Participants */}
            {remoteParticipants.map((participant) => (
              <div 
                key={participant.sessionId} 
                className="w-full h-64 md:h-80 lg:h-96 rounded overflow-hidden"
              >
                <ParticipantVideoWithControls 
                  participant={participant} 
                  isLocal={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Global Controls (for your own mic/camera) */}
        <VideoControls />
      </div>
    </StreamTheme>
  );
};

export default VideoLayout;