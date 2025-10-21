// VideoLayout.tsx - Fixed responsive layout
"use client";

import React, { useEffect } from "react";
import {
  CallingState,
  StreamTheme,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import Spinner from "./Spinner";
import LocalParticipantVideo from "./LocalParticipantVideo";
import RemoteParticipantVideoList from "./RemoteParticipantVideoList";
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

  return (
    <StreamTheme>
      <div className="flex flex-col">
        <div className="grid grid-cols-2 xl:grid-cols-1 gap-10 xl:gap-4 text-white capitalize">
          {localParticipant && (
            <LocalParticipantVideo participant={localParticipant} />
          )}
          {remoteParticipants.length > 0 && (
            <RemoteParticipantVideoList participants={remoteParticipants} />
          )}
        </div>
        <VideoControls />
      </div>
    </StreamTheme>
  );
};

export default VideoLayout;