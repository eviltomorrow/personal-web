"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserInfo, saveUserInfo, getAccessToken, isTokenExpired, startPeriodicRefresh, stopPeriodicRefresh } from "./auth";
import { apiClient } from "./api";
import type { UserInfo } from "./auth";

interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || isTokenExpired()) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    startPeriodicRefresh();

    const cached = getUserInfo();
    if (cached) {
      Promise.resolve().then(() => setUser(cached));
    }

    apiClient("/api/v1/profile/get", { method: "POST" })
      .then((res) => res.json())
      .then((body) => {
        if (body.code === 0) {
          saveUserInfo(body.data);
          setUser(body.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => stopPeriodicRefresh();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
