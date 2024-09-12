import { Database } from "types/supabase";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

// Use this for client side db call. Automatically uses anon key that can fetch only the logged user data
const supabase = createBrowserSupabaseClient<Database>()

export default supabase;