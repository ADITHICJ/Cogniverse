import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key for backend operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch pending submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from("draft_submissions")
      .select("id, draft_id, version_id, submitted_by, submitted_at, status")
      .eq("status", "pending")
      .order("submitted_at", { ascending: false });

    if (submissionsError) {
      console.error("❌ Error fetching submissions:", submissionsError);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    // Enrich each submission with draft, version, and user profile data
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        // Fetch draft info
        const { data: draft } = await supabase
          .from("drafts")
          .select("id, title")
          .eq("id", submission.draft_id)
          .single();

        // Fetch version info
        const { data: version } = await supabase
          .from("draft_versions")
          .select("id, version_number")
          .eq("id", submission.version_id)
          .single();

        // Fetch submitter profile info
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("id", submission.submitted_by)
          .single();

        return {
          ...submission,
          drafts: draft,
          draft_versions: version,
          profiles: profile,
        };
      })
    );

    return NextResponse.json(enrichedSubmissions);
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}