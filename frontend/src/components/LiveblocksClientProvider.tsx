"use client";

import { LiveblocksProvider } from "@liveblocks/react";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function LiveblocksClientProvider({ children }: { children: React.ReactNode }) {
  const [supabaseToken, setSupabaseToken] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSupabaseToken(session?.access_token || null);
    }

    init();
  }, []);

  return (
    <LiveblocksProvider
      authEndpoint={async (room?: string) => {
        try {
          console.log("🔐 Authenticating with Liveblocks:", { room, hasToken: !!supabaseToken });
          
          const res = await fetch("/api/liveblocks-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ room, supabaseToken }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ Auth request failed:", res.status, errorText);
            throw new Error(`Auth failed: ${res.status} ${errorText}`);
          }

          const data = await res.json();
          console.log("✅ Auth response:", data);

          // Handle wrapped response format
          let tokenData = data;
          if (data.body && typeof data.body === 'string') {
            try {
              tokenData = JSON.parse(data.body);
            } catch (e) {
              console.error("❌ Failed to parse response body:", e);
            }
          }

          // Ensure the response has the correct format
          if (!tokenData.token) {
            console.error("❌ Invalid auth response - missing token:", tokenData);
            throw new Error("Invalid auth response - missing token");
          }

          return tokenData;
        } catch (error) {
          console.error("❌ Authentication error:", error);
          throw error;
        }
      }}
    >
      {children}
    </LiveblocksProvider>
  );
}
