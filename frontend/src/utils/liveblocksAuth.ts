import { supabase } from "@/utils/supabaseClient";

// Returns an authEndpoint function for Liveblocks client
export async function getAuthEndpoint() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const supabaseToken = session?.access_token;

  // Liveblocks client expects this function
  return async ({ room }: { room: string }) => {
    const res = await fetch("/api/liveblocks-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room, supabaseToken }),
    });

    if (!res.ok) throw new Error("Auth failed");

    return await res.json();
  };
}
