import {
  ParticipantView,
  StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import React from "react";
import Spinner from "./Spinner";

type Props = {
  participant: StreamVideoParticipant;
};

const RemoteParticipantVideo: React.FC<Props> = ({ participant }) => {
  return (
    <div className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 xl:w-56 overflow-hidden rounded group scale-x-[-1]">
      <ParticipantView
        participant={participant}
        VideoPlaceholder={() => <VideoPlaceholder participant={participant} />}
        className="w-full h-full object-cover "
      />

      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-x-[-1]">
        {participant.name}
      </div>
    </div>
  );
};

const VideoPlaceholder = ({ }: { participant: StreamVideoParticipant }) => {
  return (
    <div className="absolute inset-0 bg-slate-700 z-[1] text-center text-slate-300 flex items-center justify-center">
      <div className="hidden xl:flex items-center justify-center">
        <p className="lowercase ml-1"> is joining</p>
      </div>
      <div className="xl:hidden">
        <Spinner />
      </div>
    </div>
  );
};

export default RemoteParticipantVideo;
