import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/env";

let browserClient: SupabaseClient | null = null;

/**
 * Returns a singleton browser Supabase client instance using public anonymous credentials.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-anon-key";

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

/**
 * Convenience alias for getting the browser Supabase client.
 */
export const createBrowserClient = getSupabaseBrowserClient;
