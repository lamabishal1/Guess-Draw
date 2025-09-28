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
  const callRef = useRef<typeof call>(null); // useRef for stable reference

  useEffect(() => {
    if (!userData) return;

    let isMounted = true;

    const initVideoCall = async () => {
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

        if (!isMounted) return;

        setClient(videoClient);

        const newCall = videoClient.call("development", callId);
        await newCall.join({ create: true });

        if (!isMounted) return;

        setCall(newCall);
        callRef.current = newCall; // store in ref for cleanup
      } catch (error) {
        console.error("Error initializing video call:", error);
      }
    };

    void initVideoCall();

    return () => {
      isMounted = false;
      callRef.current?.leave(); // safely leave call on unmount
    };
  }, [userData, callId]);

  if (!client || !call) {
    return (
      <div className="mt-2 h-32 flex justify-center items-center">
        <Spinner />
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
