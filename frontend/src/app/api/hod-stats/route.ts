import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key for backend operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch number of teachers (users with role 'teacher')
    const { data: teachers, error: teachersError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "teacher");

    if (teachersError) {
      console.error("❌ Error fetching teachers:", teachersError);
    }

    // Fetch pending submissions count
    const { data: pendingSubmissions, error: pendingError } = await supabase
      .from("draft_submissions")
      .select("id")
      .eq("status", "pending");

    if (pendingError) {
      console.error("❌ Error fetching pending submissions:", pendingError);
    }

    // Fetch approved submissions count
    const { data: approvedSubmissions, error: approvedError } = await supabase
      .from("draft_submissions")
      .select("id")
      .eq("status", "approved");

    if (approvedError) {
      console.error("❌ Error fetching approved submissions:", approvedError);
    }

    // Return the statistics
    return NextResponse.json({
      teamMembers: teachers?.length || 0,
      pendingSubmissions: pendingSubmissions?.length || 0,
      approvedDrafts: approvedSubmissions?.length || 0,
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}