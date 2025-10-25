"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchUserById, getUserSession } from "../../services/user.service";
import { fetchDrawingRoomByiId, verifyRoomPassword } from "../../services/drawing-room.service";
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

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [isVerifyingPassword, setIsVerifyingPassword] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      const userSession = await getUserSession();
      setSession(userSession);
      setUser(userSession?.user ?? null);

      const roomIdStr = Array.isArray(roomId) ? roomId[0] : roomId;
      if (!roomIdStr) return;

      const rooms = await fetchDrawingRoomByiId(roomIdStr);
      const currentRoom = rooms?.[0] ?? null;

      if (!currentRoom) {
        console.error("Room not found for roomId:", roomIdStr);
        window.location.href = "/";
        return;
      }

      // Check if user is owner
      const isOwner = currentRoom.owner === userSession?.user?.id;

      // Check if room requires password
      if (currentRoom.isPasswordProtected && !isOwner) {
        setRoom(currentRoom);
        setShowPasswordModal(true);
        setIsLoading(false);
        return;
      }

      // Check public access
      const canEnterRoom = currentRoom.isPublic || isOwner;

      if (!canEnterRoom) {
        window.location.href = "/";
        return;
      }

      setRoom(currentRoom);
      setIsLoading(false);

      try {
        const ownerData = await fetchUserById(currentRoom.owner);
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

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    setIsVerifyingPassword(true);

    const roomIdStr = Array.isArray(roomId) ? roomId[0] : roomId;
    if (!roomIdStr) return;

    const isValid = await verifyRoomPassword(roomIdStr, passwordInput);

    if (isValid) {
      setShowPasswordModal(false);
      // Fetch owner after successful password verification
      if (room?.owner) {
        try {
          const ownerData = await fetchUserById(room.owner);
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
      }
    } else {
      setPasswordError("Incorrect password. Please try again.");
      setPasswordInput("");
    }

    setIsVerifyingPassword(false);
  };

  // Password Modal - Show before main content if password required
  if (showPasswordModal && room) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-slate-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <h2 className="text-xl font-bold text-slate-800">Private Room</h2>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            <strong>{room.name}</strong> is password protected. Enter the password to join.
          </p>

          {passwordError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="roomPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="roomPassword"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Enter room password"
                autoFocus
                disabled={isVerifyingPassword}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isVerifyingPassword || !passwordInput}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifyingPassword ? "Verifying..." : "Join Room"}
              </button>
              <button
                type="button"
                onClick={() => window.location.href = "/"}
                disabled={isVerifyingPassword}
                className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main room content
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