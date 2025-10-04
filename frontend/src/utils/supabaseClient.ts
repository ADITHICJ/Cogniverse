import { createClient } from "@supabase/supabase-js";

// Make sure these are set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create client with sessionStorage to allow multiple accounts per browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return window.sessionStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem(key);
        }
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
