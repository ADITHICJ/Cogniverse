"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { showNotification } from "@/utils/notifications";

export default function SubmissionModal({
  draftId,
  onClose,
  onSubmitted,
}: {
  draftId: string;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const [versions, setVersions] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch available versions for this draft
  useEffect(() => {
    const fetchVersions = async () => {
      const { data, error } = await supabase
        .from("draft_versions")
        .select("id, version_number, created_at")
        .eq("draft_id", draftId)
        .order("version_number", { ascending: false });

      if (error) {
        console.error("Error fetching versions:", error);
        setVersions([]);
      } else {
        setVersions(data || []);
        if (data?.length) setSelected(data[0].id); // pick latest by default
      }
    };
    fetchVersions();
  }, [draftId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // ✅ Get logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let versionId = selected;

      // ✅ If no versions exist, create one automatically
      if (!versionId) {
        // Get the current draft content to include in the version
        const { data: draftData } = await supabase
          .from("drafts")
          .select("content")
          .eq("id", draftId)
          .single();

        // Get the next version number
        const { data: existingVersions } = await supabase
          .from("draft_versions")
          .select("version_number")
          .eq("draft_id", draftId)
          .order("version_number", { ascending: false })
          .limit(1);

        const nextVersionNumber = existingVersions?.length 
          ? (existingVersions[0].version_number || 0) + 1 
          : 1;

        const { data: newVersion, error: newVersionError } = await supabase
          .from("draft_versions")
          .insert([
            {
              draft_id: draftId,
              content: draftData?.content || "<p>No content available</p>",
              version_number: nextVersionNumber,
            },
          ])
          .select("id")
          .single();

        if (newVersionError) throw newVersionError;
        versionId = newVersion.id;
      }

      // ✅ Insert submission linked to version
      const { error } = await supabase.from("draft_submissions").insert([
        {
          draft_id: draftId,
          version_id: versionId,
          submitted_by: user.id,
          status: "pending",
        },
      ]);

      if (error) {
        console.error("❌ Submit error:", error);
        showNotification("Failed to submit for approval. Please try again.", "error");
      } else {
        showNotification("Draft submitted for approval successfully! Your HOD will be notified.", "success");
        onClose();
        onSubmitted?.();
      }
    } catch (err) {
      console.error("Unexpected submit error:", err);
      showNotification("Failed to submit. Please check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[520px]">
        <h3 className="text-lg font-semibold mb-3">
          Submit draft for HOD review
        </h3>
        <p className="text-sm mb-4">
          Choose the version you want to submit:
        </p>

        <select
          value={selected || ""}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full border p-2 mb-4"
        >
          {versions.length === 0 && (
            <option disabled>No versions available — will auto-create one</option>
          )}
          {versions.map((v) => (
            <option key={v.id} value={v.id}>
              Version {v.version_number} —{" "}
              {new Date(v.created_at).toLocaleString()}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
