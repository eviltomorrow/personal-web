"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { I, type NavItem } from "./icons";

export default function DashboardHeader({
  activeNav,
  navItems,
}: {
  activeNav: string;
  navItems: NavItem[];
}) {
  const [bellOpen, setBellOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const menuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const nickname = user?.nickname || "";
  const avatarUrl = user?.avatar_url;
  const initial = nickname ? nickname.charAt(0).toUpperCase() : "U";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        <div className="relative ml-2" ref={menuRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0071e3] text-[15px] font-bold text-white shadow-sm ring-2 ring-white transition-all duration-200 hover:bg-[#0077ed] active:bg-[#006edb] overflow-hidden cursor-pointer"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={36} height={36} className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-10 w-44 rounded-2xl border border-[#d2d2d7]/80 bg-white/95 py-2 shadow-lg backdrop-blur-xl z-50">
              <div className="border-b border-[#f5f5f7] px-4 py-2.5">
                <p className="text-[13px] font-medium text-[#1d1d1f]">{nickname}</p>
                <p className="text-[11px] text-[#86868b]">{user?.email}</p>
              </div>
              <button onClick={() => { setDropdownOpen(false); router.push("/profile"); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-[#1d1d1f] transition-all duration-200 hover:bg-[#f5f5f7] cursor-pointer"
              >
                {I.User}
                个人信息
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
