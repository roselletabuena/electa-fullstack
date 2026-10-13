import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/env";

let serverClient: SupabaseClient | null = null;

/**
 * Returns a server-side Supabase client instance using service role credentials (or anon key fallback).
 */
export function createServerSupabaseClient(): SupabaseClient {
  if (serverClient) {
    return serverClient;
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "dummy-service-role-key";

  serverClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClient;
}
