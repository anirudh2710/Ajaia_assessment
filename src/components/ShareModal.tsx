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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Share &ldquo;{documentTitle}&rdquo;
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage who has access and what role they hold
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add collaborator section (Owner only) */}
          {isOwner ? (
            <form onSubmit={handleAddCollaborator} className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Add Collaborator
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
                  className="w-28 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>

                <button
                  type="submit"
                  disabled={!selectedUserId || isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
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
                <p className="text-[11px] text-gray-400 italic">
                  All seeded team members already have access to this document.
                </p>
              )}
            </form>
          ) : (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/60 text-xs text-amber-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Only the document owner ({owner.name}) can invite or modify member permissions.</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* People with access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              People with access ({shares.length + 1})
            </h4>

            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
              {/* Owner Item */}
              <div className="flex items-center justify-between p-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={owner.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${owner.name}`}
                    alt={owner.name}
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {owner.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{owner.email}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Owner
                </span>
              </div>

              {/* Collaborator Items */}
              {shares.map((share) => (
                <div key={share.user.id} className="flex items-center justify-between p-3 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={share.user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${share.user.name}`}
                      alt={share.user.name}
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {share.user.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{share.user.email}</p>
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
                          className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          onClick={() => handleRevoke(share.user.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Revoke access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                        {share.role === "editor" ? (
                          <>
                            <Edit3 className="w-3 h-3 text-indigo-500" />
                            Editor
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 text-emerald-500" />
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
        <div className="flex items-center justify-end px-6 py-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-2xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
