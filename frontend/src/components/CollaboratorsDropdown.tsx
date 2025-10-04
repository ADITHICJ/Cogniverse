"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import { ChevronDown, Users, X } from "lucide-react";

export default function CollaboratorsDropdown({ draftId, currentUserId, ownerId }: { 
  draftId: string; 
  currentUserId: string | null;
  ownerId: string | null;
}) {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<{ id: string; name: string } | null>(null);
  const [removing, setRemoving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    setLoading(false);
  };

  useEffect(() => {
    fetchCollaborators();

    // Refresh list when collaborator is added/removed
    const handleRefresh = () => fetchCollaborators();
    window.addEventListener("collaborator-added", handleRefresh);
    window.addEventListener("collaborator-removed", handleRefresh);

    return () => {
      window.removeEventListener("collaborator-added", handleRefresh);
      window.removeEventListener("collaborator-removed", handleRefresh);
    };
  }, [draftId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRemoveClick = (collaborator: any) => {
    setCollaboratorToRemove({
      id: collaborator.id,
      name: collaborator.profiles?.full_name || collaborator.profiles?.email || "this collaborator"
    });
    setShowConfirmModal(true);
    setIsOpen(false); // Close dropdown when showing modal
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

      // Dispatch notification event
      const event = new CustomEvent("show-notification", {
        detail: { message: `${collaboratorToRemove.name} removed successfully`, type: "success" }
      });
      window.dispatchEvent(event);
      window.dispatchEvent(new Event("collaborator-removed"));
    } catch (error) {
      console.error("Error removing collaborator:", error);
      // Dispatch notification event
      const errorEvent = new CustomEvent("show-notification", {
        detail: { message: "Failed to remove collaborator. Please try again.", type: "error" }
      });
      window.dispatchEvent(errorEvent);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
      >
        <Users size={16} />
        Collaborators 
        {collaborators.length > 0 && (
          <span className="bg-white bg-opacity-20 rounded-full px-2 py-0.5 text-xs">
            {collaborators.length}
          </span>
        )}
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users size={16} />
              Collaborators ({collaborators.length})
            </h3>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
                Loading collaborators...
              </div>
            ) : collaborators.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Users size={24} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No collaborators added yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Add collaborators to start collaborative editing
                </p>
              </div>
            ) : (
              <ul className="py-2">
                {collaborators.map((collaborator) => (
                  <li
                    key={collaborator.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {(collaborator.profiles?.full_name || collaborator.profiles?.email || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {collaborator.profiles?.full_name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {collaborator.profiles?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {currentUserId === ownerId && (
                      <button
                        onClick={() => handleRemoveClick(collaborator)}
                        className="ml-3 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                        title="Remove collaborator"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {collaborators.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              {currentUserId === ownerId 
                ? "Click the × icon to remove a collaborator" 
                : "Only the document owner can remove collaborators"
              }
            </div>
          )}
        </div>
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
