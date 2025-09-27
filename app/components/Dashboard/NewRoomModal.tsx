"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createDrawingRoom } from "@/app/services/drawing-room.service";
import { ExtendedSession } from "@/types/supabase";

interface NewRoomModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  loadUserDrawingRooms: () => Promise<void>;
  session: ExtendedSession | null;
}

const NewRoomModal: React.FC<NewRoomModalProps> = ({
  session,
  show,
  setShow,
  loadUserDrawingRooms,
}) => {
  const [roomName, setRoomName] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setError("Room name is required");
      return;
    }

    if (!session?.user?.id) {
      setError("User session is required");
      return;
    }

    setIsCreatingRoom(true);
    setError("");

    try {
      const newRoom = await createDrawingRoom(
        roomName.trim(),
        session.user.id,
        isPublic
      );

      if (newRoom && newRoom[0]?.id) {
        await loadUserDrawingRooms();
        router.push(`/room/${newRoom[0].id}`);
        // Reset form
        setRoomName("");
        setIsPublic(false);
        setShow(false);
      } else {
        setError("Failed to create room. Please try again.");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      setError("Failed to create room. Please try again.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleClose = () => {
    if (!isCreatingRoom) {
      setShow(false);
      setError("");
      setRoomName("");
      setIsPublic(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed w-full inset-0 z-50">
      <div
        className="absolute bg-black/50 w-full h-full"
        onClick={handleClose}
      />
      <div className="flex justify-center items-center h-screen p-4">
        <form
          className="bg-white relative z-10 flex flex-col gap-5 p-6 rounded-lg shadow-lg max-w-md w-full"
          onSubmit={handleSubmit}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-slate-700 text-lg font-semibold">
              Create new room
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 p-1"
              disabled={isCreatingRoom}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="roomName" className="text-slate-700 text-sm font-medium">
              Room Name
            </label>
            <input
              id="roomName"
              type="text"
              placeholder="Enter room name"
              className="border border-slate-300 py-2.5 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setRoomName(e.target.value)}
              value={roomName}
              required
              disabled={isCreatingRoom}
              maxLength={50}
            />
          </div>

          <div className="flex gap-2 items-center text-slate-700 text-sm">
            <input
              id="isPublic"
              type="checkbox"
              className="border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isCreatingRoom}
            />
            <label htmlFor="isPublic" className="cursor-pointer">
              Make room public
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 font-semibold text-sm px-4 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              disabled={isCreatingRoom}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingRoom || !roomName.trim()}
              className="flex-1 font-semibold text-sm px-4 py-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isCreatingRoom ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRoomModal;