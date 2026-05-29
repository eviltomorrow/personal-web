"use client";

import { createContext, useContext } from "react";

export interface UserInfo {
  user_id?: string;
  nickname: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  gender?: number;
  birthday?: number;
  bio?: string;
  created_at?: number;
  updated_at?: number;
}

const MOCK_USER: UserInfo = {
  user_id: "demo_user_001",
  nickname: "Demo用户",
  email: "demo@example.com",
  phone: "13800138000",
  avatar_url: "",
  gender: 0,
  birthday: Math.floor(Date.now() / 1000) - 86400 * 365 * 20,
  bio: "这是一个演示账户，所有数据均为本地模拟。",
  created_at: Math.floor(Date.now() / 1000) - 86400 * 30,
  updated_at: Math.floor(Date.now() / 1000),
};

interface UserContextType {
  user: UserInfo | null;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType>({
  user: MOCK_USER,
  refreshUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserContext.Provider value={{ user: MOCK_USER, refreshUser: () => {} }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
