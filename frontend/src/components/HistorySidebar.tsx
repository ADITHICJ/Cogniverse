"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const VersionModal = dynamic(() => import("./VersionModal"), { ssr: false });

export default function HistorySidebar({ draftId }: { draftId: string }) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchVersions = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/drafts/${draftId}/draft_versions`;
      console.log("🔄 Fetching versions from:", url);
      
      const res = await fetch(url);
      console.log("📡 Response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
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

  useEffect(() => {
    if (draftId) {
      fetchVersions();
    }

    const handleVersionSaved = () => fetchVersions();
    window.addEventListener("version-saved", handleVersionSaved);

    return () => {
      window.removeEventListener("version-saved", handleVersionSaved);
    };
  }, [draftId]);

  const handleView = (version: any) => {
    setSelectedVersion(version);
  };

  const handleRestore = (version: any) => {
    setSelectedVersion(version);
    setIsRestoring(true);
  };

  const confirmRestore = async (versionId: string) => {
    if (!confirm("Are you sure you want to restore this version? This will delete all newer versions.")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/drafts/${draftId}/versions/${versionId}/restore`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to restore version");
      }

      // Refetch versions and notify the editor to reload content
      fetchVersions();
      window.dispatchEvent(new Event("content-restored"));
      setSelectedVersion(null);
      setIsRestoring(false);
    } catch (err) {
      console.error("Restore error:", err);
      alert("Failed to restore version.");
    }
  };

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
            <div className="mt-3 flex items-center gap-3">
              <button
                className="text-xs text-blue-600 underline"
                onClick={() => handleView(v)}
              >
                View
              </button>
              <button
                className="text-xs text-green-600 underline"
                onClick={() => handleRestore(v)}
              >
                Restore
              </button>

            </div>
          </li>
        ))}
      </ul>
      )}

      {selectedVersion && (
        <VersionModal
          version={selectedVersion}
          onClose={() => {
            setSelectedVersion(null);
            setIsRestoring(false);
          }}
          isRestoring={isRestoring}
          onConfirmRestore={() => confirmRestore(selectedVersion.id)}
          totalVersions={versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) : 0}
        />
      )}
    </aside>
  );
}