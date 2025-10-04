"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { showNotification, notifications } from "@/utils/notifications";
import NotificationToast from "@/components/NotificationToast";

export default function CreateTemplatePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showNotification("Please log in to create templates", "error");
      return;
    }

    // ✅ Insert into user_templates instead of templates
    const { error } = await supabase
      .from("user_templates")
      .insert([{ user_id: user.id, title, content }]);

    if (error) {
      console.error("Error saving template:", error);
      showNotification(notifications.templates.saveFailed, "error");
    } else {
      showNotification(notifications.templates.saveSuccess, "success");
      router.push("/dashboard/teacher/templates");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">➕ Create Template</h1>

      {/* Title Input */}
      <input
        type="text"
        placeholder="Template Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

      {/* Content Input */}
      <textarea
        placeholder="Enter template content (lesson structure, steps, etc.)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border p-3 rounded mb-4"
        rows={8}
      />

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Save Template
      </button>

      <NotificationToast />
    </div>
  );
}
