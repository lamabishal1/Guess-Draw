import { supabase } from '../lib/supabase';
import { DrawingRoom } from "@/types/supabase";

const DRAWING_ROOM_TABLE = "drawing-rooms";

export const createDrawingRoom = async (
    name: string,
    userId: string,
    isPublic: boolean = true,
    isPasswordProtected: boolean = false,
    password: string | null = null
) => {
    const { data } = await supabase
    .from(DRAWING_ROOM_TABLE)
    .insert({
        name,
        owner: userId,
        isPublic,
        isPasswordProtected,
        password: isPasswordProtected ? password : null,
        created_at: new Date().toISOString(),
    })
    .select();
    
    
    return data;
}


export const fetchUserDrawingRooms = async (userId: string) =>{
    const { data } = await supabase
    .from(DRAWING_ROOM_TABLE)
    .select()
    .or(`owner.eq.${userId},isPublic.eq.true`)
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

export const verifyRoomPassword = async (roomId: string, enteredPassword: string): Promise<boolean> => {
    const { data } = await supabase
    .from(DRAWING_ROOM_TABLE)
    .select('password')
    .eq('id', roomId)
    .single();
    
    return data?.password === enteredPassword;
}

export const updateRoomDrawing = async (roomId: string, drawing: DrawingRoom["drawing"]) => {
    await supabase
    .from(DRAWING_ROOM_TABLE)
    .update({
        drawing
    })
    .eq("id", roomId)
    .select();
}
export const deleteDrawingRoom = async (roomId: string) => {
    const { error } = await supabase
      .from(DRAWING_ROOM_TABLE)
      .delete()
      .eq("id", roomId);
  
    if (error) {
      throw error;
    }
  };    