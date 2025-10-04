"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import { marked } from "marked";
import { showNotification, notifications } from "@/utils/notifications";
import NotificationToast from "@/components/NotificationToast";

// Helper function to format the content properly
const formatContent = (content: string) => {
  try {
    // If content is empty or just whitespace, show placeholder
    if (!content || content.trim() === '') {
      return '<p class="text-gray-500 italic">No content in this version</p>';
    }
    
    // Convert markdown to HTML using marked library
    return marked(content);
  } catch (error) {
    console.error('Error formatting content:', error);
    // Fallback: wrap in paragraph tags and escape HTML
    return `<p>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }
};

export default function ReviewDraftPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/submissions/${submissionId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch submission: ${response.status}`);
        }

        const submissionData = await response.json();
        
        console.log("✅ Submission data from API:", submissionData);
        console.log("🎯 Content available:", !!submissionData.draft_versions?.content);

        setSubmission(submissionData);
      } catch (error) {
        console.error("❌ Error fetching submission:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  const handleApprove = async () => {
    setProcessing(true);
    
    try {
      const { error } = await supabase
        .from("draft_submissions")
        .update({
          status: "approved",
          hod_feedback: feedback.trim() || "Approved without feedback",
        })
        .eq("id", submissionId);

      if (error) {
        throw error;
      }

      showNotification(notifications.submissionApproved, "success");
      
      // Delay redirect to show the notification
      setTimeout(() => {
        router.push("/dashboard/hod/review");
      }, 1500);
      
    } catch (error) {
      console.error("Error approving submission:", error);
      showNotification(notifications.approvalFailed, "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      showNotification(notifications.feedbackRequired, "error");
      return;
    }

    setProcessing(true);
    
    try {
      const { error } = await supabase
        .from("draft_submissions")
        .update({
          status: "rejected",
          hod_feedback: feedback.trim(),
        })
        .eq("id", submissionId);

      if (error) {
        throw error;
      }

      showNotification(notifications.submissionRejected, "success");
      
      // Delay redirect to show the notification
      setTimeout(() => {
        router.push("/dashboard/hod/review");
      }, 1500);
      
    } catch (error) {
      console.error("Error rejecting submission:", error);
      showNotification(notifications.rejectionFailed, "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
      <NotificationToast />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                  fill="currentColor"
                />
              </svg>
              <Link href="/dashboard/hod">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
                  PrepSmart
                </h1>
              </Link>
            </div>

            {/* Search + Actions */}
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  🔍
                </span>
                <input
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none w-64"
                  placeholder="Search..."
                  type="text"
                />
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="text-gray-600 dark:text-gray-400">🔔</span>
              </button>
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{
                  backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCMZy4jj9QdPjydYwdIDj09Ikl5e9by9BkIyiLznrvqM1MRAL57ZVFRyEj_nONQcWILIIUGHYbVLDY2LROqUwriut269hXoa7kIsHCJZnopqI65BQb8BPVw0-VypkAJWyK20CxEB1OHdkwlINaTxmSwLvRnd0qibj4AdghzPT4eIXIYElksSaENES-ahORFknDC9ejMQPBYdq80YQUF1vpDtzq7T_XAunh409Z0RD2gBn_scDNu9DMGLroXg6UzAKq9Ge63JNC7__k")`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading draft...</span>
              </div>
            ) : !submission ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Submission not found</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{submission.drafts?.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Version {submission.draft_versions?.version_number ?? "N/A"} •{" "}
                  {new Date(submission.submitted_at).toLocaleString()}
                </p>

      {/* ✅ Read-only draft content */}
      <div className="p-6 border rounded-lg bg-white shadow-sm mb-6">
        {submission.draft_versions?.content?.trim() ? (
          <div
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(submission.draft_versions.content.trim())
            }}
          />
        ) : (
          <div className="text-gray-400">
            <p>No content available</p>
            <details className="mt-2 text-xs">
              <summary>Debug Info</summary>
              <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(
                  {
                    hasSubmission: !!submission,
                    hasVersions: !!submission.draft_versions,
                    hasContent: !!submission.draft_versions?.content,
                    contentLength: submission.draft_versions?.content?.length || 0,
                    versionId: submission.version_id,
                    draftId: submission.draft_id,
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Feedback (only if rejecting) */}
      {showFeedback && (
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full border rounded p-3 mb-4"
          placeholder="Provide rejection feedback..."
          rows={4}
        />
      )}

      <div className="flex gap-3">
        {!showFeedback && (
          <button
            disabled={processing}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            onClick={() => setShowFeedback(true)}
          >
            Reject
          </button>
        )}

        {showFeedback && (
          <button
            disabled={processing}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            onClick={handleReject}
          >
            Confirm Reject
          </button>
        )}

                <button
                  disabled={processing}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  onClick={handleApprove}
                >
                  {processing ? "Processing..." : "Approve"}
                </button>
              </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
