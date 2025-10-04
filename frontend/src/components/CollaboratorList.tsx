"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { showNotification } from "@/utils/notifications";

export default function CollaboratorList({ draftId }: { draftId: string }) {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<{ id: string; name: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  const fetchCollaborators = async () => {
    // Get collaborators
    const { data, error } = await supabase
      .from("draft_collaborators")
      .select("id, user_id, profiles(full_name, email)")
      .eq("draft_id", draftId);

    if (error) {
      console.error("Error fetching collaborators:", error);
      setCollaborators([]);
    } else {
      setCollaborators(data || []);
    }

    // Get draft owner
    const { data: draftData, error: draftError } = await supabase
      .from("drafts")
      .select("user_id")
      .eq("id", draftId)
      .single();

    if (!draftError && draftData) {
      setOwnerId(draftData.user_id);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCollaborators();

    // get logged-in user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();

    // Refresh list when collaborator is added/removed
    const handleRefresh = () => fetchCollaborators();
    window.addEventListener("collaborator-added", handleRefresh);
    window.addEventListener("collaborator-removed", handleRefresh);

    return () => {
      window.removeEventListener("collaborator-added", handleRefresh);
      window.removeEventListener("collaborator-removed", handleRefresh);
    };
  }, [draftId]);

  const handleRemoveClick = (collaborator: any) => {
    setCollaboratorToRemove({
      id: collaborator.id,
      name: collaborator.profiles?.full_name || "Unknown User"
    });
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!collaboratorToRemove) return;
    
    setRemoving(true);
    
    try {
      const { error } = await supabase
        .from("draft_collaborators")
        .delete()
        .eq("id", collaboratorToRemove.id);

      if (error) {
        throw error;
      }

      showNotification("Collaborator removed successfully", "success");
      window.dispatchEvent(new Event("collaborator-removed"));
    } catch (error) {
      console.error("Error removing collaborator:", error);
      showNotification("Failed to remove collaborator. Please try again.", "error");
    } finally {
      setRemoving(false);
      setShowConfirmModal(false);
      setCollaboratorToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setShowConfirmModal(false);
    setCollaboratorToRemove(null);
  };

  if (loading) return <p>Loading collaborators...</p>;

  return (
    <div className="mt-4">
      <h3 className="font-medium">Collaborators (Editors)</h3>
      {collaborators.length === 0 ? (
        <p className="text-sm text-gray-500">No collaborators added yet.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {collaborators.map((c) => (
            <li
              key={c.id}
              className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md"
            >
              <span>
                {c.profiles?.full_name || "Unknown User"} ({c.profiles?.email})
              </span>
              {currentUserId === ownerId && (
                <button
                  onClick={() => handleRemoveClick(c)}
                  className="text-red-600 hover:text-red-800 text-xs font-medium"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Remove Collaborator
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to remove <span className="font-medium">{collaboratorToRemove?.name}</span> as a collaborator? They will lose access to edit this draft.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelRemove}
                disabled={removing}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={removing}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {removing ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
