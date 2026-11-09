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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-semibold text-gray-900">Document Attachments</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-xl text-xs font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    Uploading attachment...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload an attachment to this document
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Attachments List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Attached Files ({attachments.length})
            </h4>

            {attachments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                No files attached yet.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <File className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {att.fileName}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {(att.fileSize / 1024).toFixed(1)} KB &bull; {new Date(att.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <a
                      href={att.content}
                      download={att.fileName}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
        <div className="flex items-center justify-end px-6 py-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
