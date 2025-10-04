import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key for backend operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id;

    // 1. Fetch submission with draft info
    const { data: submission, error: subError } = await supabase
      .from("draft_submissions")
      .select("id, draft_id, version_id, submitted_at, status, drafts (title, content)")
      .eq("id", submissionId)
      .single();

    if (subError || !submission) {
      console.error("❌ Error fetching submission:", subError);
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // 2. Fetch version content if version_id exists
    let versionNumber = null;
    let versionContent = null;

    if (submission.version_id) {
      const { data: version, error: versionError } = await supabase
        .from("draft_versions")
        .select("id, version_number, content")
        .eq("id", submission.version_id)
        .single();

      if (!versionError && version) {
        versionContent = version.content;
        versionNumber = version.version_number;
      } else {
        console.warn("Version not found:", submission.version_id, versionError);
      }
    }

    // 3. Fallback to draft content if version content not available
    if (!versionContent && submission.drafts && Array.isArray(submission.drafts) && submission.drafts[0]?.content) {
      versionContent = submission.drafts[0].content;
    }

    // 4. Return complete submission data
    const responseData = {
      ...submission,
      draft_versions: {
        content: versionContent,
        version_number: versionNumber,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}