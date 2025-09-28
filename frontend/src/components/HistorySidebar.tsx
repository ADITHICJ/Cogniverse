"use client";

import { useEffect, useState } from "react";

export default function HistorySidebar({ draftId }: { draftId: string }) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/drafts/${draftId}/versions`;
        console.log("🔄 Fetching versions from:", url);
        
        const res = await fetch(url);
        console.log("📡 Response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Server error:", errorText);
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const text = await res.text();
        console.log("📄 Raw response text:", text);
        const data = JSON.parse(text);

        console.log("📊 Fetched versions:", data);
        setVersions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching versions:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (draftId) {
      fetchVersions();
    }

    const handleVersionSaved = () => fetchVersions();
    window.addEventListener("version-saved", handleVersionSaved);

    return () => {
      window.removeEventListener("version-saved", handleVersionSaved);
    };
  }, [draftId]);

  if (loading) return (
    <div className="p-4">
      <h3 className="font-semibold mb-3 text-gray-800">History</h3>
      <p className="text-gray-500">Loading history...</p>
    </div>
  );

  if (error) return (
    <div className="p-4">
      <h3 className="font-semibold mb-3 text-gray-800">History</h3>
      <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
        <p className="text-sm font-medium">Error loading history</p>
        <p className="text-xs mt-1">{error}</p>
        <p className="text-xs mt-1">Draft ID: {draftId}</p>
      </div>
    </div>
  );

  return (
    <aside className="p-4">
      <h3 className="font-semibold mb-3 text-gray-800">History</h3>
      
      {versions.length === 0 ? (
        <div className="p-3 border border-dashed border-gray-300 rounded text-center text-gray-500">
          <p className="text-sm">No versions saved yet</p>
          <p className="text-xs mt-1">Save your changes to create version history</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {versions.map((v) => (
            <li key={v.id} className="p-3 border rounded bg-white shadow-sm">
              <p className="text-sm font-medium">Version {v.version_number}</p>
              <p className="text-xs text-gray-500">
                {new Date(v.created_at).toLocaleString()}
              </p>
              <button
                className="mt-2 text-xs text-blue-600 underline"
                onClick={() => alert(v.content)} // TODO: Add "Restore" later
              >
                View
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
