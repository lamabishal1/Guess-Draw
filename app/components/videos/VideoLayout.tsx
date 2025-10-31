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
<div className="w-full bg-slate-900 px-2 py-1 flex flex-wrap gap-2 justify-center items-center rounded-b-lg border-t border-slate-700">
    {/* Video Section */}
    <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 justify-center items-center w-full h-full px-2 py-2">
{localParticipant && (
  <div className="w-full flex flex-col items-center gap-2">
    <LocalParticipantVideo participant={localParticipant} />
  </div>
)}
  {remoteParticipants.length > 0 && (
    <div className="w-full flex flex-col items-center gap-2">
      <RemoteParticipantVideoList participants={remoteParticipants} />
    </div>
  )}
</div>

    <div className="p-0 m-0">
      <VideoControls />
    </div>
    
  </div>
</StreamTheme>
  );
};

export default VideoLayout;