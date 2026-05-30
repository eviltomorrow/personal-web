"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, isLoggedIn, setTokens, clearTokens, startTokenRefresh, stopTokenRefresh, getRefreshToken, refreshTokens } from "@/lib/api";

interface UserContextType {
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (authType: "email" | "phone" | "username", identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const ok = await refreshTokens();
      if (!cancelled) {
        if (ok) {
          startTokenRefresh();
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; stopTokenRefresh(); };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const result = await authApi.login(identifier, password);
    setTokens(result.access_token, result.refresh_token);
    startTokenRefresh();
  }, []);

  const register = useCallback(async (authType: "email" | "phone" | "username", identifier: string, password: string) => {
    const result = await authApi.register(authType, identifier, password);
    setTokens(result.access_token, result.refresh_token);
    startTokenRefresh();
  }, []);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try { await authApi.revokeToken(refresh); } catch {}
    }
    stopTokenRefresh();
    clearTokens();
  }, []);

  return (
    <UserContext.Provider value={{ loading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
