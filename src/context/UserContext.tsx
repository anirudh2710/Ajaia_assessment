"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  roleTitle: string | null;
  avatarUrl: string | null;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data: User[] = await res.json();
          setUsers(data);

          // 1. Check URL query param (?user=sarah or ?userId=user_sarah)
          let queryParam: string | null = null;
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            queryParam = params.get("user") || params.get("userId");
          }

          // 2. Check tab-scoped sessionStorage, then localStorage
          const sessionUserId = typeof window !== "undefined" ? sessionStorage.getItem("ajaia_user_id") : null;
          const localUserId = typeof window !== "undefined" ? localStorage.getItem("ajaia_user_id") : null;

          let found: User | undefined;
          if (queryParam) {
            found = data.find(
              (u) =>
                u.id === queryParam ||
                u.name.toLowerCase().includes(queryParam.toLowerCase()) ||
                u.email.toLowerCase().includes(queryParam.toLowerCase())
            );
          }
          if (!found && sessionUserId) {
            found = data.find((u) => u.id === sessionUserId);
          }
          if (!found && localUserId) {
            found = data.find((u) => u.id === localUserId);
          }
          if (!found) {
            found = data[0];
          }

          if (found) {
            setCurrentUser(found);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("ajaia_user_id", found.id);
              localStorage.setItem("ajaia_user_id", found.id);
              document.cookie = `ajaia_user_id=${found.id}; path=/`;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ajaia_user_id", user.id);
      localStorage.setItem("ajaia_user_id", user.id);
      document.cookie = `ajaia_user_id=${user.id}; path=/`;
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser: handleSetCurrentUser,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
