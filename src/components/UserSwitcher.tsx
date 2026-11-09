"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { UserCheck, ChevronDown, ShieldCheck } from "lucide-react";

export function UserSwitcher() {
  const { currentUser, users, setCurrentUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/10 bg-[#181a20] hover:bg-[#20232b] text-gray-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        title="Switch simulated user to test permissions"
      >
        <img
          src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
          alt={currentUser.name}
          className="w-6 h-6 rounded-full border border-white/15 bg-white/5"
        />
        <div className="text-left hidden sm:block">
          <div className="text-xs font-semibold text-gray-100 leading-tight">
            {currentUser.name}
          </div>
          <div className="text-[10px] text-gray-400 leading-none">
            {currentUser.roleTitle || "Team Member"}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#181a20] shadow-2xl border border-white/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md">
          <div className="px-3.5 py-2.5 border-b border-white/5 bg-white/[0.02] rounded-t-xl">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Simulated Persona Switcher</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Switch users to test ownership and collaborative access control.
            </p>
          </div>

          <div className="py-1">
            {users.map((user) => {
              const isActive = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.04] ${
                    isActive ? "bg-indigo-500/10 text-white" : "text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-7 h-7 rounded-full border border-white/10 flex-shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-medium text-xs text-gray-200 truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {user.roleTitle} &bull; {user.email}
                      </div>
                    </div>
                  </div>
                  {isActive && <UserCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
