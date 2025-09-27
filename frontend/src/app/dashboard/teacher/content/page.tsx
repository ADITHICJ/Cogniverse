"use client";

import { useState } from "react";

export default function ContentGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

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
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 whitespace-pre-line">
          {result}
        </div>
      )}
    </div>
  );
}
