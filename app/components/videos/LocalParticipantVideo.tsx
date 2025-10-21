import {
  ParticipantView,
  StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import Spinner from "./Spinner";

const LocalParticipantVideo = (props: { participant?: StreamVideoParticipant }) => {
  const { participant } = props;
  return (
<div className="relative h-32 w-32 xl:w-full overflow-hidden rounded scale-x-[-1]">      <ParticipantView
        participant={participant!}
        VideoPlaceholder={VideoPlaceholder}
        className="w-full h-full object-cover" // center crop
      />
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
