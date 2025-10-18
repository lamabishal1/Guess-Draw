import Link from "next/link";
import { RoomType } from "./DashboardBody";
import { deleteDrawingRoom } from "@/app/services/drawing-room.service"

type RoomCardProps = RoomType & {
  onDelete?: (id: string) => void;
  currentUserId?: string;
  owner: string;
};

export const RoomCard = ({ id, name, created_at, isPublic, onDelete, currentUserId, owner }: RoomCardProps) => {
  const createAt = new Date(created_at);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to delete "${name}"?"`))
      return;
    try {
      await deleteDrawingRoom(id);
      onDelete?.(id);
    } catch (err){
      console.log("Failed to delete room", err);
      alert("Failed to delete room.")
    }
  };
  const isOwner = currentUserId === owner;

  return (
    
    <div className="relative group w-full">
      <Link
        href={`/room/${id}`}
        className="flex items-start border border-slate-200 p-5 rounded-md justify-between w-full hover:bg-slate-50 transition"
      >
        <div className="flex gap-3 flex-col w-full">
          <h2 className="font-medium text-lg text-blue-500 capitalize">{name}</h2>
          <span className="text-xs text-slate-500">
            Created at {createAt.getDate()}/{createAt.getMonth() + 1}/
            {createAt.getFullYear()}
          </span>
        </div>
        <span className="rounded-full text-xs font-medium bg-green-100 py-1 px-2 text-green-600">
          {isPublic ? "Public" : "Private"}
        </span>
      </Link>

      {/* Show delete only for owner */}
      {isOwner && (
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hidden group-hover:block"
        title="Delete room"
      >
        ✕
      </button>
      )}
    </div>
  );
};

export const RoomCardSkeleton = () => {
    return (
    <div className='flex gap-2 items-start border border-slate-200 p-5 rounded-md justify-between w-full'>
      <div className='flex gap-3 flex-col w-full'>
        <h2 className='bg-slate-100 rounded-md w-full'>
          <span className='invisible'>Name</span>
        </h2>
        <p className='bg-slate-100 rounded-md w-1/2'>
          <span className='invisible'>Created</span>
        </p>
      </div>
      <span className='bg-slate-100 rounded-full text-xs py-1 px-2'>
        <span className='invisible'>Public</span>
      </span>
    </div>
    );
    };
