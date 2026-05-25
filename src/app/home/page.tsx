"use client";

import { useState, type ReactNode } from "react";
import AuthGuard from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { I, Svg, navItems } from "@/components/icons";
import { useUser } from "@/lib/user-context";

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
  const { user } = useUser();
  const nickname = user?.nickname || "大圣";
  const avatarUrl = user?.avatar_url;
  const initial = nickname.charAt(0).toUpperCase();

  const now = new Date();
  const h = now.getHours();
  const greeting = h < 6 ? "夜深了" : h < 9 ? "早上好" : h < 12 ? "上午好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#f5f5f7] selection:bg-[#0071e3]/20">

      <Sidebar items={navItems} activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="flex flex-1 flex-col overflow-hidden relative">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-[#0071e3]/8 to-transparent blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-[#5ac8fa]/6 to-transparent blur-3xl" />
        </div>

        <DashboardHeader activeNav={activeNav} navItems={navItems} />

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
