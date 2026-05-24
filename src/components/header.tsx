"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo, clearTokens } from "@/lib/auth";
import type { UserInfo } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    clearTokens();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#d2d2d7]/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-6">
        <span className="text-[15px] font-semibold text-[#1d1d1f]">
          {user?.nickname || "liarsa"}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-[#6e6e73]">{user?.email || ""}</span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen(!open)}
              className="h-8 w-8 rounded-full bg-[#0071e3] flex items-center justify-center text-[13px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] active:bg-[#006edb]"
            >
              {user?.nickname?.charAt(0).toUpperCase() || "U"}
            </button>

            {open && (
              <div className="absolute right-0 top-10 w-44 rounded-2xl border border-[#d2d2d7]/80 bg-white/95 py-2 shadow-lg backdrop-blur-xl">
                <div className="border-b border-[#f5f5f7] px-4 py-2.5">
                  <p className="text-[13px] font-medium text-[#1d1d1f]">{user?.nickname}</p>
                  <p className="text-[11px] text-[#86868b]">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-red-500 transition-all duration-200 hover:bg-[#f5f5f7]"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 17h8a2 2 0 002-2V5a2 2 0 00-2-2H7M3 10h10m-3-3l3 3-3 3" />
                  </svg>
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
