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
  <div className="group flex flex-col w-full h-full overflow-hidden text-white capitalize">

    {/* Video Section */}
    <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 justify-center items-center w-full h-full px-2 py-2">
  {localParticipant && (
<div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3 h-auto flex flex-col items-center gap-1">      
<LocalParticipantVideo participant={localParticipant} />
    </div>
  )}
  {remoteParticipants.length > 0 && (
    <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3 h-auto flex justify-center">
      <RemoteParticipantVideoList participants={remoteParticipants} />
    </div>
  )}
</div>

    {/* Controls Section */}
    <div className="p-0 m-0">
      <VideoControls />
    </div>
    
  </div>
</StreamTheme>
  );
};

export default VideoLayout;