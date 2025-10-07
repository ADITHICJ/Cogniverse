"use client";

import { useEffect, useState } from "react";
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
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/drafts/${draftId}/versions`;
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

      await fetchVersions();
      window.dispatchEvent(new Event("content-restored"));
      setSelectedVersion(null);
      setIsRestoring(false);
      
      const event = new CustomEvent("show-notification", {
        detail: { message: "Version restored successfully!", type: "success" }
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Restore error:", err);
      const event = new CustomEvent("show-notification", {
        detail: { message: "Failed to restore version", type: "error" }
      });
      window.dispatchEvent(event);
    }
  };

  if (loading) {
    return (
      <aside className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 h-full">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Version History</h3>
        </div>
        <div className="flex flex-col items-center justify-center space-y-3 py-8">
          <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Loading history...</p>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 h-full">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Version History</h3>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">Error loading history</p>
              <p className="text-xs text-red-700 dark:text-red-200 mt-1">{error}</p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">Draft ID: {draftId}</p>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="p-3 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 h-full">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Version History</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{versions.length} versions saved</p>
      </div>

      {versions.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 sm:p-6 text-center bg-white/50 dark:bg-gray-800/50">
          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 sm:w-6 h-5 sm:h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No versions saved yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Save your changes to create version history</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 dark:from-blue-600 via-blue-300 dark:via-blue-700 to-transparent"></div>
          
          <ul className="space-y-3 sm:space-y-4 relative">
            {versions.map((v, index) => (
              <li 
                key={v.id} 
                className="relative pl-8 sm:pl-10 group"
              >
                <div className="absolute left-0 top-2 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg flex items-center justify-center ring-4 ring-gray-50 dark:ring-gray-800 transition-all duration-300 group-hover:ring-blue-100 dark:group-hover:ring-blue-900 group-hover:scale-110">
                  <span className="text-white text-xs font-bold">{v.version_number}</span>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Version {v.version_number}
                    </p>
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-medium rounded-full shadow-sm">
                        Latest
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(v.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  
                  <div className="flex gap-1.5 sm:gap-2 mt-3">
                    <button
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 group/btn"
                      onClick={() => handleView(v)}
                    >
                      <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform duration-200 group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    
                    <button
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 group/restore"
                      onClick={() => handleRestore(v)}
                    >
                      <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform duration-200 group-hover/restore:rotate-[-360deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Restore
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedVersion && (
        <VersionModal
          version={selectedVersion}
          onClose={() => {
            setSelectedVersion(null);
            setIsRestoring(false);
          }}
          isRestoring={isRestoring}
          onConfirmRestore={() => { confirmRestore(selectedVersion.id); }}
          totalVersions={versions.length}
        />
      )}
    </aside>
  );
}