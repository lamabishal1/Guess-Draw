// types/supabase.ts
import { Session, User, RealtimeChannel } from '@supabase/supabase-js'

// Custom user metadata interface
export interface UserMetadata {
  userName?: string;
  userColor?: string;
}

// Extended User type with custom metadata
export interface ExtendedUser extends Omit<User, 'user_metadata'> {
  user_metadata: UserMetadata;
}

// Extended Session type
export interface ExtendedSession extends Omit<Session, 'user'> {
  user: LocalUser;
}

// Room related types
export interface Room {
  id: string;
  name: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  drawing?: string;

}

export interface RoomType {
  id: string;
  name: string;
  created_at: string;
  isPublic: boolean;
}

// Owner type (could be extended based on your needs)
export interface Owner {
  id: string;
  email?: string;
  user_metadata: UserMetadata;
  userName?: string;
}

export interface DrawingPen {
  color: string;
  size: number;
}

export interface CursorPosition {
  x: number;
  y: number;
}

export interface CursorPayload {
  userId: string;
  x: number;
  y: number;
}

export interface BroadcastPayload {
  type: "broadcast";
  event: string;
  payload: CursorPayload;
}

export interface DatabaseChange {
  eventType: string;
  new: {
    id?: string;
    name?: string;
    drawing?: string;
    isPublic?: boolean;
    ownerId?: string;
    [key: string]: unknown;
  };
  old: {
    id?: string;
    name?: string;
    drawing?: string;
    isPublic?: boolean;
    ownerId?: string;
    [key: string]: unknown;
  };
  schema: string;
  table: string;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface CanvasOffset {
  left: number;
  top: number;
}

// User service response types
export interface UserResponse {
  user?: ExtendedUser;
  error?: string;
}

export interface CreateRoomResponse {
  id: string;
  name: string;
  isPublic: boolean;
  ownerId: string;
  drawing?: string;
  createdAt: string;
  updatedAt: string;
}

// Component Props Interfaces
export interface NavbarProps {
  session: ExtendedSession | null;
  owner?: Owner | null;
  isRoom?: boolean;
  room?: Room | null;
  isLoadingRoom?: boolean;
  participantCount?: number;
}

export interface HeaderProps {
  session: ExtendedSession | null;
  setShowCreateRoomModal: (show: boolean) => void;
}

export interface NewRoomModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  loadUserDrawingRooms: () => Promise<void>;
  session: ExtendedSession | null;
}

export interface DashboardBodyProps {
  session: ExtendedSession | null;
}

export interface BoardContainerProps {
  room: Room | null;
}

export interface WhiteBoardProps {
  room: Room;
  drawingPen: DrawingPen;
}

export interface DrawingMenuProps {
  drawingPen: DrawingPen;
  setDrawingPen: (pen: DrawingPen | ((prevState: DrawingPen) => DrawingPen)) => void;
}

export interface RoomCardProps {
  id: string;
  name: string;
  created_at: string;
  isPublic: boolean;
}

// Realtime/Channel related types
export interface RealtimeChannelState {
  channel: RealtimeChannel | null;
  isConnected: boolean;
}

export interface CursorState {
  [userId: string]: CursorPosition;
}

// Drawing size configuration
export interface DrawSize {
  size: number;
  height: number;
  width: number;
}

// Service function return types
export interface DrawingRoomService {
  createDrawingRoom: (name: string, userId: string, isPublic: boolean) => Promise<CreateRoomResponse[] | null>;
  updateRoomDrawing: (roomId: string, drawingData: string) => Promise<void>;
  fetchUserDrawingRooms: (userId: string) => Promise<RoomType[] | null>;
}

// Error handling types
export interface ServiceError {
  message: string;
  code?: string;
  details?: unknown;
}

// Canvas drawing state
export interface CanvasState {
  isDrawing: boolean;
  lastPosition: MousePosition;
  currentPosition: MousePosition;
}
export interface LocalUser {
  id: string;
  email?: string;
  user_metadata?: {
    userName?: string;
    userColor?: string;
  };
}
export interface Stroke {
  x: number;
  y: number;
  color: string;
  size: number;
}

export interface DrawingRoom {
  id: string;
  name: string;
  drawing: Stroke[];
  updated_at: string;
}