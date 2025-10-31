"use client";

import React, { useEffect } from "react";
import {
  CallingState,
  StreamTheme,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import Spinner from "./Spinner";
import LocalParticipantVideo from "./LocalParticipantVideo";
import RemoteParticipantVideo from "./RemoteParticipantVideoList";
import VideoControls from "./VideoControls";

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

  const allParticipants = localParticipant
    ? [localParticipant, ...remoteParticipants]
    : [...remoteParticipants];

  return (
     <StreamTheme>
      <div className="w-full h-full flex flex-col">
        {/* Video Controls at top on small/medium screens, stays with video on large */}
        <div className="lg:hidden w-full">
          <VideoControls />
        </div>

        {/* Videos - Horizontal scroll on small/medium, vertical on large */}
        <div className="flex-1 overflow-x-auto lg:overflow-y-auto p-2 md:p-4">
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-2">
            {localParticipant && (
              <div className="flex-shrink-0 w-64 md:w-80 lg:w-full">
                <LocalParticipantVideo participant={localParticipant} />
              </div>
            )}
            {remoteParticipants.length > 0 && (
              <div className="flex-shrink-0 w-64 md:w-80 lg:w-full">
                <RemoteParticipantVideoList participants={remoteParticipants} />
              </div>
            )}
          </div>
        </div>

        {/* Video Controls at bottom on large screens */}
        <div className="hidden lg:block w-full">
          <VideoControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default VideoLayout;
