"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function ContentGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResult(data.content);
    } catch (err) {
      console.error("Generation error:", err);
      setResult(
        "⚠️ Error generating content. Make sure the backend server is running on http://localhost:8000"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!result) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("⚠️ You must be logged in to save drafts");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          title: prompt.slice(0, 50) || "Untitled Draft",
          content: result,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Draft saved successfully!");
      } else {
        alert("⚠️ Failed to save draft");
      }
    } catch (err) {
      console.error("Save draft error:", err);
      alert("⚠️ Error saving draft");
    }
  };

  const handleOpenEditor = async () => {
    if (!result) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("⚠️ You must be logged in to open the editor");
        return;
      }

      // Save draft before redirect
      const { data, error } = await supabase
        .from("drafts")
        .insert([
          {
            user_id: user.id,
            title: prompt.slice(0, 50) || "Untitled Draft",
            content: result || "",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating draft:", error);
        return;
      }

      // Redirect to editor with real draft ID
      router.push(`/dashboard/teacher/editor/${data.id}`);
    } catch (err) {
      console.error("Open editor error:", err);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">
        AI Content Generator ✨
      </h1>

      <textarea
        className="w-full border rounded-lg p-3 mb-4"
        rows={5}
        placeholder="Enter your prompt (e.g., Generate a 45-minute lesson plan on World War I)..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
      >
        {loading ? "Generating..." : "Generate Content"}
      </button>

      {result && (
        <div className="mt-6 prose prose-indigo max-w-none">
          <ReactMarkdown>{result}</ReactMarkdown>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={handleOpenEditor}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Open in Collaborative Editor
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Save Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
