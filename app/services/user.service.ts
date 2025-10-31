import { adminAuthClient, supabase } from "../lib/supabase"

export const getUserSession = async() =>{
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error fetching session:", error.message);
      }
    return data.session;
}

export const fetchUserById = async (userId: string)=> {
    const { data, error }= await adminAuthClient.getUserById(userId);
    if (error) {
        console.error("Error fetching session:", error.message);
      }
    return data;
}

export const generateUserVideoToken = async ( userId: string) => {
    const res = await fetch("/api/generate-user-video-instance",{
        method: "POST",
        body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    return data;
}

export const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error.message);
        return false;
    }
    return true;
}