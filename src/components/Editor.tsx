"use client";

import React, { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
  Download,
  Printer,
  FileDown,
} from "lucide-react";

interface EditorProps {
  initialContent: string;
  documentTitle: string;
  isEditable: boolean;
  onContentChange: (content: string) => void;
}

export function Editor({
  initialContent,
  documentTitle,
  isEditable,
  onContentChange,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: isEditable
          ? "Type your document content here, or use markdown shortcuts..."
          : "Empty document...",
      }),
    ],
    content: initialContent,
    editable: isEditable,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none min-h-[550px] text-gray-800 text-[15px] leading-relaxed",
      },
    },
    immediatelyRender: false,
  });

  // Update editable mode if permission changes (e.g. user switch)
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [editor, isEditable]);

  // Update content if initialContent changes externally
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [editor, initialContent]);

  // Export functions
  const handleExportMarkdown = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    // Simple HTML to markdown conversion for export
    const text = html
      .replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
      .replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<em>(.*?)<\/em>/gi, "*$1*")
      .replace(/<li>(.*?)<\/li>/gi, "- $1\n")
      .replace(/<ul>/gi, "")
      .replace(/<\/ul>/gi, "\n")
      .replace(/<blockquote>(.*?)<\/blockquote>/gi, "> $1\n\n")
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<[^>]+>/g, "");

    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentTitle.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [editor, documentTitle]);

  const handleExportHtml = useCallback(() => {
    if (!editor) return;
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${documentTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1f2937; line-height: 1.6; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-top: 1.5rem; }
    h3 { font-size: 1.25rem; margin-top: 1.25rem; }
    blockquote { border-left: 4px solid #6366f1; padding-left: 1rem; color: #4b5563; font-style: italic; }
    code { background: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
  </style>
</head>
<body>
  ${editor.getHTML()}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentTitle.replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [editor, documentTitle]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate words and characters
  const textContent = editor.getText();
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const charCount = textContent.length;

  return (
    <div className="flex flex-col flex-1 w-full bg-[#f8f9fa]">
      {/* Google Docs Style Toolbar */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white/95 backdrop-blur-xs border-b border-gray-200 shadow-2xs">
        {/* Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ${
              editor.isActive("heading", { level: 1 }) ? "bg-indigo-50 text-indigo-700 font-bold" : ""
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ${
              editor.isActive("heading", { level: 2 }) ? "bg-indigo-50 text-indigo-700 font-bold" : ""
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ${
              editor.isActive("heading", { level: 3 }) ? "bg-indigo-50 text-indigo-700 font-bold" : ""
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-gray-200 mx-1" />

          {/* Inline Styles */}
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ${
              editor.isActive("bold") ? "bg-indigo-50 text-indigo-700 font-bold" : ""
            }`}
            title="Bold (Ctrl+B / Cmd+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ${
              editor.isActive("italic") ? "bg-indigo-50 text-indigo-700 font-bold" : ""
            }`}
            title="Italic (Ctrl+I / Cmd+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ${
              editor.isActive("underline") ? "bg-indigo-50 text-indigo-700 font-bold" : ""
            }`}
            title="Underline (Ctrl+U / Cmd+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-gray-200 mx-1" />

          {/* Lists */}
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ${
              editor.isActive("bulletList") ? "bg-indigo-50 text-indigo-700 font-bold" : ""
            }`}
            title="Bulleted List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ${
              editor.isActive("orderedList") ? "bg-indigo-50 text-indigo-700 font-bold" : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-gray-200 mx-1" />

          {/* Blockquote & Code */}
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ${
              editor.isActive("blockquote") ? "bg-indigo-50 text-indigo-700 font-bold" : ""
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ${
              editor.isActive("codeBlock") ? "bg-indigo-50 text-indigo-700 font-bold" : ""
            }`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-gray-200 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            disabled={!isEditable || !editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!isEditable || !editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right side toolbar: Export & stats */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="hidden md:flex items-center gap-2 border-r border-gray-200 pr-3 mr-1 text-[11px]">
            <span>{wordCount} words</span>
            <span>&bull;</span>
            <span>{charCount} chars</span>
          </div>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md border border-gray-200 transition-colors"
            title="Export to Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.md</span>
          </button>
          <button
            onClick={handleExportHtml}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md border border-gray-200 transition-colors"
            title="Export as HTML (.html)"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Document View Canvas */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex justify-center">
        <div className="w-full max-w-4xl bg-white min-h-[850px] shadow-sm rounded-sm border border-gray-200/80 px-12 py-14 sm:px-16 sm:py-16 transition-shadow focus-within:shadow-md">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
