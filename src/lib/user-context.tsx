"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi, userApi, setTokens, clearTokens, isLoggedIn, type UserProfile } from "@/lib/api";

export type { UserProfile } from "@/lib/api";

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => void;
  login: (identifier: string, password: string) => Promise<void>;
  register: (authType: "email" | "phone" | "username", identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: () => {},
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!isLoggedIn()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await userApi.getProfile();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (identifier: string, password: string) => {
    const result = await authApi.login(identifier, password);
    setTokens(result.access_token, result.refresh_token);
    const profile = await userApi.getProfile();
    setUser(profile);
  }, []);

  const register = useCallback(async (authType: "email" | "phone" | "username", identifier: string, password: string) => {
    const result = await authApi.register(authType, identifier, password);
    setTokens(result.access_token, result.refresh_token);
    const profile = await userApi.getProfile();
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUser, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
