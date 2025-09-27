import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const service_role_key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_SECRET!;
const supabaseWithAdminRole = createClient(supabaseUrl, service_role_key,{
    auth:{
        autoRefreshToken: false,
        persistSession: false,
    }
});

export const adminAuthClient = supabaseWithAdminRole.auth.admin;