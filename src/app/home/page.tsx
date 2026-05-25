"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import AuthGuard from "@/components/auth-guard";
import { useUser } from "@/lib/user-context";
import { clearTokens, getRefreshToken } from "@/lib/auth";

// ── Icons ────────────────────────────────────────────────────

function Icon({ path, viewBox = "0 0 20 20" }: { path: string; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {path.split("|").map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

function Svg({ children, className = "h-5 w-5" }: { children: ReactNode; className?: string }) {
  return <svg viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

const I = {
  Home:       <Icon path="M2 10l8-7 8 7M4 8v7a2 2 0 002 2h8a2 2 0 002-2V8" />,
  Notebook:   <Icon path="M4 2h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z|M8 6h4m-4 4h4m-4 4h2" />,
  Folder:     <Icon path="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />,
  Bookmark:   <Icon path="M5 2h10a1 1 0 011 1v15l-6-4-6 4V3a1 1 0 011-1z" />,
  Photo:      <Icon path="M2 4h16a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V5a1 1 0 011-1z|M7 8a1 1 0 110-2 1 1 0 010 2z|M2 13l4-4 3 3 4-5 5 6" />,
  Calendar:   <Icon path="M3 4h14a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z|M3 8h14|M7 2v3m6-3v3" />,
  Chart:      <Icon path="M2 18V4m4 14V8m4 10v-6m4 6V6m4 12V2" />,
  Gear:       <Icon path="M11.49 2.5H8.51l-.49 1.87-.99.41-1.7-.98-1.99 1.99.98 1.7-.41.99-1.87.49v2.98l1.87.49.41.99-.98 1.7 1.99 1.99 1.7-.98.99.41.49 1.87h2.98l.49-1.87.99-.41 1.7.98 1.99-1.99-.98-1.7.41-.99 1.87-.49V8.51l-1.87-.49-.41-.99.98-1.7-1.99-1.99-1.7.98-.99-.41L11.49 2.5z|M10 10a1 1 0 110-2 1 1 0 010 2z" />,
  User:       <Icon path="M14 6a4 4 0 11-8 0 4 4 0 018 0zM2 18c0-2.5 2-5 8-5s8 2.5 8 5" />,
  Bell:       <Icon path="M10 2a6 6 0 00-6 6v3l-1 3h14l-1-3V8a6 6 0 00-6-6z|M8 16a2 2 0 004 0" />,
  Search:     <Icon path="M8.5 3a5.5 5.5 0 100 11 5.5 5.5 0 000-11z|M13 13l4 4" />,
  ChevronL:   <Icon path="M12 4l-6 6 6 6" />,
  Clock:      <Icon path="M10 2a8 8 0 100 16 8 8 0 000-16z|M10 6v4l3 2" />,
  Sun:        <Icon path="M10 1v2m0 14v2M3.5 3.5l1.4 1.4m10.2 10.2l1.4 1.4M1 10h2m14 0h2M3.5 16.5l1.4-1.4m10.2-10.2l1.4-1.4" />,
  Moon:       <Icon path="M18 11.5A8.5 8.5 0 018.5 3 7 7 0 1018 13.5z" />,
  Sparkle:    <Icon path="M10 1l1.5 4.5L16 7l-4.5 1.5L10 13l-1.5-4.5L4 7l4.5-1.5L10 1z|M6 14l.7 2.3L9 17l-2.3.7L6 20l-.7-2.3L3 17l2.3-.7L6 14z" />,
  ArrowUp:    <Icon path="M10 15V5m0 0l-4 4m4-4l4 4" />,
  More:       <Icon path="M10 5a1 1 0 100-2 1 1 0 000 2z|M10 11a1 1 0 100-2 1 1 0 000 2z|M10 17a1 1 0 100-2 1 1 0 000 2z" />,
};

// ── Navigation ───────────────────────────────────────────────

interface NavItem { key: string; icon: ReactNode; label: string; badge?: string }
const navItems: NavItem[] = [
  { key: "home",      icon: I.Home,     label: "首页" },
  { key: "notes",     icon: I.Notebook,  label: "笔记" },
  { key: "projects",  icon: I.Folder,    label: "项目" },
  { key: "bookmarks", icon: I.Bookmark,  label: "收藏" },
  { key: "gallery",   icon: I.Photo,     label: "相册" },
  { key: "calendar",  icon: I.Calendar,  label: "日历", badge: "3" },
  { key: "stats",     icon: I.Chart,     label: "数据" },
  { key: "settings",  icon: I.Gear,      label: "设置" },
];

// ── Module Card ──────────────────────────────────────────────

interface Module {
  key: string; icon: ReactNode; label: string; desc: string; stat: string;
  gradient: string; shadow: string; accent: string;
}
const modules: Module[] = [
  { key: "notes",     icon: I.Notebook, label: "笔记", desc: "记录想法与知识", stat: "23 篇",   gradient: "from-[#0071e3]/10 via-[#4a9eff]/5 to-transparent", shadow: "shadow-[0_0_20px_rgba(0,113,227,0.08)]", accent: "text-[#0071e3] bg-[#0071e3]/10" },
  { key: "projects",  icon: I.Folder,   label: "项目", desc: "个人项目追踪",   stat: "4 进行中", gradient: "from-[#30b94e]/10 via-[#5ce38a]/5 to-transparent", shadow: "shadow-[0_0_20px_rgba(48,185,78,0.08)]", accent: "text-[#30b94e] bg-[#30b94e]/10" },
  { key: "bookmarks", icon: I.Bookmark, label: "收藏", desc: "网页与资源",     stat: "128 条",  gradient: "from-[#ff9f0a]/10 via-[#ffbf4d]/5 to-transparent", shadow: "shadow-[0_0_20px_rgba(255,159,10,0.08)]", accent: "text-[#ff9f0a] bg-[#ff9f0a]/10" },
  { key: "gallery",   icon: I.Photo,    label: "相册", desc: "照片与截图",     stat: "346 张",  gradient: "from-[#ff3b30]/10 via-[#ff6b63]/5 to-transparent", shadow: "shadow-[0_0_20px_rgba(255,59,48,0.08)]", accent: "text-[#ff3b30] bg-[#ff3b30]/10" },
  { key: "calendar",  icon: I.Calendar, label: "日历", desc: "日程与提醒",     stat: "今日 3 项",gradient:"from-[#5ac8fa]/10 via-[#8adcff]/5 to-transparent", shadow: "shadow-[0_0_20px_rgba(90,200,250,0.08)]", accent: "text-[#5ac8fa] bg-[#5ac8fa]/10" },
  { key: "stats",     icon: I.Chart,    label: "数据", desc: "统计与分析",     stat: "12 报告", gradient:"from-[#af52de]/10 via-[#d48cf5]/5 to-transparent",shadow:"shadow-[0_0_20px_rgba(175,82,222,0.08)]", accent:"text-[#af52de] bg-[#af52de]/10" },
];

// ── Activity Item ────────────────────────────────────────────

function Activity({ label, module, time, icon }: { label: string; module: string; time: string; icon: ReactNode }) {
  return (
    <div className="group flex items-start gap-3 border-b border-[#f0f0f0] pb-3 last:border-0 last:pb-0 transition-all duration-200 hover:opacity-80">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f5f7] text-[11px] text-[#86868b] transition-all duration-200 group-hover:bg-[#0071e3]/10 group-hover:text-[#0071e3]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#1d1d1f] truncate">{label}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#86868b]">
          <span className="font-medium text-[#6e6e73]">{module}</span>
          <span className="text-[#d2d2d7]">·</span>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

// ── Quick Action ─────────────────────────────────────────────

function QuickAction({ label, desc, icon, color }: { label: string; desc: string; icon: ReactNode; color: string }) {
  return (
    <button className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-[#f5f5f7]">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color} transition-all duration-200 group-hover:scale-105`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[13px] font-medium text-[#1d1d1f]">{label}</p>
        <p className="text-[11px] text-[#86868b]">{desc}</p>
      </div>
    </button>
  );
}

// ── Mini Stat ────────────────────────────────────────────────

function MiniStat({ label, value, trend, color }: { label: string; value: string; trend: string; color: string }) {
  return (
    <div className="rounded-xl border border-[#f0f0f0] bg-white/50 p-3.5 transition-all duration-200 hover:bg-white hover:shadow-sm">
      <p className="text-[11px] font-medium text-[#86868b] tracking-wide">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{value}</p>
        <span className={`flex items-center gap-0.5 text-[11px] font-medium ${color}`}>
          <Svg className="h-3 w-3"><path d="M10 15V5m0 0l-4 4m4-4l4 4" /></Svg>
          {trend}
        </span>
      </div>
    </div>
  );
}

// ── Home Page ────────────────────────────────────────────────

export default function HomePage() {
  const [activeNav, setActiveNav] = useState("home");
  const [collapsed, setCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const { user } = useUser();
  const menuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const nickname = user?.nickname || "大圣";
  const avatarUrl = user?.avatar_url;
  const initial = nickname.charAt(0).toUpperCase();

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

  function handleLogout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => {});
    }
    clearTokens();
    window.location.href = "/";
  }

  const now = new Date();
  const h = now.getHours();
  const greeting = h < 6 ? "夜深了" : h < 9 ? "早上好" : h < 12 ? "上午好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#f5f5f7] selection:bg-[#0071e3]/20">

      {/* ═══════ Sidebar ═══════ */}
      <aside className={`flex flex-col border-r border-[#e8e8ed]/70 bg-white/95 backdrop-blur-xl transition-all duration-300 ${collapsed ? "w-[60px]" : "w-[220px]"}`}>
        {/* Brand */}
        <div className="flex h-14 items-center gap-3 border-b border-[#f0f0f0] px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071e3] via-[#4a9eff] to-[#005bbf] text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(0,113,227,0.3)]">
            L
          </div>
          <span className={`overflow-hidden whitespace-nowrap text-[15px] font-semibold text-[#1d1d1f] tracking-[-0.01em] transition-all duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"}`}>
            liarsa
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
          {navItems.map((item) => {
            const active = activeNav === item.key;
            return (
              <button key={item.key} onClick={() => setActiveNav(item.key)}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                    : "text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100"}`}>{item.label}</span>
                {item.badge && !collapsed && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${active ? "bg-white/20 text-white" : "bg-[#0071e3]/10 text-[#0071e3]"}`}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse */}
        <div className="border-t border-[#f0f0f0] px-2 py-3">
          <button onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] text-[#86868b] transition-all duration-200 hover:bg-[#f5f5f7]"
          >
            <span className={`flex-shrink-0 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}>{I.ChevronL}</span>
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[80px] opacity-100"}`}>收起侧栏</span>
          </button>
        </div>
      </aside>

      {/* ═══════ Right Area ═══════ */}
      <div className="flex flex-1 flex-col overflow-hidden relative">

        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-[#0071e3]/8 to-transparent blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-[#5ac8fa]/6 to-transparent blur-3xl" />
        </div>

        {/* ── Header ── */}
        <header className="relative flex h-14 flex-shrink-0 items-center justify-between border-b border-[#e8e8ed]/70 bg-white/80 px-6 backdrop-blur-xl z-10">
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
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#86868b] transition-all duration-200 hover:bg-[#f5f5f7] hover:text-[#6e6e73]"
              >
                {I.Bell}
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#ff3b30] text-[10px] font-bold text-white ring-2 ring-white px-1">
                  3
                </span>
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-10 w-72 rounded-2xl border border-[#d2d2d7]/80 bg-white/95 py-2 shadow-lg backdrop-blur-xl">
                  <div className="border-b border-[#f5f5f7] px-4 py-2.5">
                    <p className="text-[13px] font-semibold text-[#1d1d1f]">通知</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {[
                      { title: "新笔记已同步", desc: "笔记「Go 并发编程实践」已成功同步到云端", time: "2 分钟前" },
                      { title: "项目部署完成", desc: "项目「个人网站重构」已成功部署", time: "1 小时前" },
                      { title: "系统更新提醒", desc: "新版本 v0.2.0 已发布，点击查看详情", time: "3 小时前" },
                    ].map((n, i) => (
                      <button key={i} className="flex w-full flex-col gap-0.5 border-b border-[#f5f5f7] px-4 py-3 text-left transition-all duration-200 hover:bg-[#f5f5f7] last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3] flex-shrink-0" />
                          <span className="text-[12px] font-medium text-[#1d1d1f]">{n.title}</span>
                        </div>
                        <p className="text-[11px] text-[#86868b] pl-3.5">{n.desc}</p>
                        <span className="text-[10px] text-[#d2d2d7] pl-3.5">{n.time}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[#f5f5f7] px-4 py-2">
                    <button className="w-full text-center text-[11px] font-medium text-[#0071e3] transition-colors hover:text-[#0077ed]">
                      查看全部通知 →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0071e3] text-[15px] font-bold text-white shadow-sm ring-2 ring-white transition-all duration-200 hover:bg-[#0077ed] active:bg-[#006edb] overflow-hidden"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-10 w-44 rounded-2xl border border-[#d2d2d7]/80 bg-white/95 py-2 shadow-lg backdrop-blur-xl">
                  <div className="border-b border-[#f5f5f7] px-4 py-2.5">
                    <p className="text-[13px] font-medium text-[#1d1d1f]">{nickname}</p>
                    <p className="text-[11px] text-[#86868b]">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout}
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
        </header>

        {/* ── Main Content ── */}
        <main className="relative flex-1 overflow-y-auto z-10">
          {activeNav === "home" && (
            <div className="mx-auto max-w-[1000px] px-8 pt-8 pb-16">

              {/* ── Welcome ── */}
              <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#e8e8ed]/80 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 via-white to-[#5ac8fa]/5" />
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-[#0071e3]/10 to-transparent blur-2xl" />
                <div className="relative flex items-center gap-5 p-7">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0071e3] via-[#4a9eff] to-[#005bbf] p-[2px] shadow-[0_4px_16px_rgba(0,113,227,0.25)]">
                      <div className="h-full w-full overflow-hidden rounded-full bg-white">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0071e3] to-[#005bbf] text-[22px] font-semibold text-white">{initial}</div>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#30b94e] ring-[3px] ring-white shadow-sm">
                      <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" stroke="white" strokeWidth="2"><path d="M3 6l2 2 4-4" /></svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{greeting}，{nickname}</h1>
                      <span className="text-lg">{h < 17 ? I.Sparkle : I.Moon}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-[#6e6e73]">
                      {now.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
                    </p>
                  </div>
                  <button className="group hidden sm:flex items-center gap-2 rounded-full bg-[#0071e3] px-5 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] hover:shadow-[0_4px_12px_rgba(0,113,227,0.3)] active:scale-[0.97] shadow-sm">
                    <span className="transition-transform duration-200 group-hover:rotate-12">{I.Sparkle}</span>
                    快速操作
                  </button>
                </div>
              </div>

              {/* ── Mini Stats Row ── */}
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="今日访问" value="47" trend="+12%" color="text-[#30b94e]" />
                <MiniStat label="待办事项" value="3" trend="-2" color="text-[#ff9f0a]" />
                <MiniStat label="存储使用" value="6.2G" trend="+8%" color="text-[#0071e3]" />
                <MiniStat label="系统运行" value="12d" trend="正常" color="text-[#30b94e]" />
              </div>

              {/* ── Module Grid ── */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">功能模块</h2>
                    <span className="rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#0071e3]">共 {modules.length} 个</span>
                  </div>
                  <button className="text-[12px] font-medium text-[#0071e3] transition-all duration-200 hover:text-[#0077ed] hover:underline-offset-2 hover:underline">
                    查看全部 →
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {modules.map((m) => (
                    <button key={m.key} onClick={() => setActiveNav(m.key)}
                      className={`group relative overflow-hidden rounded-2xl border border-[#e8e8ed]/80 bg-white p-5 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${m.shadow}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${m.gradient}`} />
                      <div className="relative">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.accent} transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm`}>
                          {m.icon}
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[14px] font-medium text-[#1d1d1f]">{m.label}</p>
                            <span className="text-[12px] font-medium tabular-nums text-[#86868b]">{m.stat}</span>
                          </div>
                          <p className="mt-0.5 text-[12px] text-[#86868b]">{m.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Bottom Row ── */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

                {/* Activity */}
                <div className="rounded-2xl border border-[#e8e8ed]/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] lg:col-span-3 transition-all duration-200 hover:shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[15px] font-semibold text-[#1d1d1f]">最近动态</h2>
                    <button className="text-[12px] font-medium text-[#0071e3] transition-colors hover:text-[#0077ed]">查看全部 →</button>
                  </div>
                  <div className="space-y-3">
                    <Activity label="更新了个人资料" module="账户" time="2 小时前" icon={I.User} />
                    <Activity label="新建笔记「Go 并发编程实践」" module="笔记" time="昨天 15:30" icon={I.Notebook} />
                    <Activity label="收藏了网页「Tailwind CSS v4 文档」" module="收藏" time="3 天前" icon={I.Bookmark} />
                    <Activity label="完成了项目「个人网站重构」部署" module="项目" time="5 天前" icon={I.Folder} />
                    <Activity label="上传了 12 张新照片" module="相册" time="1 周前" icon={I.Photo} />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl border border-[#e8e8ed]/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] lg:col-span-2 transition-all duration-200 hover:shadow-md">
                  <h2 className="mb-4 text-[15px] font-semibold text-[#1d1d1f]">快捷操作</h2>
                  <div className="flex flex-col gap-1">
                    <QuickAction label="新建笔记" desc="记录一个新想法" icon={I.Notebook} color="bg-[#0071e3]/10 text-[#0071e3]" />
                    <QuickAction label="添加收藏" desc="保存一个网址"   icon={I.Bookmark}  color="bg-[#ff9f0a]/10 text-[#ff9f0a]" />
                    <QuickAction label="上传照片" desc="添加到相册"     icon={I.Photo}     color="bg-[#ff3b30]/10 text-[#ff3b30]" />
                    <QuickAction label="创建项目" desc="开始新的事项"    icon={I.Folder}    color="bg-[#30b94e]/10 text-[#30b94e]" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-5 py-2 text-[11px] text-[#d2d2d7] border border-[#e8e8ed]/60 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-[#30b94e]" />
                  liarsa · 个人系统 · v0.1.0
                </div>
              </div>
            </div>
          )}

          {activeNav !== "home" && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f5f7]">
                  {navItems.find((n) => n.key === activeNav)?.icon}
                </div>
                <p className="text-[15px] font-medium text-[#86868b]">{navItems.find((n) => n.key === activeNav)?.label}</p>
                <p className="mt-1 text-[13px] text-[#d2d2d7]">功能开发中，敬请期待</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
