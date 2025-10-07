"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import CollaborativeEditor from "@/components/CollaborativeEditor";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import HistorySidebar from "@/components/HistorySidebar";
import AddCollaboratorModal from "./AddCollaboratorModal";
import CollaboratorsDropdown from "@/components/CollaboratorsDropdown";
import NotificationToast from "@/components/NotificationToast";
import SubmissionModal from "./SubmissionModal";
import { showNotification } from "@/utils/notifications";

export default function EditorPage() {
  const params = useParams();
  const draftId = params.id as string;

  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [localUser, setLocalUser] = useState<{ id: string; name: string; color: string } | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  const fetchDraft = async () => {
    const { data, error } = await supabase
      .from("drafts")
      .select("*")
      .eq("id", draftId)
      .single();

    if (!error && data) {
      setDraft(data);
      setOwnerId(data.user_id);
      setTitleValue(data.title || "Untitled");
    }
    setLoading(false);
  };

  const updateTitle = async (newTitle: string) => {
    if (!newTitle.trim()) {
      newTitle = "Untitled";
    }

    const { error } = await supabase
      .from("drafts")
      .update({ title: newTitle })
      .eq("id", draftId);

    if (!error) {
      setDraft({ ...draft, title: newTitle });
      setTitleValue(newTitle);
    } else {
      console.error("Error updating title:", error);
      showNotification("Failed to update title. Please try again.", "error");
    }
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    updateTitle(titleValue);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTitleValue(draft?.title || "Untitled");
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      handleTitleCancel();
    }
  };

  const handleSave = () => {
    // Trigger save event for the collaborative editor
    window.dispatchEvent(new Event("trigger-save"));
  };

  useEffect(() => {
    fetchDraft();

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        const name = profile?.full_name || user.email || "Anonymous";
        
        // Generate a more diverse color using multiple hash functions
        const generateUserColor = (userId: string) => {
          // Use multiple parts of the UUID for better distribution
          const part1 = userId.slice(0, 8);
          const part2 = userId.slice(8, 16);
          const part3 = userId.slice(16, 24);
          
          // Create multiple hash values
          const hash1 = [...part1].reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const hash2 = [...part2].reduce((acc, c) => acc * 31 + c.charCodeAt(0), 1);
          const hash3 = [...part3].reduce((acc, c) => acc ^ c.charCodeAt(0), 0);
          
          // Combine hashes for better distribution
          const combinedHash = (hash1 * 7) + (hash2 * 13) + (hash3 * 17);
          
          // Generate hue with better distribution (avoid similar colors)
          const hue = Math.abs(combinedHash) % 360;
          
          // Ensure distinct colors by avoiding green range if too close
          let finalHue = hue;
          if (hue >= 90 && hue <= 150) { // Avoid green range
            finalHue = (hue + 180) % 360; // Shift to opposite side
          }
          
          // Use varied saturation and lightness for more distinction
          const saturation = 65 + (Math.abs(hash2) % 25); // 65-90%
          const lightness = 45 + (Math.abs(hash3) % 15);  // 45-60%
          
          return `hsl(${finalHue}, ${saturation}%, ${lightness}%)`;
        };
        
        const color = generateUserColor(user.id);

        setLocalUser({ id: user.id, name, color });
      }
    };

    getUser();

    // Listen for save state changes from CollaborativeEditor
    const handleSaveStateChange = (e: CustomEvent) => {
      setIsSaving(e.detail.saving);
    };

    window.addEventListener("save-state-change", handleSaveStateChange as EventListener);
    
    return () => {
      window.removeEventListener("save-state-change", handleSaveStateChange as EventListener);
    };
  }, [draftId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading draft...</p>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-md border dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Draft not found</h2>
          <p className="text-gray-600 dark:text-gray-300">The document you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const roomId = `draft-${draft.id}`;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <NotificationToast />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
  <div className="px-3 sm:px-6 py-4">
    {/* Title */}
    <div>
      <div className="flex items-center gap-3 flex-1">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={handleTitleKeyPress}
              className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 dark:border-blue-400 outline-none px-2 py-1 min-w-0 flex-1 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Enter title..."
              autoFocus
            />
            <button
              onClick={handleTitleSave}
              className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
              title="Save"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleTitleCancel}
              className="p-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
              title="Cancel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={handleTitleEdit}
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {draft?.title || "Untitled"}
            </h1>
            <svg
              className="w-5 h-5 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Status information below title */}
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${
            currentUserId ? "bg-green-500" : "bg-red-500"
          }`}></span>
          Status: {currentUserId ? "Connected" : "Disconnected"}
        </span>
        <span>Room ID: {roomId}</span>
        {localUser && (
          <span className="flex items-center gap-1">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: localUser.color }}
            ></span>
            {localUser.name}
          </span>
        )}
      </div>

      {/* Action buttons section */}
      <div className="flex justify-between items-center gap-3 mt-4">
        {/* Version History Toggle - Mobile Only */}
        <button
          onClick={() => setIsVersionHistoryOpen(!isVersionHistoryOpen)}
          className="lg:hidden px-3 sm:px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          History
        </button>

        <div className="flex gap-3">
          {/* Show collaborators dropdown for all users */}
          <CollaboratorsDropdown 
            draftId={draft.id} 
            currentUserId={currentUserId}
            ownerId={ownerId}
          />

          {/* Save button - available to all users */}
          <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 sm:px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 text-sm sm:text-base"
        >
          <svg
            className="w-4 h-4 inline-block mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {isSaving ? "Saving..." : "Save"}
        </button>

        {/* Owner-only buttons */}
        {currentUserId === ownerId && (
          <>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 sm:px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 inline-block mr-1"
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
              Add Collaborator
            </button>

            <button
              onClick={() => setShowSubmission(true)}
              className="px-3 sm:px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 inline-block mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Submit for Approval
            </button>
          </>
        )}
        </div>
      </div>
    </div>
  </div>
</header>


        {/* Editor Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-6">
          {localUser ? (
            <RoomProvider 
              id={roomId} 
              initialPresence={{ cursor: null, user: localUser }}
            >
              <ClientSideSuspense
                fallback={
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-8 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                      <div>
                        <div className="text-lg font-semibold text-blue-900">
                          Loading collaborative editor...
                        </div>
                        <div className="text-sm text-blue-700 mt-1">
                          Connecting to room: {roomId}
                        </div>
                      </div>
                    </div>
                  </div>
                }
              >
                <CollaborativeEditor
                  roomId={roomId}
                  initialContent={draft.content}
                  localUser={localUser}
                />
              </ClientSideSuspense>
            </RoomProvider>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin"></div>
                <div>
                  <div className="text-lg font-semibold text-yellow-900">
                    Authenticating user...
                  </div>
                  <div className="text-sm text-yellow-700 mt-1">
                    Please wait while we set up your collaboration session
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Version History */}
      {/* Desktop: Always visible */}
      <div className="hidden lg:block w-80 border-l border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-auto">
        <HistorySidebar draftId={draft.id} />
      </div>

      {/* Mobile: Overlay when toggled */}
      {isVersionHistoryOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm touch-manipulation"
            onClick={() => setIsVersionHistoryOpen(false)}
          />
          {/* Sidebar */}
          <div className="w-80 max-w-[85vw] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col">
            {/* Close button */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Version History</h3>
              <button
                onClick={() => setIsVersionHistoryOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors touch-manipulation"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto overscroll-contain">
              <HistorySidebar draftId={draft.id} />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && currentUserId === ownerId && (
        <AddCollaboratorModal draftId={draft.id} onClose={() => setShowModal(false)} />
      )}

      {showSubmission && currentUserId === ownerId && (
        <SubmissionModal
          draftId={draft.id}
          onClose={() => setShowSubmission(false)}
          onSubmitted={() => {
            setShowSubmission(false);
          }}
        />
      )}
    </div>
  );
}
