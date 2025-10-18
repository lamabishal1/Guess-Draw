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
  const [loading, setLoading] = useState(true);
  const callRef = useRef<typeof call>(null);

  // Initialize client
  useEffect(() => {
    if (!userData) return;

    let isMounted = true;

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

        if (!isMounted) return;

        setClient(videoClient);
        setLoading(false); // client is ready
      } catch (error) {
        console.error("Error initializing client:", error);
        setLoading(false);
      }
    };

    void initClient();

    return () => {
      isMounted = false;
      callRef.current?.leave();
    };
  }, [userData]);

  // Join call handler (needs user gesture)
  const handleJoinCall = async () => {
    if (!client) return;

    try {
      const newCall = client.call("development", callId);
      await newCall.join({ create: true });

      setCall(newCall);
      callRef.current = newCall;
    } catch (err) {
      console.error("Error joining call:", err);
    }
  };

  if (loading) {
    return (
      <div className="mt-2 h-32 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="mt-2 h-32 flex justify-center items-center">
        <button
          onClick={handleJoinCall}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Join Video Call
        </button>
      </div>
    );
  }

  return (
    <StreamVideo client={client!}>
      <StreamCallProvider call={call}>{children}</StreamCallProvider>
    </StreamVideo>
  );
};

export default VideoWrapper;
