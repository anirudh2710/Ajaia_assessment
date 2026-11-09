"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (documentId: string) => void;
}

export function FileImportModal({ isOpen, onClose, onImportSuccess }: FileImportModalProps) {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const ext = selectedFile.name.toLowerCase().split(".").pop();
    if (!["txt", "md", "markdown", "docx"].includes(ext || "")) {
      setError("Please select a supported file (.md, .txt, or .docx)");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import file");
      }

      if (onImportSuccess) {
        onImportSuccess(data.id);
      }
      onClose();
      router.push(`/doc/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#181a20] rounded-2xl shadow-2xl border border-white/10 overflow-hidden text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div>
            <h3 className="text-base font-semibold text-white">Import Document</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Turn an existing file into a live editable collaborative document
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-indigo-500 bg-indigo-500/10"
                : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-white/15 hover:border-indigo-400/50 hover:bg-white/[0.02]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt,.docx"
              onChange={handleFileInput}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2 animate-in zoom-in-75 duration-150" />
                <p className="text-sm font-medium text-gray-100">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(file.size / 1024).toFixed(1)} KB &bull; Click or drop another to replace
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-300">
                  Click to select or drag and drop a file
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 border border-white/10 text-gray-300">
                    .md (Markdown)
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 border border-white/10 text-gray-300">
                    .docx (Word)
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 border border-white/10 text-gray-300">
                    .txt (Plain Text)
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-red-500/10 text-red-300 text-xs rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white/[0.02] border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!file || isUploading}
            onClick={handleUpload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing & Converting...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Import to Editor
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
