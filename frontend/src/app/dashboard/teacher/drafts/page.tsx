"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import TopBar from "@/components/Topbar";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      // ✅ Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setDrafts([]);
        setLoading(false);
        return;
      }

      // ✅ Fetch only this teacher's drafts
      const { data, error } = await supabase
        .from("drafts")
        .select("id, title, created_at")
        .eq("user_id", user.id) // teacher filter
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching drafts:", error);
        setDrafts([]);
      } else {
        setDrafts(data || []);
      }

      setLoading(false);
    };

    fetchDrafts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <TopBar />

      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">📄 My Drafts</h1>

          {/* ✅ New Draft Button */}
          <Link
            href="/dashboard/teacher/content"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + New Draft
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading drafts...</p>
        ) : drafts.length === 0 ? (
          <p className="text-gray-600">No drafts found. Start by creating one!</p>
        ) : (
          <ul className="space-y-4">
            {drafts.map((draft) => (
              <li
                key={draft.id}
                className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition"
              >
                <Link
                  href={`/dashboard/teacher/editor/${draft.id}`}
                  className="block"
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {draft.title || "Untitled Draft"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(draft.created_at).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
