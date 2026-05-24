"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserInfo, saveUserInfo, getAccessToken } from "./auth";
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
    if (!token) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    const cached = getUserInfo();
    if (cached) {
      Promise.resolve().then(() => setUser(cached));
    }

    fetch("/api/v1/profile/get", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.code === 0) {
          saveUserInfo(body.data);
          setUser(body.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
