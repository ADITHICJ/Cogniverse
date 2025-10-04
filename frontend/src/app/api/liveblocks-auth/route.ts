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
    console.log("🔑 LIVEBLOCKS_SECRET_KEY available:", !!process.env.LIVEBLOCKS_SECRET_KEY);
    console.log("🔑 LIVEBLOCKS_SECRET_KEY format:", process.env.LIVEBLOCKS_SECRET_KEY?.substring(0, 10) + "...");
    
    // Validate Liveblocks SDK initialization
    try {
      const testSession = liveblocks.prepareSession("test-user", { userInfo: { name: "test" } });
      console.log("✅ Liveblocks SDK initialized correctly");
    } catch (lbError) {
      console.error("❌ Liveblocks SDK initialization error:", lbError);
    }
    
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

    // ✅ Fetch user profile for full name and role
    console.log("🔍 Fetching profile for user in Liveblocks auth:", user.id);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    console.log("👤 Profile data in Liveblocks auth:", profile);
    console.log("❌ Profile error in Liveblocks auth:", profileError);

    const userName = profile?.full_name || user.email || "Unknown";
    const userRole = profile?.role || "teacher";
    
    console.log("✅ Final userName for Liveblocks:", userName);

    // ✅ Prepare Liveblocks session
    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name: userName,
        role: userRole,
      },
    });

    // ✅ Check if user has access to this room (draft)
    const draftId = room.replace('draft-', '');
    console.log("🔍 Checking access for:", { userId: user.id, email: user.email, draftId });
    
    // Check if user owns the draft or is a collaborator
    const { data: draft, error: draftError } = await supabase
      .from("drafts")
      .select("user_id")
      .eq("id", draftId)
      .single();

    console.log("📄 Draft query result:", { draft, draftError });

    const { data: collaborations, error: collabError } = await supabase
      .from("draft_collaborators")
      .select("id")
      .eq("draft_id", draftId)
      .eq("user_id", user.id);

    console.log("👥 Collaboration query result:", { collaborations, collabError, count: collaborations?.length || 0 });

    const isOwner = draft && draft.user_id === user.id;
    const isCollaborator = collaborations && collaborations.length > 0;
    const hasAccess = isOwner || isCollaborator;

    console.log("🔐 Access check:", { isOwner, isCollaborator, hasAccess });

    if (!hasAccess) {
      console.error("❌ User doesn't have access to this draft:", { 
        userId: user.id, 
        email: user.email, 
        draftId, 
        draftOwner: draft?.user_id,
        collaborationCount: collaborations?.length || 0
      });
      return NextResponse.json({ error: "Access denied to this draft" }, { status: 403 });
    }

    console.log("✅ User has access to draft:", { userId: user.id, draftId, isOwner: draft?.user_id === user.id });

    // ✅ Authorize access for this user in the given room
    session.allow(room, session.FULL_ACCESS);

    // ✅ Return Liveblocks auth token
    const result = await session.authorize();
    console.log("✅ Liveblocks auth successful for room:", room);
    console.log("✅ Auth result:", result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ Liveblocks auth error:", err);
    return NextResponse.json({ error: "Failed to authorize with Liveblocks" }, { status: 500 });
  }
}
