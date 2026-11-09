"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, User } from "@/context/UserContext";
import { UserSwitcher } from "@/components/UserSwitcher";
import { FileImportModal } from "@/components/FileImportModal";
import {
  FileText,
  Plus,
  Upload,
  Search,
  Users,
  Trash2,
  Clock,
  Sparkles,
  Loader2,
  Lock,
  Edit3,
  Eye,
} from "lucide-react";

interface Collaborator {
  id: string;
  role: string;
  user: User;
}

interface DocumentItem {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  owner: User;
  shares?: Collaborator[];
  currentUserRole?: string;
  updatedAt: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useUser();

  const [activeTab, setActiveTab] = useState<"owned" | "shared">("owned");
  const [ownedDocs, setOwnedDocs] = useState<DocumentItem[]>([]);
  const [sharedDocs, setSharedDocs] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Fetch documents for the active user
  const fetchDocuments = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/documents", {
        headers: {
          "x-user-id": currentUser.id,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOwnedDocs(data.owned || []);
        setSharedDocs(data.shared || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Create new blank document
  const handleCreateDocument = async () => {
    if (!currentUser || isCreating) return;
    try {
      setIsCreating(true);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({
          title: "Untitled Document",
          content: "<p></p>",
        }),
      });

      if (res.ok) {
        const newDoc = await res.json();
        router.push(`/doc/${newDoc.id}`);
      }
    } catch (err) {
      console.error("Failed to create document:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Delete document (owner only)
  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return;

    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": currentUser.id,
        },
      });

      if (res.ok) {
        setOwnedDocs((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  // Filter documents by search query
  const displayedDocs = (activeTab === "owned" ? ownedDocs : sharedDocs).filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1115] text-[#f3f4f6]">
      {/* Dark Modern Header */}
      <header className="sticky top-0 z-30 bg-[#13151a]/90 backdrop-blur-md border-b border-white/10 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              Ajaia Docs
            </h1>
            <p className="text-[11px] text-gray-400 font-medium">Workspace</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#181a20] hover:bg-[#1e2027] border border-white/10 focus-within:border-indigo-500/50 rounded-xl w-72 transition-all">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full bg-transparent text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* User Switcher */}
        <div className="flex items-center gap-3">
          <UserSwitcher />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Quick Action Hero Section */}
        <section className="bg-[#181a20] rounded-2xl p-6 border border-white/10 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Start a new document</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Create a blank document or import from existing Markdown or Word files
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Collaborative Editor
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Blank Document Card */}
            <button
              onClick={handleCreateDocument}
              disabled={isCreating}
              className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-[#13151a]/60 hover:bg-[#13151a] hover:border-indigo-500/50 group transition-all text-left shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white flex items-center justify-center transition-all">
                {isCreating ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Plus className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                  Blank Document
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Start writing with rich text</p>
              </div>
            </button>

            {/* Import File Card */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-[#13151a]/60 hover:bg-[#13151a] hover:border-violet-500/50 group transition-all text-left shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-600 text-violet-400 group-hover:text-white flex items-center justify-center transition-all">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                  Import File
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">.md, .docx, or .txt</p>
              </div>
            </button>
          </div>
        </section>

        {/* Document Tabs & Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("owned")}
                className={`text-sm font-semibold pb-1.5 transition-colors relative flex items-center gap-2 ${
                  activeTab === "owned"
                    ? "text-indigo-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <span>My Documents</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 border border-white/10 text-gray-300">
                  {ownedDocs.length}
                </span>
                {activeTab === "owned" && (
                  <div className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("shared")}
                className={`text-sm font-semibold pb-1.5 transition-colors relative flex items-center gap-2 ${
                  activeTab === "shared"
                    ? "text-indigo-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <span>Shared with Me</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 border border-white/10 text-gray-300">
                  {sharedDocs.length}
                </span>
                {activeTab === "shared" && (
                  <div className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            </div>

            <div className="text-xs text-gray-400">
              Showing {displayedDocs.length} document{displayedDocs.length === 1 ? "" : "s"}
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-gray-400 font-medium">Loading documents...</p>
            </div>
          ) : displayedDocs.length === 0 ? (
            <div className="text-center py-16 bg-[#181a20] rounded-2xl border border-white/10 p-8 space-y-3">
              <div className="w-12 h-12 bg-white/5 border border-white/10 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-gray-200">
                {searchQuery
                  ? "No matching documents found"
                  : activeTab === "owned"
                  ? "You haven't created any documents yet"
                  : "No documents have been shared with you"}
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {activeTab === "owned"
                  ? "Click '+ Blank Document' or import a file above to create your first document."
                  : "Documents shared with you by other team members will appear here."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedDocs.map((doc) => {
                const isOwner = activeTab === "owned";
                return (
                  <Link
                    key={doc.id}
                    href={`/doc/${doc.id}`}
                    className="group bg-[#181a20] rounded-xl border border-white/10 hover:border-indigo-500/50 hover:bg-[#1e2027] transition-all p-5 flex flex-col justify-between h-48 shadow-sm"
                  >
                    <div>
                      {/* Top row: Icon & Status / Delete */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isOwner ? (
                            <button
                              onClick={(e) => handleDeleteDocument(doc.id, e)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                                doc.currentUserRole === "editor"
                                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              }`}
                            >
                              {doc.currentUserRole === "editor" ? (
                                <>
                                  <Edit3 className="w-2.5 h-2.5" />
                                  Editor
                                </>
                              ) : (
                                <>
                                  <Eye className="w-2.5 h-2.5" />
                                  Viewer
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-sm text-gray-100 group-hover:text-white line-clamp-2 transition-colors">
                        {doc.title}
                      </h3>
                    </div>

                    {/* Bottom row: Meta & Collaborators */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                      </div>

                      {isOwner ? (
                        <div className="flex items-center -space-x-1.5">
                          {doc.shares && doc.shares.length > 0 ? (
                            doc.shares.slice(0, 3).map((s) => (
                              <img
                                key={s.id}
                                src={
                                  s.user.avatarUrl ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${s.user.name}`
                                }
                                alt={s.user.name}
                                title={`${s.user.name} (${s.role})`}
                                className="w-5 h-5 rounded-full border border-[#181a20]"
                              />
                            ))
                          ) : (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-gray-400" />
                              Private
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                          <img
                            src={
                              doc.owner.avatarUrl ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${doc.owner.name}`
                            }
                            alt={doc.owner.name}
                            className="w-4 h-4 rounded-full border border-white/10"
                          />
                          <span className="truncate max-w-[100px]">{doc.owner.name}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* File Import Modal */}
      <FileImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => fetchDocuments()}
      />
    </div>
  );
}
