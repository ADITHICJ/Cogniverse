"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ContentGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );

      const data = await res.json();
      setResult(data.content);
    } catch (err) {
      console.error(err);
      setResult("⚠️ Error generating content");
    } finally {
      setLoading(false);
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
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Open in Collaborative Editor
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Save Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
