"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NavbarProps } from "@/types/supabase";
import { logoutUser } from "@/app/services/user.service";

const Navbar: React.FC<NavbarProps> = ({
  session,
  owner,
  isRoom = false,
  room,
  isLoadingRoom = false,
}) => {
  const shouldShowRoomName = isRoom && room?.name;
  const shouldShowRoomVisibilityBadge = isRoom && !isLoadingRoom && room;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isRoomOwner = owner && session?.user?.id && owner.id === session.user.id;

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogoutClick = async () => {
    const success = await logoutUser();
    if (success) {
      window.location.href = "/login";
    }
  };

  return (
    <nav className="bg-white z-20 border border-slate-200 w-full p-4 shadow-sm">
      <div className="mx-auto flex justify-between items-center">
        {/* Left section: Logo + Room infoo */}
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
        </section>

        {/* Right section: Avatar + Dropdown */}
        <section className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              {/* Avatar circle */}
              <div
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-semibold text-sm cursor-pointer"
                style={{ backgroundColor: session.user.user_metadata?.userColor || "#6b7280" }}
                title={`@${session.user.user_metadata?.userName || "User"}`}
              >
                {session.user.user_metadata?.userName?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 flex flex-col bg-white border border-slate-300 rounded shadow-lg z-50 min-w-[120px]">
                  <button
                    onClick={handleLogoutClick}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-900 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Loading placeholder so avatar container stays mounted
            <div className="h-10 w-10 rounded-full bg-gray-300 animate-pulse" />
          )}
        </section>
      </div>
    </nav>
  );
};

export default Navbar;
