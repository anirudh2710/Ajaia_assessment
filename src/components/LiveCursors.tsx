"use client";

import React from "react";
import { RemoteCursor } from "@/lib/collaboration";

interface LiveCursorsProps {
  cursors: Record<string, RemoteCursor>;
  currentUserId: string;
}

export function LiveCursors({ cursors, currentUserId }: LiveCursorsProps) {
  const activeCursors = Object.values(cursors).filter(
    (c) => c.userId !== currentUserId && Date.now() - c.lastActive < 8000
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
      {activeCursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
          }}
        >
          {/* User Nametag Pill (Google Docs Style) */}
          <div
            className="absolute -top-6 left-0 px-2 py-0.5 rounded-t-md rounded-br-md text-[11px] font-semibold text-white whitespace-nowrap shadow-lg flex items-center gap-1.5 select-none pointer-events-none z-30"
            style={{
              backgroundColor: cursor.color,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
            <span>{cursor.userName}</span>
          </div>

          {/* Vertical cursor bar */}
          <div
            className="w-[2.5px] rounded-full shadow-sm"
            style={{
              backgroundColor: cursor.color,
              height: cursor.height ? `${cursor.height}px` : "22px",
            }}
          />
        </div>
      ))}
    </div>
  );
}
