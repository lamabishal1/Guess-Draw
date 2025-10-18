"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  StreamVideoClient,
  StreamVideo,
  StreamCallProvider,
  User as StreamUser,
} from "@stream-io/video-react-sdk";
import { generateUserVideoToken } from "@/app/services/user.service";
import Spinner from "./Spinner";
import { LocalUser } from "@/types/supabase";

type Props = {
  children: React.ReactNode;
  userData: LocalUser | null;
  callId: string;
};

const VideoWrapper = ({ children, userData, callId }: Props) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<ReturnType<StreamVideoClient["call"]> | null>(null);
  const [joined, setJoined] = useState(false); // track if joined
  const callRef = useRef<typeof call>(null);

  useEffect(() => {
    if (!userData) return;

    const initClient = async () => {
      try {
        const { token } = await generateUserVideoToken(userData.id);

        const user: StreamUser = {
          id: userData.id!,
          name: userData.user_metadata?.userName ?? "Anonymous",
          image: `https://getstream.io/random_svg/?id=${
            userData.user_metadata?.userName ?? "anon"
          }&name=${userData.user_metadata?.userName ?? "Anonymous"}`,
        };

        const videoClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!,
          user,
          token,
        });

        setClient(videoClient);
        const newCall = videoClient.call("development", callId);
        setCall(newCall);
        callRef.current = newCall;
      } catch (err) {
        console.error("Error initializing Stream client:", err);
      }
    };

    void initClient();

    return () => {
      callRef.current?.leave();
    };
  }, [userData, callId]);

  const handleJoin = async () => {
    if (!call) return;
    try {
      await call.join({ create: true }); // must be called after user gesture
      setJoined(true);
    } catch (err) {
      console.error("Error joining call:", err);
    }
  };

  if (!client || !call) {
    return (
      <div className="mt-2 h-32 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="mt-2 h-32 flex justify-center items-center">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleJoin}
        >
          Join Video Call
        </button>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCallProvider call={call}>{children}</StreamCallProvider>
    </StreamVideo>
  );
};

export default VideoWrapper;
