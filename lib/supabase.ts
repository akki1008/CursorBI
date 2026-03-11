import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In production you should configure these environment variables.
  // The app will throw here to make misconfiguration obvious at boot time.
  throw new Error(
    "Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });
  }
  return client;
}

