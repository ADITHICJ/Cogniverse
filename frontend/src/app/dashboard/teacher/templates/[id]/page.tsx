"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function EditTemplatePage() {
  const params = useParams();
  const templateId = params.id as string;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchTemplate = async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (error) console.error("Error fetching template:", error);
      else {
        setTitle(data.title);
        setContent(data.content);
      }
    };
    fetchTemplate();
  }, [templateId]);

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("templates")
      .update({ title, content })
      .eq("id", templateId);

    if (error) {
      console.error("Error updating template:", error);
      alert("❌ Failed to update template");
    } else {
      router.push("/dashboard/teacher/templates");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">✏️ Edit Template</h1>
      <input
        type="text"
        placeholder="Template Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border p-3 rounded mb-4"
        rows={8}
      />
      <button
        onClick={handleUpdate}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Update Template
      </button>
    </div>
  );
}
