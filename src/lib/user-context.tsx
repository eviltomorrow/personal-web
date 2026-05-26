"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserInfo, getAccessToken, isTokenExpired, startPeriodicRefresh, stopPeriodicRefresh } from "./auth";
import type { UserInfo } from "./auth";

interface UserContextType {
  user: UserInfo | null;
}

const UserContext = createContext<UserContextType>({
  user: null,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<UserInfo | null>(() => {
    const token = getAccessToken();
    if (!token || isTokenExpired()) return null;
    return getUserInfo();
  });

  useEffect(() => {
    const token = getAccessToken();
    if (token && !isTokenExpired()) {
      startPeriodicRefresh();
    }
    return () => stopPeriodicRefresh();
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
