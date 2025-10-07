"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import TopBar from "@/components/Topbar";
import { showNotification } from "@/utils/notifications";
import NotificationToast from "@/components/NotificationToast";

export default function ContentGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [draftTitle, setDraftTitle] = useState("Untitled");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const router = useRouter();

  // ✅ Fetch only user_templates
  useEffect(() => {
    const fetchTemplates = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_templates")
        .select("id, title, content")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching templates:", error);
      } else {
        setTemplates(data || []);

        // ✅ Auto-select template if coming from “Use Template”
        const storedTemplateId = localStorage.getItem("selectedTemplateId");
        if (storedTemplateId && data?.some((t) => t.id === storedTemplateId)) {
          setSelectedTemplate(storedTemplateId);
          localStorage.removeItem("selectedTemplateId");
        }
      }
    };

    fetchTemplates();
  }, []);

  // ✅ Generate content using backend
  const handleGenerate = async () => {
    setLoading(true);
    setResult("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!backendUrl) {
        console.error("❌ Missing NEXT_PUBLIC_BACKEND_URL in environment");
        setResult("⚠️ Backend URL not configured. Please check deployment settings.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${backendUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          additional_ctx: selectedTemplate
            ? templates.find((t) => t.id === selectedTemplate)?.content
            : "",
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResult(data.content);
    } catch (err) {
      console.error("❌ Generation error:", err);
      setResult(
        "⚠️ Error generating content. Please check your connection or try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save draft
  const handleSaveDraft = async () => {
    if (!result) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showNotification("You must be logged in to save drafts", "error");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          title: draftTitle.trim() || "Untitled",
          content: result,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification("Draft saved successfully!", "success");
      } else {
        showNotification("Failed to save draft. Please try again.", "error");
      }
    } catch (err) {
      console.error("❌ Save draft error:", err);
      showNotification("Error saving draft. Please try again.", "error");
    }
  };

  // ✅ Open in collaborative editor
  const handleOpenEditor = async () => {
    if (!result) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showNotification("You must be logged in to open the editor", "error");
        return;
      }

      const { data, error } = await supabase
        .from("drafts")
        .insert([
          {
            user_id: user.id,
            title: draftTitle.trim() || "Untitled",
            content: result || "",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating draft:", error);
        showNotification("Failed to create draft.", "error");
        return;
      }

      router.push(`/dashboard/teacher/editor/${data.id}`);
    } catch (err) {
      console.error("❌ Open editor error:", err);
      showNotification("Error opening editor. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <NotificationToast />
      <TopBar />

      <main className="flex-1 p-8 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
          AI Content Generator
        </h1>

        {/* Template Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
            Apply Template (optional)
          </label>
          <div className="flex gap-2">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-3"
            >
              <option value="">
                {templates.length === 0
                  ? "-- No templates available --"
                  : "-- No Template --"}
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => router.push("/dashboard/teacher/templates")}
              className="px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              title="Create new template"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
          {templates.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              You haven’t created any templates yet. Click + to add one.
            </p>
          )}
        </div>

        {/* Prompt Input */}
        <textarea
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-3 mb-4 placeholder-gray-500 dark:placeholder-gray-400"
          rows={5}
          placeholder="Enter your prompt (e.g., Generate a 45-minute lesson plan on World War I)..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Content"}
        </button>

        {/* Generated Result */}
        {result && (
          <div className="mt-8 border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 shadow-sm">
            {/* Draft title editing */}
            <div className="mb-4">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setIsEditingTitle(false);
                      else if (e.key === "Escape") {
                        setDraftTitle("Untitled");
                        setIsEditingTitle(false);
                      }
                    }}
                    className="text-xl font-semibold text-gray-800 dark:text-gray-100 bg-transparent border-b-2 border-blue-500 outline-none px-1 py-1 flex-1"
                    placeholder="Enter title..."
                    autoFocus
                  />
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setDraftTitle("Untitled");
                      setIsEditingTitle(false);
                    }}
                    className="px-2 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <h2
                  className="text-xl font-semibold text-gray-800 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {draftTitle}
                </h2>
              )}
            </div>

            <div className="prose prose-indigo dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-em:text-gray-700 dark:prose-em:text-gray-300 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-code:text-gray-900 dark:prose-code:text-gray-100 prose-li:text-gray-800 dark:prose-li:text-gray-200 prose-ul:text-gray-800 dark:prose-ul:text-gray-200 prose-ol:text-gray-800 dark:prose-ol:text-gray-200 prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-6">
              <button
                onClick={handleOpenEditor}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Open in Collaborative Editor
              </button>
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Save Draft
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
