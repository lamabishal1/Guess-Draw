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
  const [password, setPassword] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setError("Room name is required");
      return;
    }

    if (!isPublic && !password.trim()) {
      setError("Password is required for private rooms");
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
        isPublic,
        !isPublic,
        !isPublic ? password.trim() : null
      );

      if (newRoom && newRoom[0]?.id) {
        await loadUserDrawingRooms();
        router.push(`/room/${newRoom[0].id}`);
        // Reset form
        setRoomName("");
        setPassword("");
        setIsPublic(true);
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
      setPassword("");
      setIsPublic(true);
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

          {/* Room Name Input */}
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

          {/* Password Input - Below Room Name */}
          {!isPublic && (
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-slate-700 text-sm font-medium">
                Room Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a password"
                  className="border border-slate-300 py-2.5 px-3 pr-10 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  disabled={isCreatingRoom}
                  required={!isPublic}
                  maxLength={16}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                  disabled={isCreatingRoom}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Maximum 16 characters. Users will need this password to join your private room.
              </p>
            </div>
          )}

          {/* Make Room Public Checkbox */}
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

          {/* Action Buttons */}
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
              disabled={isCreatingRoom || !roomName.trim() || (!isPublic && !password.trim())}
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