"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { showNotification } from "@/utils/notifications";

export default function AddCollaboratorModal({
  draftId,
  onClose,
}: {
  draftId: string;
  onClose: () => void;
}) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkTable = async () => {
      const { error } = await supabase.from("draft_collaborators").select("*").limit(0);

      if (error && error.message.includes('relation "draft_collaborators" does not exist')) {
        console.warn(
          "⚠️ The 'draft_collaborators' table does not exist. Please create it to add collaborators."
        );
      } else if (error) {
        console.error("Error checking for draft_collaborators table:", error);
      }
    };

    const fetchTeachers = async () => {
      // Get current user ID to exclude from the list
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // Get draft owner ID to also exclude from the list
      const { data: draftData } = await supabase
        .from("drafts")
        .select("user_id")
        .eq("id", draftId)
        .single();
      
      const draftOwnerId = draftData?.user_id;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "teacher");

      if (error) {
        console.error("Error fetching teachers:", error);
      } else {
        // Filter out current user and draft owner
        const filteredTeachers = (data || []).filter(
          (teacher) => teacher.id !== currentUserId && teacher.id !== draftOwnerId
        );
        setTeachers(filteredTeachers);
      }
    };

    checkTable();
    fetchTeachers();
  }, [draftId]);

  const handleAdd = async () => {
    // This function requires the 'draft_collaborators' table to exist.
    if (!selectedTeacher) return;
    setLoading(true);

    const { error } = await supabase.from("draft_collaborators").insert([
      {
        draft_id: draftId,
        user_id: selectedTeacher,
      },
    ]);

    setLoading(false);

    if (error) {
      showNotification("Error adding collaborator. Please try again.", "error");
      console.error("Error details:", error);
    } else {
      showNotification("Collaborator added successfully!", "success");
      onClose();
      window.dispatchEvent(new Event("collaborator-added"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Add Collaborator</h2>

        {/* Teacher Dropdown */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Teacher
        </label>
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        >
          <option value="">-- Choose a teacher --</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.full_name || "Unnamed"} ({teacher.email})
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedTeacher || loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
