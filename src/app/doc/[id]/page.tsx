"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useUser, User } from "@/context/UserContext";
import { Editor } from "@/components/Editor";
import { ShareModal } from "@/components/ShareModal";
import { AttachmentDrawer, AttachmentItem } from "@/components/AttachmentDrawer";
import { UserSwitcher } from "@/components/UserSwitcher";
import {
  ArrowLeft,
  CloudCheck,
  Loader2,
  Share2,
  Paperclip,
  Eye,
  AlertCircle,
  FileText,
} from "lucide-react";

interface Collaborator {
  id: string;
  role: string;
  user: User;
}

interface DocumentData {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  owner: User;
  shares: Collaborator[];
  attachments: AttachmentItem[];
  currentUserRole: "owner" | "editor" | "viewer" | "none";
  createdAt: string;
  updatedAt: string;
}

function DocumentEditorContent() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { currentUser } = useUser();

  const [document, setDocument] = useState<DocumentData | null>(null);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAttachmentDrawerOpen, setIsAttachmentDrawerOpen] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch document
  const fetchDocument = useCallback(async () => {
    if (!currentUser) return;
    try {
      setError(null);
      const res = await fetch(`/api/documents/${id}`, {
        headers: {
          "x-user-id": currentUser.id,
        },
      });

      if (res.status === 404) {
        setError("Document not found");
        return;
      }
      if (res.status === 403) {
        setError("You do not have permission to access this document");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load document");
      }

      const data: DocumentData = await res.json();
      setDocument(data);
      setTitle(data.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading document");
    } finally {
      setIsLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  // Handle Title Change & Save
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setSaveStatus("saving");

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (!currentUser) return;
      try {
        await fetch(`/api/documents/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.id,
          },
          body: JSON.stringify({ title: newTitle }),
        });
        setSaveStatus("saved");
      } catch (err) {
        console.error("Failed to save title:", err);
      }
    }, 800);
  };

  // Handle Content Change & Auto-save
  const handleContentChange = (newContent: string) => {
    if (document?.currentUserRole === "viewer") return;

    setSaveStatus("saving");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      if (!currentUser) return;
      try {
        const res = await fetch(`/api/documents/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.id,
          },
          body: JSON.stringify({ content: newContent }),
        });
        if (res.ok) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("unsaved");
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("unsaved");
      }
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Opening document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Access Restricted</h2>
          <p className="text-sm text-gray-500">
            {error || "Unable to access this document."}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Back to Documents
            </Link>
            <div className="flex items-center">
              <UserSwitcher />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isEditable = document.currentUserRole === "owner" || document.currentUserRole === "editor";
  const isOwner = document.currentUserRole === "owner";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        {/* Left: Back & Document Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xl">
          <Link
            href="/"
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to all documents"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <input
              type="text"
              value={title}
              disabled={!isEditable}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled Document"
              className="font-medium text-sm text-gray-900 bg-transparent border border-transparent hover:border-gray-200 focus:border-indigo-500 rounded px-2 py-0.5 outline-none transition-colors truncate w-full"
            />
          </div>

          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 flex-shrink-0 pl-1">
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span className="text-gray-500">Saving...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <CloudCheck className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline text-gray-500">Saved</span>
              </>
            ) : (
              <span className="text-amber-500">Unsaved</span>
            )}
          </div>
        </div>

        {/* Right: Actions & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Attachments Button */}
          <button
            onClick={() => setIsAttachmentDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            title="View or add attachments"
          >
            <Paperclip className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden md:inline">Files</span>
            {document.attachments?.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                {document.attachments.length}
              </span>
            )}
          </button>

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            title="Manage sharing and collaborators"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
            {document.shares?.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500 text-white">
                {document.shares.length}
              </span>
            )}
          </button>

          <div className="h-5 w-[1px] bg-gray-200 hidden sm:block" />

          {/* Simulated User Switcher */}
          <UserSwitcher />
        </div>
      </header>

      {/* Read-Only Banner for Viewers */}
      {!isEditable && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2 mx-auto">
            <Eye className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Viewing only:</strong> You have read-only access. You can review and copy content, but cannot edit this document.
            </span>
          </div>
        </div>
      )}

      {/* Editor Surface */}
      <Editor
        initialContent={document.content}
        documentTitle={document.title}
        isEditable={isEditable}
        onContentChange={handleContentChange}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentId={document.id}
        documentTitle={document.title}
        owner={document.owner}
        shares={document.shares || []}
        isOwner={isOwner}
        onShareUpdated={fetchDocument}
      />

      {/* Attachments Drawer */}
      <AttachmentDrawer
        isOpen={isAttachmentDrawerOpen}
        onClose={() => setIsAttachmentDrawerOpen(false)}
        documentId={document.id}
        attachments={document.attachments || []}
        isEditable={isEditable}
        onAttachmentAdded={(newAttachment) => {
          setDocument((prev) =>
            prev ? { ...prev, attachments: [newAttachment, ...(prev.attachments || [])] } : prev
          );
        }}
      />
    </div>
  );
}

export default function DocumentEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading document...</p>
          </div>
        </div>
      }
    >
      <DocumentEditorContent />
    </Suspense>
  );
}
