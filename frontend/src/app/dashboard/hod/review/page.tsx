"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";

export default function HODReviewPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/submissions');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch submissions: ${response.status}`);
        }

        const submissions = await response.json();
        
        console.log("📊 Submissions from API:", submissions);

        // Log each submission for debugging
        submissions.forEach((submission: any, index: number) => {
          console.log(`📋 Submission ${index + 1}:`, {
            id: submission.id,
            draft_title: submission.drafts?.title,
            version_number: submission.draft_versions?.version_number,
            submitted_at: submission.submitted_at
          });
        });

        setPending(submissions);
      } catch (err) {
        console.error("❌ Error fetching submissions:", err);
        setPending([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
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
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading submissions...</span>
              </div>
            ) : pending.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No pending submissions</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Pending Submissions</h2>
                <div className="space-y-6">
                  {pending.map((s) => (
                    <div
                      key={s.id}
                      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {s.drafts?.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Version {s.draft_versions?.version_number || "N/A"} •{" "}
                        {new Date(s.submitted_at).toLocaleString()}
                      </p>

                      {/* ✅ Link to review page */}
                      <Link
                        href={`/dashboard/hod/review/${s.id}`}
                        className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        View Draft
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
