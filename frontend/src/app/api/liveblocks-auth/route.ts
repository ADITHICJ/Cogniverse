// app/api/liveblocks-auth/route.ts
import { NextResponse } from "next/server";
import { Liveblocks } from "@liveblocks/node";
import { createClient } from "@supabase/supabase-js";

// Liveblocks SDK (server-side only)
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!, // sk_xxx
});

// Supabase admin client (server-side only, use Service Role key here)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    console.log("🔐 Liveblocks auth request received");
    
    const body = await req.json();
    const { room, supabaseToken } = body;

    console.log("📝 Request data:", { room, hasToken: !!supabaseToken });

    // For development: If no Supabase token, create a test user
    if (!supabaseToken) {
      console.log("⚠️ No Supabase token, creating test user");
      const testUserId = `test-user-${Date.now()}`;
      
      const session = liveblocks.prepareSession(testUserId, {
        userInfo: {
          name: "Test User",
          role: "teacher",
        },
      });

      session.allow(room || "default-room", session.FULL_ACCESS);
      const result = await session.authorize();
      console.log("✅ Test auth successful:", { userId: testUserId });
      return NextResponse.json(result);
    }

    // ✅ Verify Supabase user from frontend token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(supabaseToken);

    if (error || !user) {
      console.error("❌ Supabase auth error:", error);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Supabase user verified:", { userId: user.id, email: user.email });

    // ✅ Prepare Liveblocks session
    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name: user.email ?? "Unknown",
        role: "teacher", // You can fetch role from Supabase `profiles` table
      },
    });

    // ✅ Authorize access for this user in the given room
    session.allow(room, session.FULL_ACCESS);

    // ✅ Return Liveblocks auth token
    const result = await session.authorize();
    console.log("✅ Liveblocks auth successful");
    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ Liveblocks auth error:", err);
    return NextResponse.json({ error: "Failed to authorize with Liveblocks" }, { status: 500 });
  }
}
