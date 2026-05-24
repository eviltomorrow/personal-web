"use client";

import { useState } from "react";
import AuthGuard from "@/components/auth-guard";
import Header from "@/components/header";
import { getUserInfo } from "@/lib/auth";

function PenIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M15.232 2.232a2.5 2.5 0 113.536 3.536L6.5 18.036 2 19l.964-4.5L15.232 2.232z" />
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 18V4m4 14V8m4 10v-6m4 6V6m4 12V2" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 6a4 4 0 11-8 0 4 4 0 018 0zM2 18c0-2.5 2-5 8-5s8 2.5 8 5" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.49 2.5H8.51l-.49 1.87-.99.41-1.7-.98-1.99 1.99.98 1.7-.41.99-1.87.49v2.98l1.87.49.41.99-.98 1.7 1.99 1.99 1.7-.98.99.41.49 1.87h2.98l.49-1.87.99-.41 1.7.98 1.99-1.99-.98-1.7.41-.99 1.87-.49V8.51l-1.87-.49-.41-.99.98-1.7-1.99-1.99-1.7.98-.99-.41L11.49 2.5z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

const tools = [
  { icon: PenIcon, label: "写文章" },
  { icon: FolderIcon, label: "项目" },
  { icon: ChartIcon, label: "统计" },
  { icon: UserIcon, label: "用户" },
  { icon: GearIcon, label: "设置" },
];

export default function HomePage() {
  const [expanded, setExpanded] = useState(false);
  const [nickname] = useState(() => {
    const user = getUserInfo();
    return user?.nickname || "Shepard";
  });

  return (
    <AuthGuard>
    <div className="relative min-h-screen bg-[#f5f5f7] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-[#0071e3]/[0.06] to-transparent rounded-[50%] blur-3xl pointer-events-none" />

      {/* Floating Sidebar */}
      <div
        className="fixed left-4 top-1/2 z-40 -translate-y-1/2 flex flex-col gap-2"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div
          className={`flex flex-col gap-1.5 rounded-2xl border border-[#d2d2d7]/80 bg-white/90 px-2 py-3 shadow-lg backdrop-blur-xl transition-all duration-300 ${
            expanded ? "w-40" : "w-12"
          }`}
        >
          {tools.map((tool) => (
            <button
              key={tool.label}
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-[13px] text-[#1d1d1f] transition-all duration-200 hover:bg-[#f5f5f7]"
            >
              <span className="flex-shrink-0 text-[#6e6e73]"><tool.icon /></span>
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  expanded ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                {tool.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Header />

      <main className="relative mx-auto max-w-[980px] px-6 pt-10 pb-20">
        <div className="mb-10">
          <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
            欢迎回来，{nickname}
          </h1>
          <p className="mt-1 text-[15px] text-[#6e6e73]">这是您的个人概览。</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-md">
            <p className="text-[13px] font-medium text-[#6e6e73]">项目</p>
            <p className="mt-2 text-[40px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">12</p>
            <p className="mt-1 text-[13px] text-[#6e6e73]">进行中 3</p>
          </div>
          <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-md">
            <p className="text-[13px] font-medium text-[#6e6e73]">文章</p>
            <p className="mt-2 text-[40px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">28</p>
            <p className="mt-1 text-[13px] text-[#6e6e73]">本月新增 5</p>
          </div>
          <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-md">
            <p className="text-[13px] font-medium text-[#6e6e73]">访问量</p>
            <p className="mt-2 text-[40px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">1,284</p>
            <p className="mt-1 text-[13px] text-[#6e6e73]">较昨日 +12%</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-md">
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]">最近活动</h2>
            <div className="mt-4 space-y-4">
              {[
                { label: "更新了个人资料", time: "2 小时前" },
                { label: "发布了新文章", time: "昨天" },
                { label: "完成了项目部署", time: "3 天前" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-[#f5f5f7] pb-3 last:border-0 last:pb-0">
                  <span className="text-[14px] text-[#1d1d1f]">{item.label}</span>
                  <span className="text-[12px] text-[#86868b]">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-md">
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]">快捷操作</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {["写文章", "新建项目", "查看统计", "系统设置"].map((label) => (
                <button
                  key={label}
                  className="rounded-xl border border-[#d2d2d7]/80 bg-[#f5f5f7] px-4 py-3 text-[13px] font-medium text-[#1d1d1f] transition-all duration-200 hover:border-[#0071e3] hover:text-[#0071e3]"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
