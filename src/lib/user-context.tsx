"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, setTokens, clearTokens } from "@/lib/api";

interface UserContextType {
  user: null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (authType: "email" | "phone" | "username", identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const result = await authApi.login(identifier, password);
    setTokens(result.access_token, result.refresh_token);
  }, []);

  const register = useCallback(async (authType: "email" | "phone" | "username", identifier: string, password: string) => {
    const result = await authApi.register(authType, identifier, password);
    setTokens(result.access_token, result.refresh_token);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
  }, []);

  return (
    <UserContext.Provider value={{ user: null, loading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
