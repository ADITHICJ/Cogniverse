"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function EditorPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleNewDraft = async () => {
    setIsCreating(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to create a draft.");
      }

      // Create a new draft in the database
      const { data, error } = await supabase
        .from("drafts")
        .insert({ title: "Untitled Draft", user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Redirect to the new draft's editor page
      router.push(`/dashboard/teacher/editor/${data.id}`);
    } catch (error) {
      console.error("Error creating new draft:", error);
      alert("Failed to create a new draft.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-4">Editor</h1>
      <p className="text-gray-600 mb-8">Select a draft from the sidebar or create a new one.</p>
      <button
        onClick={handleNewDraft}
        disabled={isCreating}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isCreating ? "Creating..." : "New Draft"}
      </button>
    </div>
  );
}
