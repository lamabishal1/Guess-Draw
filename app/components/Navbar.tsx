"use client";

import React from "react";
import Link from "next/link";
import { NavbarProps } from "@/types/supabase";

const Navbar: React.FC<NavbarProps> = ({
  session,
  owner,
  isRoom = false,
  room,
  isLoadingRoom = false,
  participantCount,
}) => {
  const shouldShowRoomName = isRoom && room?.name;
  const shouldShowRoomVisibilityBadge = isRoom && !isLoadingRoom && room;
  const isRoomOwner = owner?.id === session?.user?.id;

  return (
    <nav className="bg-white z-20 border border-slate-200 w-full p-4 shadow-sm">
      <div className="mx-auto flex justify-between items-center">
        <section className="flex gap-2 items-center">
          <Link
            href="/"
            className="text-lg font-semibold md:text-2xl text-blue-500 hover:text-blue-600 transition-colors"
          >
            Guess Draw
          </Link>

          {shouldShowRoomName && (
            <div className="hidden md:flex gap-2">
              <span className="text-slate-400">·</span>
              <h3 className="text-slate-500 font-medium">{room.name}</h3>
            </div>
          )}

          {shouldShowRoomVisibilityBadge && (
            <div className="hidden md:flex gap-2">
              <span className="text-slate-400">·</span>
              <span className="rounded-full text-xs font-medium bg-green-100 py-1 px-2 text-green-600">
                {room.isPublic ? "Public" : "Private"}
              </span>
            </div>
          )}

          {owner && (
            <div className="hidden lg:flex gap-2">
              <span className="text-slate-400">·</span>
              <h3 className="text-slate-500">
                Owned by {owner.user_metadata?.userName}
                {isRoomOwner && <span className="text-blue-600 ml-1">(You)</span>}
              </h3>
            </div>
          )}

          {participantCount && participantCount > 0 && (
            <div className="hidden md:flex gap-2">
              <span className="text-slate-400">·</span>
              <h3 className="text-slate-500">
                {participantCount} participant{participantCount !== 1 ? 's' : ''}
              </h3>
            </div>
          )}

          {!isRoom && session && (
            <div className="hidden sm:flex gap-2">
              <span className="text-slate-400">·</span>
              <h3 className="text-slate-500">
                Welcome back @{session.user.user_metadata?.userName}
              </h3>
            </div>
          )}
        </section>

        <section className="flex items-center gap-3">
          {isRoom && (
            <Link
              href="/"
              className="flex items-center font-semibold text-sm px-3 py-2 rounded-full gap-2 bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
              <span>Dashboard</span>
            </Link>
          )}

          {session && (
            <div
              className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-semibold text-sm"
              style={{ 
                backgroundColor: session.user.user_metadata?.userColor || '#6b7280' 
              }}
              title={`@${session.user.user_metadata?.userName || 'User'}`}
            >
              {session.user.user_metadata?.userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </section>
      </div>
    </nav>
  );
};

export default Navbar;