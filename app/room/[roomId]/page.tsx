"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchUserById, getUserSession } from "../../services/user.service";
import { fetchDrawingRoomByiId } from "../../services/drawing-room.service";
import Navbar from "../../components/Navbar";
import BoardContainer from "@/app/components/drawing-room/BoardContainer";
import VideoWrapper from "@/app/components/videos/VideoWrapper";
import VideoLayout from "@/app/components/videos/VideoLayout";
import { Room, ExtendedSession, LocalUser, Owner } from "@/types/supabase";

const DrawingRoomPage = () => {
  const { roomId } = useParams();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [session, setSession] = useState<ExtendedSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [participantCount, setParticipantCount] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      const userSession = await getUserSession();
      setSession(userSession);
      setUser(userSession?.user ?? null);

      const roomIdStr = Array.isArray(roomId) ? roomId[0] : roomId;
      if (!roomIdStr) return;

      const rooms = await fetchDrawingRoomByiId(roomIdStr);
      const currentRoom = rooms?.[0] ?? null;
      if (!currentRoom) return;

      if (!currentRoom) {
        console.error("Room not found for roomId:", roomIdStr);
        window.location.href = "/"; // redirect if room is missing
        return;
      }

      if (!currentRoom.ownerId) {
        console.warn("Owner ID is missing. Defaulting to current user:", currentRoom);
        currentRoom.ownerId = userSession?.user?.id ?? "";
      }

      const canEnterRoom =
        currentRoom.isPublic || currentRoom.ownerId === userSession?.user?.id;

      if (!canEnterRoom) {
        window.location.href = "/";
        return;
      }

      setRoom(currentRoom);
      setIsLoading(false);

      try {
        const ownerData = await fetchUserById(currentRoom.ownerId);
        if (ownerData.user) {
          const safeOwner: Owner = {
            id: ownerData.user.id,
            email: ownerData.user.email,
            user_metadata: ownerData.user.user_metadata ?? {},
            userName: ownerData.user.user_metadata?.userName ?? "",
          };
          setOwner(safeOwner);
        }
      } catch (err) {
        console.error("Failed to fetch owner:", err);
      }
    };

    void init();
  }, [roomId]);

  return (
    <main>
      <Navbar
        session={session}
        owner={owner}
        room={room}
        isRoom
        isLoadingRoom={isLoading}
        participantCount={participantCount}
      />

      <div
        className="relative w-full h-full"
        style={{ background: "linear-gradient(45deg, #03A9F4, #4CAF50)" }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-screen text-white">
            <p>One moment. Please...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col-reverse xl:flex-row">
            {room && <BoardContainer room={room} />}
            <section className="min-w-[15rem] max-w-[15rem] xl:min-h-0 relative mx-auto flex items-center xl:flex-col gap-3 text-white">
              {user && room && (
                <VideoWrapper userData={user} callId={room.id}>
                  <VideoLayout setParticipantCount={setParticipantCount} />
                </VideoWrapper>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default DrawingRoomPage;
