import { createClient } from '@supabase/supabase-js'
import { Database } from 'types/supabase';

// Use this for server side db call. Service Key can fetch all data, ignoring Row Level Security policies.
const supabaseServer = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!)

export default supabaseServer;