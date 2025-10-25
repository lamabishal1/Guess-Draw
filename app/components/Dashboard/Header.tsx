"use client";

import React from "react";
import { ExtendedSession } from "@/types/supabase";

interface HeaderProps {
  session: ExtendedSession | null;
  setShowCreateRoomModal: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ session, setShowCreateRoomModal }) => {
  return (
    <section className="w-full flex justify-between items-center">
      <h3 className="text-slate-600">
        Welcome, {session?.user?.user_metadata?.userName} 👋🏽
      </h3>
      <button
        className="flex items-center font-semibold text-sm px-3 py-2 rounded-full gap-2 bg-blue-600 text-white hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setShowCreateRoomModal(true)}
        type="button"
        aria-label="Create new room"
      >
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
            d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>New Room</span>
      </button>
    </section>
  );
};

export default Header;