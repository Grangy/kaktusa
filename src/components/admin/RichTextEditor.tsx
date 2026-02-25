"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const editorClass =
  "prose prose-invert max-w-none min-h-[120px] px-4 py-3 bg-black border border-white/20 text-white focus:outline-none focus:border-[var(--accent)]";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: value || "",
    editorProps: {
      attributes: {
        class: editorClass,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="rounded border border-white/20 overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <div className="flex gap-1 p-2 border-b border-white/20 bg-white/5">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 text-sm ${editor.isActive("bold") ? "bg-white/20 text-white" : "text-white/70 hover:text-white"}`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 text-sm ${editor.isActive("italic") ? "bg-white/20 text-white" : "text-white/70 hover:text-white"}`}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 text-sm ${editor.isActive("bulletList") ? "bg-white/20 text-white" : "text-white/70 hover:text-white"}`}
      >
        • List
      </button>
    </div>
  );
}
