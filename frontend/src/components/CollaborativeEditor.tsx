"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { useRoom } from "@liveblocks/react";
import { useEffect, useState } from "react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";

export default function CollaborativeEditor({
  roomId,
  initialContent,
}: {
  roomId: string;
  initialContent?: string;
}) {
  const room = useRoom();
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable the default History extension since Collaboration provides its own
        history: false,
      }),
      Collaboration.configure({ document: ydoc }),
    ],
    content: initialContent || "<p>Start collaborating…</p>",
    immediatelyRender: false, // Fix SSR hydration issues
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  useEffect(() => {
    if (room && ydoc && editor) {
      const yProvider = new LiveblocksYjsProvider(room, ydoc);
      setProvider(yProvider);

      // Set initial content once collaboration is ready
      if (initialContent && initialContent !== "<p>Start collaborating…</p>") {
        // Convert markdown-like content to HTML if needed
        const htmlContent = initialContent.includes('<') ? initialContent : `<p>${initialContent.replace(/\n/g, '</p><p>')}</p>`;
        editor.commands.setContent(htmlContent);
      }

      return () => {
        yProvider.destroy();
      };
    }
  }, [room, ydoc, editor, initialContent]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) return (
    <div className="flex items-center justify-center h-64 border rounded-lg">
      <p className="text-gray-500">Loading collaborative editor...</p>
    </div>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <h3 className="font-medium text-gray-700">Collaborative Editor - Room: {roomId}</h3>
        <div className="text-xs text-gray-500 mt-1">
          {provider ? '🟢 Connected' : '🟡 Connecting...'}
        </div>
      </div>
      <div className="min-h-[400px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
