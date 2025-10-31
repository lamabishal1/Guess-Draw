import {
  ParticipantView,
  StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import Spinner from "./Spinner";

const LocalParticipantVideo = ({ participant }: { participant?: StreamVideoParticipant }) => {
  return (
    <div className="relative w-full max-w-md aspect-video overflow-hidden rounded group">
      {/* Video container with mirrored view */}
      <div className="relative w-full aspect-video overflow-hidden rounded group scale-x-[-1]">
        <ParticipantView
          participant={participant!}
          VideoPlaceholder={VideoPlaceholder}
          className="w-full h-full object-cover"
        />

        {/* Hover name overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {participant?.name}
        </div>
      </div>
    </div>
  );
};

const VideoPlaceholder = () => {
  return (
    <div className="absolute inset-0 bg-slate-700 z-[1] text-center text-slate-300 flex items-center justify-center">
      <Spinner />
    </div>
  );
};

export default LocalParticipantVideo;
