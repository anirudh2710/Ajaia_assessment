export type AccessRole = "owner" | "editor" | "viewer" | "none";

export interface DocumentWithShares {
  id: string;
  ownerId: string;
  shares?: {
    userId: string;
    role: string;
  }[];
}

/**
 * Returns the effective role for a given user on a document.
 */
export function getUserDocumentRole(
  userId: string,
  doc: DocumentWithShares
): AccessRole {
  if (doc.ownerId === userId) {
    return "owner";
  }

  if (doc.shares && Array.isArray(doc.shares)) {
    const share = doc.shares.find((s) => s.userId === userId);
    if (share) {
      if (share.role === "editor") return "editor";
      if (share.role === "viewer") return "viewer";
    }
  }

  return "none";
}

/**
 * Checks if user has read access.
 */
export function canUserViewDocument(
  userId: string,
  doc: DocumentWithShares
): boolean {
  const role = getUserDocumentRole(userId, doc);
  return role === "owner" || role === "editor" || role === "viewer";
}

/**
 * Checks if user has write/edit access.
 */
export function canUserEditDocument(
  userId: string,
  doc: DocumentWithShares
): boolean {
  const role = getUserDocumentRole(userId, doc);
  return role === "owner" || role === "editor";
}

/**
 * Checks if user can manage sharing permissions (owner only).
 */
export function canUserShareDocument(
  userId: string,
  doc: DocumentWithShares
): boolean {
  const role = getUserDocumentRole(userId, doc);
  return role === "owner";
}

/**
 * Checks if user can delete document (owner only).
 */
export function canUserDeleteDocument(
  userId: string,
  doc: DocumentWithShares
): boolean {
  const role = getUserDocumentRole(userId, doc);
  return role === "owner";
}
