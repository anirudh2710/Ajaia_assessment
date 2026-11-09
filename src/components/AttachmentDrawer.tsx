"use client";

import React, { useState, useRef } from "react";
import { Paperclip, Upload, X, File, Download, Loader2 } from "lucide-react";

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  content: string;
  createdAt: string;
}

interface AttachmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  attachments: AttachmentItem[];
  isEditable: boolean;
  onAttachmentAdded: (attachment: AttachmentItem) => void;
}

export function AttachmentDrawer({
  isOpen,
  onClose,
  documentId,
  attachments,
  isEditable,
  onAttachmentAdded,
}: AttachmentDrawerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/documents/${documentId}/attachments`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload attachment");
      }

      onAttachmentAdded(data);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Document Attachments</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Upload trigger */}
          {isEditable && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.02] transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    Uploading attachment...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-indigo-400" />
                    Upload an attachment to this document
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-red-500/10 text-red-300 text-xs rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          {/* Attachments List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Attached Files ({attachments.length})
            </h4>

            {attachments.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">
                No files attached yet.
              </p>
            ) : (
              <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-[#13151a]/40">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                        <File className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-gray-200 truncate">
                          {att.fileName}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {(att.fileSize / 1024).toFixed(1)} KB &bull; {new Date(att.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <a
                      href={att.content}
                      download={att.fileName}
                      className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-white/[0.02] border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
