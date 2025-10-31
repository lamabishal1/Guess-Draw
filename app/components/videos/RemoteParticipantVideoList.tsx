import {
  ParticipantView,
  StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import React from "react";
import Spinner from "./Spinner";

type Props = {
  participants: StreamVideoParticipant[];
};

const RemoteParticipantVideoList = (props: Props) => {
  const { participants } = props;

  return (
    
<div className="flex flex-wrap gap-2 justify-center overflow-x-auto py-2 px-1">
  {participants.map((participant) => (
    <div
      key={participant.sessionId}
      className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 xl:w-56 overflow-hidden rounded group"
    >
      <ParticipantView
        participant={participant}
        VideoPlaceholder={VideoPlaceholder}
        className="w-full h-full object-cover"
      />


          {/* Hover name overlay */}
          
<div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {participant.name}
      </div>
    </div>
  ))}
    </div>
  );
};

export const VideoPlaceholder = ({
  participant,
}: {
  participant: StreamVideoParticipant;
}) => {
  return (
    <div className="absolute inset-0 bg-slate-700 z-[1] text-center text-slate-300 flex items-center justify-center">
      <div className="hidden xl:flex items-center justify-center">
        <span className="capitalize">{participant.name}</span>
        <p className="lowercase ml-1"> is joining</p>
      </div>
      <div className="xl:hidden">
        <Spinner />
      </div>
    </div>
  );
};

export default RemoteParticipantVideoList;