"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import * as Y from "yjs";
import { useRoom } from "@liveblocks/react";
import { useEffect, useState } from "react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Redo, 
  Undo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Type,
  Save
} from "lucide-react";

// Toolbar Component
const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
      {/* Formatting */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Strikethrough"
        >
          <Underline size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-yellow-100 text-yellow-600' : ''}`}
          title="Highlight"
        >
          <Highlighter size={16} />
        </button>
      </div>

      {/* Headings */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 text-sm font-medium ${
              editor.isActive('heading', { level }) ? 'bg-blue-100 text-blue-600' : ''
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
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : ''}`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Actions */}
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
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable the default History extension since Collaboration provides its own
        history: false,
      }),
      Collaboration.configure({ document: ydoc }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
    ],
    content: initialContent || "<p>Start collaborating…</p>",
    immediatelyRender: false, // Fix SSR hydration issues
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6 leading-relaxed',
        style: 'font-family: "Inter", sans-serif;',
      },
    },
  });

  useEffect(() => {
    if (room && ydoc && editor) {
      const yProvider = new LiveblocksYjsProvider(room, ydoc);
      setProvider(yProvider);

      // Set initial content once collaboration is ready
      if (initialContent && initialContent !== "<p>Start collaborating…</p>") {
        setTimeout(() => {
          // Convert markdown-like content to proper HTML
          let htmlContent = initialContent;
          
          if (!initialContent.includes('<')) {
            // Convert markdown-style formatting to HTML
            htmlContent = initialContent
              // Convert **bold** to <strong>bold</strong>
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              // Convert double line breaks to paragraph breaks
              .split('\n\n')
              .map(paragraph => paragraph.trim())
              .filter(p => p.length > 0)
              .map(paragraph => {
                // Handle single line breaks within paragraphs
                const lines = paragraph.split('\n').map(line => line.trim()).filter(line => line);
                if (lines.length === 1) {
                  return `<p>${lines[0]}</p>`;
                } else {
                  // Multiple lines - convert to list if they start with *
                  if (lines[0].startsWith('*')) {
                    const listItems = lines.map(line => `<li>${line.substring(1).trim()}</li>`).join('');
                    return `<ul>${listItems}</ul>`;
                  } else {
                    return `<p>${lines.join('<br>')}</p>`;
                  }
                }
              })
              .join('');
          }
          
          editor.commands.setContent(htmlContent);
        }, 100); // Small delay to ensure collaboration is ready
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

  const handleSave = async () => {
    if (!editor) return;
    
    setIsSaving(true);
    try {
      const content = editor.getHTML();
      // TODO: Implement auto-save to backend
      console.log('Saving content:', content);
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) return (
    <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-500">Loading collaborative editor...</p>
      </div>
    </div>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">Collaborative Editor</h3>
          <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${provider ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            {provider ? 'Connected to room' : 'Connecting...'} • Room: {roomId}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Toolbar */}
      <Toolbar editor={editor} />

      {/* Editor Content */}
      <div className="min-h-[600px] bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t text-xs text-gray-500 flex justify-between items-center">
        <div>
          {editor.storage.characterCount?.characters() || 0} characters • {editor.storage.characterCount?.words() || 0} words
        </div>
        <div className="flex items-center gap-2">
          <span>Real-time collaboration enabled</span>
          <div className={`w-2 h-2 rounded-full animate-pulse ${provider ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        </div>
      </div>
    </div>
  );
}
