import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Did we just land back from Google/email OAuth with tokens in the URL?
// supabase-js strips the hash during client init, so capture this BEFORE
// createClient runs — it tells the app to auto-navigate to the dashboard.
export const isOAuthRedirect =
  typeof window !== 'undefined' &&
  (window.location.hash.includes('access_token') ||
    window.location.search.includes('code='));

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
