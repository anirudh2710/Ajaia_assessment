"use client";

import React, { useState } from "react";
import { useUser, User } from "@/context/UserContext";
import { X, UserPlus, Trash2, Shield, Eye, Edit3, Loader2 } from "lucide-react";

interface Collaborator {
  id: string;
  role: "editor" | "viewer" | string;
  user: User;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  owner: User;
  shares: Collaborator[];
  isOwner: boolean;
  onShareUpdated: () => void;
}

export function ShareModal({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  owner,
  shares,
  isOwner,
  onShareUpdated,
}: ShareModalProps) {
  const { users } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"editor" | "viewer">("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Users eligible to be added (exclude owner and already shared users)
  const sharedUserIds = new Set(shares.map((s) => s.user.id));
  const availableUsers = users.filter(
    (u) => u.id !== owner.id && !sharedUserIds.has(u.id)
  );

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update share permissions");
      }

      setSelectedUserId("");
      onShareUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error sharing document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "editor" | "viewer") => {
    try {
      setError(null);
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change role");
      }

      onShareUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error changing role");
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      setError(null);
      const res = await fetch(`/api/documents/${documentId}/share?userId=${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to revoke access");
      }

      onShareUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error revoking access");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#181a20] rounded-2xl shadow-2xl border border-white/10 overflow-hidden text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div>
            <h3 className="text-base font-semibold text-white">
              Share &ldquo;{documentTitle}&rdquo;
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage who has access and what role they hold
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add collaborator section (Owner only) */}
          {isOwner ? (
            <form onSubmit={handleAddCollaborator} className="space-y-3">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Add Collaborator
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-[#13151a] text-gray-200"
                >
                  <option value="">Select a team member...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roleTitle || u.email})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "editor" | "viewer")}
                  className="w-28 px-3 py-2 text-xs border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-[#13151a] text-gray-200"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>

                <button
                  type="submit"
                  disabled={!selectedUserId || isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  Add
                </button>
              </div>
              {availableUsers.length === 0 && (
                <p className="text-[11px] text-gray-500 italic">
                  All seeded team members already have access to this document.
                </p>
              )}
            </form>
          ) : (
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Only the document owner ({owner.name}) can invite or modify member permissions.</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-red-500/10 text-red-300 text-xs rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          {/* People with access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              People with access ({shares.length + 1})
            </h4>

            <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-[#13151a]/50">
              {/* Owner Item */}
              <div className="flex items-center justify-between p-3 bg-[#181a20]">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={owner.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${owner.name}`}
                    alt={owner.name}
                    className="w-8 h-8 rounded-full border border-white/10"
                  />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-gray-100 truncate">
                      {owner.name}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{owner.email}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Owner
                </span>
              </div>

              {/* Collaborator Items */}
              {shares.map((share) => (
                <div key={share.user.id} className="flex items-center justify-between p-3 bg-[#181a20]">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={share.user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${share.user.name}`}
                      alt={share.user.name}
                      className="w-8 h-8 rounded-full border border-white/10"
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-gray-100 truncate">
                        {share.user.name}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{share.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <>
                        <select
                          value={share.role}
                          onChange={(e) =>
                            handleRoleChange(share.user.id, e.target.value as "editor" | "viewer")
                          }
                          className="px-2 py-1 text-xs border border-white/10 rounded-md bg-[#13151a] text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          onClick={() => handleRevoke(share.user.id)}
                          className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
                          title="Revoke access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-gray-300">
                        {share.role === "editor" ? (
                          <>
                            <Edit3 className="w-3 h-3 text-indigo-400" />
                            Editor
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 text-emerald-400" />
                            Viewer
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-white/[0.02] border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
