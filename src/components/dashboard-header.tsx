"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { I, type NavItem } from "./icons";

function AvatarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="7" r="3.5" />
      <path d="M3 18c0-3.5 3.5-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

export default function DashboardHeader({
  activeNav,
  navItems,
}: {
  activeNav: string;
  navItems: NavItem[];
}) {
  const router = useRouter();
  const { logout } = useUser();
  const [bellOpen, setBellOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setAvatarOpen(false);
    await logout();
    window.location.href = "/login";
  }

  return (
    <header className="relative flex h-14 flex-shrink-0 items-center justify-between border-b border-[#e8e8ed]/70 bg-white/80 px-6 backdrop-blur-xl z-20">
      <div className="flex items-center gap-2 text-[13px] text-[#86868b]">
        <span className="text-[#d2d2d7]">/</span>
        <span className="font-medium text-[#1d1d1f]">{navItems.find((n) => n.key === activeNav)?.label}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-[#f5f5f7] px-4 py-1.5 text-[14px] text-[#86868b] transition-all duration-200 focus-within:bg-[#e8e8ed] focus-within:ring-2 focus-within:ring-[#0071e3]/20 w-[240px]">
          {I.Search}
          <input type="text" placeholder="搜索..."
            className="flex-1 bg-transparent text-[13px] text-[#1d1d1f] placeholder-[#86868b] outline-none"
          />
          <span className="rounded border border-[#d2d2d7]/50 px-1.5 py-0.5 text-[10px] font-medium text-[#d2d2d7]">⌘K</span>
        </div>

        <div className="relative" ref={bellRef}>
          <button onClick={() => setBellOpen(!bellOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#86868b] transition-all duration-200 hover:bg-[#f5f5f7] hover:text-[#6e6e73] cursor-pointer"
          >
            {I.Bell}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-10 w-72 rounded-2xl border border-[#d2d2d7]/80 bg-white/95 py-2 shadow-lg backdrop-blur-xl z-50">
              <div className="border-b border-[#f5f5f7] px-4 py-2.5">
                <p className="text-[13px] font-semibold text-[#1d1d1f]">通知</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="flex flex-col items-center justify-center py-10 text-[13px] text-[#d2d2d7]">
                  {I.Bell}
                  <span className="mt-2">暂无通知</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={avatarRef}>
          <button onClick={() => setAvatarOpen(!avatarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3] transition-all duration-200 hover:bg-[#0071e3]/20 cursor-pointer"
          >
            <AvatarIcon />
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-10 w-44 rounded-2xl border border-[#d2d2d7]/80 bg-white/95 py-2 shadow-lg backdrop-blur-xl z-50 overflow-hidden">
              <button onClick={() => { setAvatarOpen(false); router.push("/profile"); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] cursor-pointer"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 14v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1M8 7a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                个人信息
              </button>
              <div className="mx-3 my-1 border-t border-[#f0f0f0]" />
              <button onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 transition-colors hover:bg-red-50 cursor-pointer"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" />
                </svg>
                退出登录
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
