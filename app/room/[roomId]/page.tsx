"use client";

import React, { useEffect, useState } from "react";
import { fetchUserById, getUserSession } from "../../services/user.service";
import { useParams } from "next/navigation";
import { fetchDrawingRoomByiId } from "../../services/drawing-room.service";
import Navbar from "../../components/Navbar";
import BoardContainer from "@/app/components/drawing-room/BoardContainer";

const DrawingRoomPage = () => {
  const { roomId } = useParams();
  const [owner, setOwner] = useState<any | null>(null);
  const [room, setRoom] = useState<any>([]);
  const [user, setUser] = useState<any>({});
  const [session, setSession] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [participantCount, setParticipantCount] = useState<number>(0);

  useEffect(() => {
    getUserSession().then((session) => {
      setSession(session);
      setUser(session?.user);

      fetchDrawingRoomByiId(roomId as string).then((room) => {
        const canEnterRoom =
          room![0].isPublic || room![0].owner === session?.user?.id;

        if (!canEnterRoom) {
          return (window.location.href = "/");
        }
        setRoom(room![0]);
        setIsLoading(false);
        fetchUserById(room![0].owner).then((res) => {
          setOwner(res.user);
        });
      });
    });
  }, []);

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
      <BoardContainer room={room} />
    </main>
  );
};

export default DrawingRoomPage;