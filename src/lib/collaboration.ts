export interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  x: number; // Relative to document canvas
  y: number; // Relative to document canvas
  pos?: number; // ProseMirror character position
  height?: number; // Exact text line height
  lastActive: number;
}

export interface RemotePresence {
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  role: string;
  color: string;
  lastSeen: number;
}

const USER_COLORS = [
  "#6366f1", // Indigo (Alex)
  "#ec4899", // Pink (Sarah)
  "#10b981", // Emerald (Marcus)
  "#f59e0b", // Amber (Maya)
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}
