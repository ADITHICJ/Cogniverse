"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import TopBar from "@/components/Topbar";

export default function SharedPage() {
  const [shared, setShared] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShared = async () => {
      setLoading(true);

      const { data: userResp } = await supabase.auth.getUser();
      const uid = userResp?.user?.id;
      if (!uid) {
        setShared([]);
        setLoading(false);
        return;
      }

      try {
        // 1. Drafts where user is a collaborator
        const { data, error } = await supabase
          .from("draft_collaborators")
          .select("drafts(id, title, user_id, updated_at)")
          .eq("user_id", uid);

        if (error) throw error;

        const drafts = (data || []).map((c: any) => c.drafts).filter(Boolean);

        // ✅ Deduplicate drafts
        const uniqueDrafts = Array.from(
          new Map(drafts.map((d: any) => [d.id, d])).values()
        );

        // 2. Fetch owner profiles
        const ownerIds = [...new Set(uniqueDrafts.map((d: any) => d.user_id))];
        let owners: any[] = [];
        if (ownerIds.length > 0) {
          const { data: ownerProfiles, error: ownerError } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", ownerIds);

          if (ownerError) throw ownerError;
          owners = ownerProfiles || [];
        }

        // 3. Merge owner info into drafts
        const draftsWithOwners = uniqueDrafts.map((d: any) => ({
          ...d,
          owner: owners.find((o: any) => o.id === d.user_id),
        }));

        // 4. Sort by most recent first (updated_at descending)
        const sortedDrafts = draftsWithOwners.sort((a: any, b: any) => {
          const dateA = new Date(a.updated_at).getTime();
          const dateB = new Date(b.updated_at).getTime();
          return dateB - dateA; // Most recent first
        });

        setShared(sortedDrafts);
      } catch (err) {
        console.error("Error fetching collaborator drafts:", err);
        setShared([]);
      }

      setLoading(false);
    };

    fetchShared();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <TopBar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading shared drafts...</p>
        </div>
      </div>
    </div>
  );
  
  if (shared.length === 0) return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <TopBar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No shared drafts yet</h2>
          <p className="text-gray-600 dark:text-gray-300">Drafts shared with you will appear here.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <TopBar />
      
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">📄 Shared with You</h1>
          <div className="text-sm text-gray-600">
            {shared.length} draft{shared.length !== 1 ? 's' : ''} shared
          </div>
        </div>
        <ul className="space-y-4">
          {shared.map((d) => (
            <li
              key={d.id}
              className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition"
            >
              <Link
                href={`/dashboard/teacher/editor/${d.id}`}
                className="block"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {d.title || "Untitled Draft"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Owner: {d.owner?.full_name || d.owner?.email || "Unknown"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Last updated: {new Date(d.updated_at).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}