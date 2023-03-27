import { createClient } from '@supabase/supabase-js'
import { Database } from 'types/supabase';

const supabase = createClient<Database>(process.env.DB_URL!, process.env.SERVICE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})

export default supabase;