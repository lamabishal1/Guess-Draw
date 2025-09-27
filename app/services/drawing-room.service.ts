import { supabase } from '../lib/supabase';

const DRAWING_ROOM_TABLE = "drawing-rooms";

export const createDrawingRoom = async (
    name: string,
    userId: string,
    isPublic: boolean
) => {
    const { data } = await supabase
    .from(DRAWING_ROOM_TABLE)
    .insert({
        name,
        owner: userId,
        isPublic,
        isPasswordProtected: false,
        password: null,
        created_at: new Date().toISOString(),
    })
    .select();
    
    return data;
}

export const fetchUserDrawingRooms = async (userId: string) =>{
    const { data } = await supabase
    .from(DRAWING_ROOM_TABLE)
    .select()
    .eq("owner", userId)
    .order("created_at", { ascending: false});

    return data;
}

export const fetchDrawingRoomByiId = async (id: string) => {
    const { data } = await supabase
    .from(DRAWING_ROOM_TABLE)
    .select()
    .eq("id", id);

    return data;
}

export const updateRoomDrawing = async (roomId: string, drawing: string) => {
    await supabase
    .from(DRAWING_ROOM_TABLE)
    .update({
        drawing,
    })
    .eq("id", roomId)
    .select();
}
