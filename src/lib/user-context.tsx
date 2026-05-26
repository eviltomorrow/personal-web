"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserInfo, getAccessToken, isTokenExpired, startPeriodicRefresh, stopPeriodicRefresh } from "./auth";
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
      setUser(cached);
      setLoading(false);
    } else {
      setLoading(false);
    }

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
