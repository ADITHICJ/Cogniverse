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
// Use Yjs from the same source as LiveblocksYjsProvider
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

// ✅ Mobile-Optimized Toolbar Component
const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="border-b bg-gray-50 dark:bg-gray-800 p-2 sm:p-3 overflow-x-auto hide-scrollbar">
      <div className="flex flex-nowrap gap-1 min-w-max">
        {/* Formatting Group */}
        <div className="flex gap-0.5 sm:gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 sm:p-2 rounded-md touch-manipulation transition-colors ${
              editor.isActive("bold") 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title="Bold"
          >
            <Bold size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 sm:p-2 rounded-md touch-manipulation transition-colors ${
              editor.isActive("italic") 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title="Italic"
          >
            <Italic size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 sm:p-2 rounded-md touch-manipulation transition-colors ${
              editor.isActive("underline") 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title="Underline"
          >
            <Underline size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 sm:p-2 rounded-md touch-manipulation transition-colors ${
              editor.isActive("highlight") 
                ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" 
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title="Highlight"
          >
            <Highlighter size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Headings Group */}
        <div className="flex gap-0.5 sm:gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-2 py-1 rounded-md text-xs sm:text-sm font-medium touch-manipulation transition-colors ${
              editor.isActive("paragraph")
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            title="Paragraph"
          >
            P
          </button>
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={`px-2 py-1 rounded-md text-xs sm:text-sm font-medium touch-manipulation transition-colors ${
                editor.isActive("heading", { level })
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
              title={`Heading ${level}`}
            >
              H{level}
            </button>
          ))}
        </div>

        {/* Lists Group */}
        <div className="flex gap-0.5 sm:gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 sm:p-2 rounded-md touch-manipulation transition-colors ${
              editor.isActive("bulletList") 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title="Bullet List"
          >
            <List size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 sm:p-2 rounded-md touch-manipulation transition-colors ${
              editor.isActive("orderedList") 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title="Numbered List"
          >
            <ListOrdered size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 sm:p-2 rounded-md touch-manipulation transition-colors ${
              editor.isActive("blockquote") 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title="Quote"
          >
            <Quote size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Alignment Group - Hidden on very small screens */}
        <div className="hidden sm:flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 rounded-md touch-manipulation transition-colors ${
              editor.isActive({ textAlign: "left" }) || (!editor.isActive({ textAlign: "center" }) && !editor.isActive({ textAlign: "right" }))
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 rounded-md touch-manipulation transition-colors ${
              editor.isActive({ textAlign: "center" })
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 rounded-md touch-manipulation transition-colors ${
              editor.isActive({ textAlign: "right" })
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex gap-0.5 sm:gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 sm:p-2 rounded-md touch-manipulation transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 sm:p-2 rounded-md touch-manipulation transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
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
    localUser: localUser?.name || "none"
  });
  
  const room = useRoom();
  const [ydoc] = useState(() => {
    const doc = new Y.Doc();
    console.log("📄 Created new Yjs document for room:", roomId);
    return doc;
  });
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("connecting");
  const initContentRef = useRef<string | undefined>(undefined);

  // Initialize provider first
  useEffect(() => {
    if (room && ydoc && !provider) {
      console.log("🔗 Initializing Liveblocks provider for room:", roomId);
      console.log("🏠 Room object:", room);
      console.log("🏠 Room ID matches:", room.id === roomId);
      console.log("🏠 Room connection state:", (room as any).getConnectionState?.());
      console.log("📄 Ydoc object:", ydoc);
      
      // Wait for room to be ready before creating provider
      const initProvider = () => {
        console.log("⏳ Checking room readiness...");
        console.log("- Room connection status:", (room as any).getConnectionState?.());
        
        // Check if room has users (indicating it's connected)
        const roomInfo = {
          connectionState: (room as any).getConnectionState?.(),
          selfInfo: (room as any).getSelf?.(),
          othersCount: (room as any).getOthers?.().length || 0
        };
        console.log("🔍 Room info:", roomInfo);
        
        // Validate room object before creating provider
        if (!room) {
          console.error("❌ Room object is null or undefined");
          return;
        }

        // Check if room has required methods
        const roomMethods = ['getConnectionState', 'getSelf', 'getOthers'];
        const missingMethods = roomMethods.filter(method => typeof (room as any)[method] !== 'function');
        if (missingMethods.length > 0) {
          console.warn("⚠️ Room missing methods:", missingMethods);
        }

        let yProvider: LiveblocksYjsProvider;
        try {
          console.log("🔧 Creating LiveblocksYjsProvider with room and ydoc...");
          yProvider = new LiveblocksYjsProvider(room, ydoc);
          console.log("🔗 Provider created successfully:", yProvider);
          console.log("🔍 Provider methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(yProvider)));
          console.log("🔍 Provider properties:", Object.keys(yProvider));
          
          // Validate awareness property
          if (!yProvider.awareness) {
            console.error("❌ Provider created but awareness property is missing!");
            return;
          }
          console.log("✅ Provider awareness initialized:", !!yProvider.awareness);
        
          // Check if provider has a connect method before calling it
          if (typeof (yProvider as any).connect === 'function') {
            (yProvider as any).connect();
            console.log("🚀 Provider connection initiated via .connect()");
          } else {
            console.log("ℹ️ Provider does not have .connect() method, should auto-connect");
          }
      } catch (error) {
        console.error("❌ Failed to create or connect provider:", error);
        return;
      }
      
      yProvider.on('status', ({ status }: { status: string }) => {
        console.log("📡 Provider status changed:", status);
        setConnectionStatus(status);
        
        if (status === 'connected') {
          console.log("✅ Successfully connected to Liveblocks room:", roomId);
        } else if (status === 'disconnected') {
          console.log("⚠️ Provider disconnected, attempting reconnect...");
          setTimeout(() => yProvider.connect(), 1000);
        }
      });
      
      yProvider.on('sync', (synced: boolean) => {
        console.log("🔄 Provider sync event:", synced, "- User:", localUser?.name);
        if (synced) {
          setConnectionStatus("connected");
          const fragment = ydoc.getXmlFragment('default');
          console.log("📄 Document fragment after sync - length:", fragment.length);
          console.log("📄 Document content:", fragment.toString().substring(0, 200) + "...");
          console.log("👥 Connected users:", yProvider.awareness?.getStates().size || 0);
          
          // Set user awareness when synced
          if (localUser && yProvider.awareness) {
            console.log("👤 Setting user awareness on sync:", localUser.name);
            yProvider.awareness.setLocalStateField('user', {
              name: localUser.name,
              color: localUser.color
            });
          }
          
          // Additional debug: Check if we have initial content to set
          if (initialContent && initialContent.trim() !== "") {
            console.log("📋 Initial content available for setting:", initialContent.substring(0, 100) + "...");
          }
        }
      });

      yProvider.on('awareness-change', () => {
        const states = yProvider.awareness?.getStates() || new Map();
        console.log("👀 Awareness changed - connected users:", states.size);
        states.forEach((state: any, clientId) => {
          console.log(`👤 User ${clientId}:`, state?.user?.name || "unknown");
        });
      });

      yProvider.on('connection-lost', () => {
        console.log("❌ Connection lost to room:", roomId);
        setConnectionStatus("disconnected");
      });

      yProvider.on('connection-error', (error: any) => {
        console.error("❌ Connection error:", error);
        setConnectionStatus("error");
      });
      
      setProvider(yProvider);
      setConnectionStatus("connecting");
      
      // Test Yjs document changes
      ydoc.on('update', (update: Uint8Array, origin: any) => {
        console.log("📄 Yjs document updated:", {
          updateSize: update.length,
          origin: origin?.constructor?.name || origin,
          user: localUser?.name || "unknown"
        });
      });

      // Test connection after a delay
      setTimeout(() => {
        console.log("🔍 Connection test after 3 seconds:");
        console.log("- Provider awareness state:", yProvider.awareness?.getStates().size);
        console.log("- Document length:", ydoc.getXmlFragment('default').length);
        console.log("- Room connection status:", (room as any)?.getConnectionState?.());
        console.log("- Room ID:", room.id);
        console.log("- Provider connected:", yProvider.synced);
        console.log("- Room getSelf():", (room as any).getSelf?.());
        console.log("- Room getOthers():", (room as any).getOthers?.().length);
      }, 3000);

      // Test room connectivity first
      console.log("🔍 Immediate connection test:");
      console.log("- Room object methods:", Object.getOwnPropertyNames(room));
      console.log("- Provider constructor:", yProvider.constructor.name);
      
        // Test if room is working by subscribing to presence
        try {
          const unsubscribe = room.subscribe("my-presence", () => {
            console.log("👋 Room presence update detected");
          });
          
          // Set presence to test room connectivity
          room.updatePresence({ 
            cursor: null,
            user: localUser 
          });
          console.log("📡 Set room presence for:", localUser?.name);
          
          // Also try subscribing to others to see if we can detect other users
          const unsubscribeOthers = room.subscribe("others", (others: any) => {
            console.log("👥 Others in room:", others.length);
            others.forEach((other: any, index: number) => {
              console.log(`👤 Other user ${index}:`, other.presence?.user?.name || "unknown");
            });
          });
          
          // Clean up after test
          setTimeout(() => {
            unsubscribe();
            unsubscribeOthers();
          }, 5000);
        } catch (error) {
          console.error("❌ Room presence test failed:", error);
        }

      // Force connection attempt after short delay
      setTimeout(() => {
        console.log("🚀 Attempting manual provider connection...");
        try {
          // Check if provider has connection methods
          console.log("- Provider methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(yProvider)));
          if (typeof (yProvider as any).connect === 'function') {
            (yProvider as any).connect();
            console.log("✅ Called provider.connect()");
          }
        } catch (error) {
          console.error("❌ Error connecting provider:", error);
        }
      }, 1000);

        return () => {
          console.log("🔌 Destroying provider for room:", roomId);
          yProvider.destroy();
        };
      };
      
      // Initialize provider with delay to ensure room is ready
      setTimeout(initProvider, 100);
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
          field: "default",
        }),
        // Only include CollaborationCursor when provider is ready and has awareness
        ...(provider && provider.awareness ? [
          CollaborationCursor.configure({
            provider: provider,
            user: localUser ? { 
              name: localUser.name, 
              color: localUser.color,
            } : {
              name: "Anonymous",
              color: "#6B7280"
            },
            render: user => {
              const cursor = document.createElement('span');
              cursor.classList.add('collaboration-cursor__caret');
              cursor.setAttribute('style', `border-color: ${user.color}`);
              
              const label = document.createElement('div');
              label.classList.add('collaboration-cursor__label');
              label.setAttribute('style', `background-color: ${user.color}`);
              label.insertBefore(document.createTextNode(user.name), null);
              cursor.insertBefore(label, null);
              
              return cursor;
            },
          }),
        ] : []),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Highlight.configure({ multicolor: true }),
        Typography,
        UnderlineExtension,
        CharacterCount.configure({
          limit: 10000, // Optional: set a character limit
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
        console.log("📄 Initial editor content:", editor.getHTML());
        console.log("🔗 Provider status at editor creation:", {
          hasProvider: !!provider,
          providerSynced: provider?.synced,
          hasLocalUser: !!localUser,
          userName: localUser?.name
        });
        
        // Check if we need to set initial content immediately
        if (initialContent && initialContent.trim() !== "" && provider?.synced) {
          console.log("🚀 Provider already synced, setting initial content immediately in onCreate");
          const fragment = ydoc.getXmlFragment('default');
          if (fragment.length === 0 || editor.getHTML().trim() === "<p></p>") {
            try {
              let htmlContent = initialContent;
              if (initialContent.includes('\n') || initialContent.includes('#')) {
                htmlContent = marked.parse(initialContent) as string;
              }
              editor.commands.setContent(htmlContent, false);
              console.log("✅ Initial content set in onCreate");
            } catch (error) {
              console.error("❌ Error setting content in onCreate:", error);
            }
          }
        }
      },
      onUpdate: ({ editor, transaction }) => {
        const isRemote = transaction.getMeta('y-sync$') !== undefined;
        console.log("✏️ Editor updated:", {
          contentLength: editor.getHTML().length,
          isRemote,
          user: localUser?.name || "unknown"
        });
        
        // Log document state
        const fragment = ydoc.getXmlFragment('default');
        console.log("� Yjs document state:", {
          fragmentLength: fragment.length,
          fragmentContent: fragment.toString().substring(0, 100) + "...",
        });

        // Test if document updates are working
        if (!isRemote) {
          console.log("📤 Local change detected, should sync to other users");
        } else {
          console.log("� Remote change received from another user");
        }
      },
    },
    [ydoc, provider, localUser?.id] // Only depend on user ID to prevent unnecessary recreation
  );

  useEffect(() => {
    if (editor && provider && ydoc && initialContent && initialContent.trim() !== "") {
      console.log("⏱️ Setting up initial content sync...");
      console.log("📄 Initial content to set:", initialContent.substring(0, 200) + "...");
      
      // Use a more specific key to track initialization per room and content
      const contentKey = `${roomId}:${initialContent.slice(0, 50)}`;
      
      // Only initialize if we haven't already done so with this specific content in this room
      if (initContentRef.current === contentKey) {
        console.log("📄 Content already initialized for this room and content");
        return;
      }
      
      const handleSync = () => {
        const fragment = ydoc.getXmlFragment("default");
        const currentContent = editor.getHTML();
        const isEmpty = fragment.length === 0 || fragment.toString().trim() === "" || currentContent.trim() === "<p></p>" || currentContent.trim() === "";
        
        console.log("📄 Document sync - fragment length:", fragment.length, "for room:", roomId);
        console.log("📄 Current editor content:", currentContent.substring(0, 100) + "...");
        console.log("📄 Is document empty?", isEmpty);
        
        // Check if document is truly empty (no meaningful content)
        if (isEmpty) {
          console.log("📝 Setting initial content for empty document:", initialContent!.substring(0, 100) + "...");
          
          // Mark this specific content as initialized for this room
          initContentRef.current = contentKey;
          
          try {
            // Convert markdown to HTML
            let htmlContent = initialContent;
            
            // If the content looks like markdown, convert it
            if (initialContent.includes('\n') || initialContent.includes('#') || initialContent.includes('**')) {
              htmlContent = marked.parse(initialContent) as string;
              console.log("📝 Converted markdown to HTML:", htmlContent.substring(0, 200) + "...");
            }
            
            // Use editor transaction for better control
            editor.chain()
              .clearContent(false) // Clear first
              .setContent(htmlContent, false) // Set new content
              .run();
              
            console.log("✅ Initial content set successfully for room:", roomId);
            
            // Verify content was set
            setTimeout(() => {
              const newContent = editor.getHTML();
              console.log("🔍 Verification - Editor content after setting:", newContent.substring(0, 200) + "...");
            }, 100);
            
          } catch (error) {
            console.error("❌ Error setting initial content:", error);
            
            // Fallback: try setting as plain text
            editor.chain()
              .clearContent(false)
              .insertContent(`<p>${initialContent}</p>`, {
                parseOptions: {
                  preserveWhitespace: 'full',
                },
              })
              .run();
          }
        } else {
          console.log("📄 Document already has content, skipping initial content. Current content:", currentContent.substring(0, 100) + "...");
          // Mark as initialized even if we don't set content to prevent future attempts
          initContentRef.current = contentKey;
        }
      };

      // Multiple sync strategies for better reliability
      const initializeContent = () => {
        console.log("🚀 Initializing content...");
        
        // Strategy 1: If provider is already synced, handle immediately
        if (provider.synced) {
          console.log("🔄 Provider already synced, setting content immediately");
          handleSync();
          return;
        }
        
        // Strategy 2: Listen for sync events
        provider.on('sync', handleSync);
        
        // Strategy 3: Fallback timeout in case sync events don't fire
        const timeoutId = setTimeout(() => {
          console.log("⏰ Fallback timeout triggered for content initialization");
          if (!initContentRef.current || initContentRef.current !== contentKey) {
            handleSync();
          }
        }, 2000);
        
        // Strategy 4: Try multiple times with increasing delays
        [500, 1000, 1500].forEach((delay, index) => {
          setTimeout(() => {
            if (!initContentRef.current || initContentRef.current !== contentKey) {
              console.log(`🔄 Retry ${index + 1}: Attempting to set content`);
              handleSync();
            }
          }, delay);
        });

        return () => {
          provider.off('sync', handleSync);
          clearTimeout(timeoutId);
        };
      };

      const cleanup = initializeContent();

      return cleanup;
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

  // Update collaboration cursor when provider or user changes
  useEffect(() => {
    if (editor && provider && localUser) {
      console.log("🎯 Updating collaboration cursor for user:", localUser.name, "with provider:", !!provider);
      
      // Get the CollaborationCursor extension and update it
      const collaborationCursor = editor.extensionManager.extensions.find(
        ext => ext.name === 'collaborationCursor'
      );
      
      if (collaborationCursor) {
        console.log("✅ CollaborationCursor extension found, updating provider and user");
        // Update the extension's options
        try {
          (collaborationCursor as any).options.provider = provider;
          (collaborationCursor as any).options.user = {
            name: localUser.name,
            color: localUser.color
          };
          
          // Trigger awareness update only if provider has awareness
          if (provider && provider.awareness) {
            provider.awareness.setLocalStateField('user', {
              name: localUser.name,
              color: localUser.color
            });
            console.log("👥 Awareness updated with user info");
          }
        } catch (error) {
          console.error("❌ Error updating collaboration cursor:", error);
        }
      } else if (provider && provider.awareness) {
        console.log("➕ CollaborationCursor extension not found, adding it dynamically");
        try {
          // Add the CollaborationCursor extension dynamically
          const newCursorExtension = CollaborationCursor.configure({
            provider: provider,
            user: {
              name: localUser.name,
              color: localUser.color
            },
            render: user => {
              const cursor = document.createElement('span');
              cursor.classList.add('collaboration-cursor__caret');
              cursor.setAttribute('style', `border-color: ${user.color}`);
              
              const label = document.createElement('div');
              label.classList.add('collaboration-cursor__label');
              label.setAttribute('style', `background-color: ${user.color}`);
              label.insertBefore(document.createTextNode(user.name), null);
              cursor.insertBefore(label, null);
              
              return cursor;
            },
          });
          
          // Use the editor's registerPlugin method to add the extension
          editor.extensionManager.extensions.push(newCursorExtension);
          console.log("✅ CollaborationCursor extension added dynamically");
          
          // Set awareness
          provider.awareness.setLocalStateField('user', {
            name: localUser.name,
            color: localUser.color
          });
          console.log("👥 Awareness updated with user info");
        } catch (error) {
          console.error("❌ Error adding CollaborationCursor extension:", error);
        }
      } else {
        console.warn("⚠️ CollaborationCursor extension not found and provider not ready");
      }
    }
  }, [editor, provider, localUser]);

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

  // Final fallback: if editor is initialized but content is empty and we have initial content
  useEffect(() => {
    if (editor && initialContent && initialContent.trim() !== "") {
      const checkAndSetContent = () => {
        const currentContent = editor.getHTML();
        const isEmpty = currentContent.trim() === "<p></p>" || currentContent.trim() === "" || currentContent === "<p><br></p>";
        
        if (isEmpty) {
          console.log("🚨 Fallback: Editor is empty, setting initial content directly");
          try {
            let htmlContent = initialContent;
            if (initialContent.includes('\n') || initialContent.includes('#') || initialContent.includes('**')) {
              htmlContent = marked.parse(initialContent) as string;
            }
            editor.commands.setContent(htmlContent, false);
            console.log("✅ Fallback content set successfully");
          } catch (error) {
            console.error("❌ Error in fallback content setting:", error);
            // Last resort: set as plain text
            editor.commands.insertContent(`<p>${initialContent.replace(/\n/g, '</p><p>')}</p>`);
          }
        }
      };

      // Check immediately
      setTimeout(checkAndSetContent, 100);
      
      // Check again after a longer delay
      setTimeout(checkAndSetContent, 3000);
    }
  }, [editor, initialContent]);

  if (!editor)
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 border rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">Loading collaborative editor...</p>
          {initialContent && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Content ready: {Math.round(initialContent.length / 1000)}k chars
            </p>
          )}
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
      
      <div className="border rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
        {/* Toolbar */}
        <Toolbar editor={editor} />

        {/* Editor Content */}
        <div className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] bg-white dark:bg-gray-800 relative">
          <EditorContent 
            editor={editor} 
            className="prose prose-sm sm:prose lg:prose-lg max-w-none 
                      dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                      prose-p:text-gray-800 dark:prose-p:text-gray-200
                      prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                      prose-em:text-gray-700 dark:prose-em:text-gray-300
                      prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                      prose-code:text-gray-900 dark:prose-code:text-gray-100
                      prose-pre:bg-gray-100 dark:prose-pre:bg-gray-700
                      p-4 sm:p-6 focus:outline-none
                      touch-manipulation selection:bg-blue-100 dark:selection:bg-blue-900/50"
          />
        </div>

        {/* Mobile-Optimized Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-3 sm:px-4 py-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
            {/* Word/Character Count */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="inline sm:hidden">
                {editor.storage.characterCount?.words() || 0}w • {editor.storage.characterCount?.characters() || 0}ch
              </span>
              <span className="hidden sm:inline">
                {editor.storage.characterCount?.characters() || 0} characters • {editor.storage.characterCount?.words() || 0} words
              </span>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 text-xs">
              <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">
                Real-time collaboration
              </span>
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${
                    provider?.synced ? "bg-green-500" : "bg-yellow-500"
                  }`}
                ></div>
                <span className="text-gray-500 dark:text-gray-400 capitalize">
                  {connectionStatus} {provider?.awareness?.getStates().size || 0} users
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}