"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUserInfo, getAccessToken, isTokenExpired, startPeriodicRefresh, stopPeriodicRefresh } from "./auth";
import type { UserInfo } from "./auth";

interface UserContextType {
  user: UserInfo | null;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);

  const refreshUser = useCallback(() => {
    const token = getAccessToken();
    if (!token || isTokenExpired()) {
      setUser(null);
      return;
    }
    setUser(getUserInfo());
  }, []);

  useEffect(() => {
    refreshUser();
    const token = getAccessToken();
    if (token && !isTokenExpired()) {
      startPeriodicRefresh();
    }
    return () => stopPeriodicRefresh();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
