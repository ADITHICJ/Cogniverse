"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import UnderlineExtension from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import { useRoom } from "@liveblocks/react";
import { useEffect, useState, useRef } from "react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import * as Y from "yjs";
import TurndownService from "turndown";
import { marked } from "marked";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Save,
  RemoveFormatting,
  Type,
} from "lucide-react";

type LocalUser = {
  id: string;
  name: string;
  color: string;
};

// ✅ Toolbar Component
const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
      {/* Formatting */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("bold") ? "bg-blue-100 text-blue-600" : ""
          }`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("italic") ? "bg-blue-100 text-blue-600" : ""
          }`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("underline") ? "bg-blue-100 text-blue-600" : ""
          }`}
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("strike") ? "bg-blue-100 text-blue-600" : ""
          }`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("highlight") ? "bg-yellow-100 text-yellow-600" : ""
          }`}
          title="Highlight"
        >
          <Highlighter size={16} />
        </button>
      </div>

      {/* Headings & Paragraph */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 text-sm font-medium ${
            editor.isActive("paragraph")
              ? "bg-blue-100 text-blue-600"
              : ""
          }`}
          title="Paragraph"
        >
          P
        </button>
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 text-sm font-medium ${
              editor.isActive("heading", { level })
                ? "bg-blue-100 text-blue-600"
                : ""
            }`}
            title={`Heading ${level}`}
          >
            H{level}
          </button>
        ))}
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("bulletList") ? "bg-blue-100 text-blue-600" : ""
          }`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("orderedList") ? "bg-blue-100 text-blue-600" : ""
          }`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("blockquote") ? "bg-blue-100 text-blue-600" : ""
          }`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: "left" }) || (!editor.isActive({ textAlign: "center" }) && !editor.isActive({ textAlign: "right" }))
              ? "bg-blue-100 text-blue-600"
              : ""
          }`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: "center" })
              ? "bg-blue-100 text-blue-600"
              : ""
          }`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: "right" })
              ? "bg-blue-100 text-blue-600"
              : ""
          }`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Clear Formatting */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Clear Formatting"
        >
          <RemoveFormatting size={16} />
        </button>
      </div>

      {/* Undo / Redo */}
      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>
    </div>
  );
};

// ✅ Final Collaborative Editor
export default function CollaborativeEditor({
  roomId,
  initialContent,
  localUser,
}: {
  roomId: string;
  initialContent?: string;
  localUser?: LocalUser | null;
}) {
  console.log("🔄 CollaborativeEditor render:", {
    roomId,
    hasInitialContent: !!initialContent,
    initialContentLength: initialContent?.length || 0,
    initialContentPreview: initialContent?.substring(0, 100),
    localUser: localUser?.name || "none"
  });
  
  const room = useRoom();
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("connecting");
  const initContentRef = useRef<string | undefined>(undefined);

  // Initialize provider
  useEffect(() => {
    if (room && ydoc && !provider) {
      console.log("🔗 Creating Liveblocks provider for room:", roomId);
      
      try {
        const yProvider = new LiveblocksYjsProvider(room, ydoc);
        console.log("✅ Provider created successfully");
        
        yProvider.on('status', ({ status }: { status: string }) => {
          console.log("📡 Provider status:", status);
          setConnectionStatus(status);
        });
        
        yProvider.on('sync', (synced: boolean) => {
          console.log("🔄 Provider synced:", synced);
          if (synced) {
            setConnectionStatus("connected");
          }
        });
        
        setProvider(yProvider);
        
        return () => {
          console.log("🔌 Destroying provider");
          yProvider.destroy();
        };
      } catch (error) {
        console.error("❌ Failed to create provider:", error);
        setConnectionStatus("error");
      }
    }
  }, [room, ydoc, provider, roomId]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ 
          history: false, // Disable history since we're using collaboration
        }),
        Collaboration.configure({
          document: ydoc,
          field: 'default',
        }),
        ...(provider && localUser
          ? [
              CollaborationCursor.configure({
                provider: provider,
                user: {
                  name: localUser.name,
                  color: localUser.color,
                },
              }),
            ]
          : []),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Highlight.configure({ multicolor: true }),
        Typography,
        UnderlineExtension,
        CharacterCount.configure({
          limit: 10000,
        }),
      ],
      editorProps: {
        attributes: {
          class:
            "prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6 leading-relaxed",
          style: 'font-family: "Inter", sans-serif;',
        },
      },
      onCreate: ({ editor }) => {
        console.log("📝 Editor created for user:", localUser?.name, "in room:", roomId);
        console.log("🔧 Editor extensions:", editor.extensionManager.extensions.map(ext => ext.name));
      },
      onUpdate: ({ editor, transaction }) => {
        const isRemote = transaction.getMeta('y-sync$') !== undefined;
        console.log("✏️ Editor updated:", {
          contentLength: editor.getHTML().length,
          isRemote,
          user: localUser?.name || "unknown"
        });

        if (!isRemote) {
          console.log("📤 Local change detected");
        } else {
          console.log("📥 Remote change received");
        }
      },
    },
    [ydoc, provider, localUser?.id, roomId]
  );

  // Set initial content when editor and provider are ready
  useEffect(() => {
    if (editor && provider && initialContent && initialContent.trim() !== "") {
      const contentKey = roomId;
      
      if (initContentRef.current === contentKey) {
        console.log("📄 Content already initialized for room:", roomId);
        return;
      }
      
      const handleSync = () => {
        if (initContentRef.current === contentKey) return;
        
        const fragment = ydoc.getXmlFragment("default");
        const editorContent = editor.getHTML().replace(/<\/?[^>]+(>|$)/g, "").trim();
        
        if (fragment.length === 0 || editorContent === "") {
          console.log("📝 Setting initial content");
          initContentRef.current = contentKey;
          
          try {
            const htmlContent = marked(initialContent);
            editor.commands.setContent(htmlContent, false);
            console.log("✅ Initial content set");
          } catch (error) {
            console.error("❌ Error setting initial content:", error);
          }
        } else {
          console.log("📄 Document already has content");
          initContentRef.current = contentKey;
        }
      };

      provider.on('sync', handleSync);
      
      if (provider.synced) {
        handleSync();
      }

      return () => {
        provider.off('sync', handleSync);
      };
    }
  }, [editor, provider, ydoc, roomId, initialContent]);

  // Listen for version-saved events from other collaborators
  useEffect(() => {
    if (room) {
      console.log("🎧 Setting up version-saved event listener");
      
      const unsubscribe = room.subscribe("event", ({ event }: any) => {
        if (event.type === "version-saved") {
          console.log("📢 Received version-saved event from collaborator:", {
            version: event.version,
            savedBy: event.savedBy,
            timestamp: event.timestamp
          });
          
          // Dispatch local event to trigger UI updates (like version history refresh)
          window.dispatchEvent(new CustomEvent("collaborative-version-saved", {
            detail: {
              version: event.version,
              savedBy: event.savedBy,
              timestamp: event.timestamp
            }
          }));
        }
      });

      return () => {
        console.log("🔇 Cleaning up version-saved event listener");
        unsubscribe();
      };
    }
  }, [room]);

  // Listen for save trigger from header button
  useEffect(() => {
    const handleSaveTrigger = () => {
      handleSave();
    };

    window.addEventListener("trigger-save", handleSaveTrigger);
    
    return () => {
      window.removeEventListener("trigger-save", handleSaveTrigger);
    };
  }, [editor, room, localUser]);

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    
    // Notify parent component that saving has started
    window.dispatchEvent(new CustomEvent("save-state-change", { detail: { saving: true } }));
    
    try {
      const htmlContent = editor.getHTML();
      const turndownService = new TurndownService();
      const markdownContent = turndownService.turndown(htmlContent);
      const draftId = roomId.replace("draft-", "");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/drafts/${draftId}/save_version`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: markdownContent }),
        }
      );
      const data = await res.json();
      console.log("Saved version:", data.version);
      
      // Broadcast version save event to all collaborators
      if (room) {
        room.broadcastEvent({
          type: "version-saved",
          version: data.version,
          timestamp: new Date().toISOString(),
          savedBy: localUser?.name || "Unknown user"
        });
      }
      
      // Local event for the current user
      window.dispatchEvent(new Event("version-saved"));
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
      // Notify parent component that saving has finished
      window.dispatchEvent(new CustomEvent("save-state-change", { detail: { saving: false } }));
    }
  };

  if (!editor)
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading collaborative editor...</p>
        </div>
      </div>
    );

  return (
    <>
      {/* Cursor styles */}
      <style jsx global>{`
        .collaboration-cursor__caret {
          position: relative;
          margin-left: -1px;
          margin-right: -1px;
          border-left: 1px solid #0D0D0D;
          border-right: 1px solid #0D0D0D;
          word-break: normal;
          pointer-events: none;
        }
        
        .collaboration-cursor__label {
          position: absolute;
          top: -1.4em;
          left: -1px;
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          line-height: normal;
          user-select: none;
          color: #fff;
          padding: 0.1rem 0.3rem;
          border-radius: 3px 3px 3px 0;
          white-space: nowrap;
        }
        
        .collaboration-cursor__caret::after {
          content: '';
          position: absolute;
          top: 0;
          left: -1px;
          width: 2px;
          height: 1.2em;
          background-color: inherit;
          border-color: inherit;
          animation: cursor-blink 1s infinite;
        }
        
        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        /* Selection styling for collaborators */
        .ProseMirror .collaboration-cursor__selection {
          pointer-events: none;
        }
      `}</style>
      
      <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
        {/* Toolbar */}
        <Toolbar editor={editor} />

        {/* Editor Content */}
        <div className="min-h-[600px] bg-white">
          <EditorContent editor={editor} />
        </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t text-xs text-gray-500 flex justify-between items-center">
        <div>
          {editor.storage.characterCount?.characters() || 0} characters •{" "}
          {editor.storage.characterCount?.words() || 0} words
        </div>
        <div className="flex items-center gap-4">
          <span>Connection: {connectionStatus}</span>
          <div className="flex items-center gap-1">
            <span>Room: {roomId.replace('draft-', '')}</span>
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' 
                  ? "bg-green-500" 
                  : connectionStatus === 'connecting'
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
              }`}
            ></div>
          </div>
        </div>
        
        {/* Debug Panel - Remove in production */}
        <div className="bg-gray-100 px-4 py-2 border-t text-xs">
          <details>
            <summary className="cursor-pointer font-semibold">Debug Info</summary>
            <div className="mt-2 space-y-1">
              <div>Room ID: {roomId}</div>
              <div>Provider: {provider ? '✅' : '❌'}</div>
              <div>Editor: {editor ? '✅' : '❌'}</div>
              <div>Local User: {localUser?.name || 'none'}</div>
              <div>Connection Status: {connectionStatus}</div>
              <div>Has Initial Content: {!!initialContent}</div>
              <div>Initial Content Length: {initialContent?.length || 0}</div>
              <div>Provider Synced: {provider?.synced ? '✅' : '❌'}</div>
              <div>Fragment Length: {ydoc ? ydoc.getXmlFragment('default').length : 0}</div>
              <div>Init Content Ref: {initContentRef.current || 'none'}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
    </>
  );
}