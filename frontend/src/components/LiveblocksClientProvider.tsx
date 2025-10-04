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
      console.log("🔄 Supabase session initialized:", { hasSession: !!session, hasToken: !!session?.access_token });
      
      // Test network connectivity to Liveblocks
      try {
        console.log("🧪 Testing Liveblocks API connectivity...");
        const testResponse = await fetch("https://api.liveblocks.io/v2/rooms", {
          method: "GET",
          headers: { "Authorization": "Bearer invalid-token-test" }
        });
        console.log("🌐 Liveblocks API reachable:", testResponse.status);
        
        // Test WebSocket connectivity by checking if WebSocket is available
        if (typeof WebSocket !== 'undefined') {
          console.log("✅ WebSocket support available");
          
          // Test basic WebSocket connection (will fail due to auth, but shows if WebSocket connections work)
          try {
            const testWs = new WebSocket("wss://echo.websocket.org");
            testWs.onopen = () => {
              console.log("✅ WebSocket test connection successful");
              testWs.close();
            };
            testWs.onerror = (error) => {
              console.log("❌ WebSocket test connection failed:", error);
            };
          } catch (wsError) {
            console.error("❌ WebSocket test error:", wsError);
          }
        } else {
          console.error("❌ WebSocket not supported in this environment");
        }
      } catch (error) {
        console.error("❌ Cannot reach Liveblocks API:", error);
      }
    }

    init();

    // Listen for auth changes to update token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state changed:", event, { hasSession: !!session });
      setSupabaseToken(session?.access_token || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <LiveblocksProvider
      // Add connection configuration to handle WebSocket issues
      throttle={100}
      lostConnectionTimeout={30000}
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
