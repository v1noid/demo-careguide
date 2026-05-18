"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import type { User } from "../lib/types";

type SessionStatus = "loading" | "anonymous" | "authenticated";

const TOKEN_KEY = "notes_token";
const SESSION_EVENT = "notes-session-changed";

export const useSession = () => {
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    const syncSession = () => {
      const saved = localStorage.getItem(TOKEN_KEY);
      if (!saved) {
        setToken("");
        setCurrentUser(null);
        setStatus("anonymous");
        return;
      }

      queueMicrotask(async () => {
        try {
          const data = await apiRequest<{ user: User }>("/auth/me", {}, saved);
          setToken(saved);
          setCurrentUser(data.user);
          setStatus("authenticated");
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          setToken("");
          setCurrentUser(null);
          setStatus("anonymous");
        }
      });
    };

    syncSession();
    window.addEventListener(SESSION_EVENT, syncSession);
    return () => window.removeEventListener(SESSION_EVENT, syncSession);
  }, []);

  const saveSession = (nextToken: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setCurrentUser(user);
    setStatus("authenticated");
    window.dispatchEvent(new Event(SESSION_EVENT));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setCurrentUser(null);
    setStatus("anonymous");
    window.dispatchEvent(new Event(SESSION_EVENT));
  };

  return {
    token,
    currentUser,
    isAdmin: currentUser?.role === "admin",
    status,
    saveSession,
    logout,
  };
};
