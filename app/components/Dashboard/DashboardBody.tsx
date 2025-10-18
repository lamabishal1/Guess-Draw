"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { RoomCard, RoomCardSkeleton } from "./RoomCard";
import NewRoomModal from "./NewRoomModal";
import { fetchUserDrawingRooms } from "@/app/services/drawing-room.service";
import Header from "./Header";
import { ExtendedSession } from "@/types/supabase";

export type RoomType = {
  id: string;
  name: string;
  created_at: string;
  isPublic: boolean;
  owner: string;
};

type Props = {
  session: ExtendedSession | null;
};

const DashboardBody = (props: Props) => {
  const { session } = props;
  const pathname = usePathname();
  const isDashboard = pathname === "/";

  const [rooms, setRooms] = useState<RoomType[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateRoomModal, setShowCreateRoomModal] =
    useState<boolean>(false);

  const hasNotCreatedARoom = !loading && rooms?.length === 0;
  const hasAtLeastOneRoom = rooms && rooms!.length >= 0;
  const shouldShowRoom = !loading && hasAtLeastOneRoom;

  const loadUserDrawingRooms = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      const roomsData = await fetchUserDrawingRooms(session.user.id);
      setRooms(roomsData);
    } catch (error) {
      console.error("Error loading rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadUserDrawingRooms();
  }, [loadUserDrawingRooms]);

  const handleRoomDelete = (id: string) => {
    setRooms(prev => prev ? prev.filter(room => room.id !== id) : []);
  };

  return (
    <div className='max-w-5xl flex flex-col gap-10 mx-auto px-4 pt-10'>
      {isDashboard && (
        <Header
          session={session}
          setShowCreateRoomModal={setShowCreateRoomModal}
        />
      )}

      {hasNotCreatedARoom && (
        <p className='text-slate-600 text-center mt-3'>
          Your drawing rooms will display here when you create new rooms.
        </p>
      )}

      <section className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
        {loading && (
          <>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
          </>
        )}

        {shouldShowRoom && (
          <>
            {rooms?.map(({ id, name, created_at, isPublic, owner }) => (
              <RoomCard
                key={id}
                id={id}
                name={name}
                created_at={created_at}
                isPublic={isPublic}
                currentUserId={session?.user?.id ?? ""}
                onDelete={handleRoomDelete}
                owner={owner}
                />))}
                
          </>
        )}
      </section>
      <NewRoomModal
        show={showCreateRoomModal}
        setShow={setShowCreateRoomModal}
        loadUserDrawingRooms={loadUserDrawingRooms}
        session={session}
      />
    </div>
  );
};

export default DashboardBody;