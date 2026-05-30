"use client";

import { type ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { I, navItems } from "@/components/icons";

function FeatureCard({ icon, label, desc, onClick }: {
  icon: ReactNode; label: string; desc: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-[#e8e8ed]/80 bg-white p-6 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer w-full"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0071e3]/10 text-[#0071e3] transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
            {icon}
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#1d1d1f]">{label}</p>
            <p className="mt-0.5 text-[13px] text-[#86868b]">{desc}</p>
          </div>
        </div>
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0 text-[#d2d2d7] transition-all duration-300 group-hover:text-[#0071e3] group-hover:translate-x-0.5" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 4l6 6-6 6" />
        </svg>
      </div>
    </button>
  );
}

function QuickStat({ label, value, icon, color }: {
  label: string; value: string; icon: ReactNode; color: string;
}) {
  return (
    <div className="rounded-xl border border-[#e8e8ed]/60 bg-white/80 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#86868b]">{label}</p>
          <p className="text-[15px] font-semibold text-[#1d1d1f]">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleNavChange(key: string) {
    if (key === "assets-and-liabilities") {
      router.push("/assets-and-liabilities");
    }
  }

  const now = new Date();
  const h = now.getHours();
  const greeting = h < 6 ? "夜深了" : h < 9 ? "早上好" : h < 12 ? "上午好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";
  const dateStr = now.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  const monthStr = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] selection:bg-[#0071e3]/20">

      <Sidebar items={navItems} activeNav="home" onNavChange={handleNavChange} />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />

        <DashboardHeader activeNav="home" navItems={navItems} />

        <main className="relative flex-1 overflow-y-auto z-10 animate-in fade-in duration-500">
          <div className="mx-auto w-full max-w-[800px] px-6 pt-8 pb-20">

            {/* Hero */}
            <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#e8e8ed]/80 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 via-white to-[#34c759]/5" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#0071e3]/[0.06] to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative px-8 py-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium text-[#0071e3]">{monthStr}</p>
                    <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">{greeting}</h1>
                    <p className="text-[15px] text-[#6e6e73]">{dateStr}</p>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#005bbf] shadow-[0_4px_16px_rgba(0,113,227,0.25)]">
                    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <QuickStat
                label="当前月份"
                value={monthStr}
                icon={<svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h14a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM3 8h14M7 2v3m6-3v3" /></svg>}
                color="bg-[#0071e3]/10 text-[#0071e3]"
              />
              <QuickStat
                label="功能模块"
                value="1 个"
                icon={<svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h16v12H2z" /><path d="M6 2v4m8-4v4M2 10h16" /></svg>}
                color="bg-emerald-50 text-emerald-600"
              />
            </div>

            {/* Section Title */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[15px] font-semibold text-[#1d1d1f]">快捷入口</h2>
              <span className="h-px flex-1 bg-gradient-to-r from-[#e8e8ed] to-transparent" />
            </div>

            {/* Feature Cards */}
            <div className="space-y-3">
              <FeatureCard
                icon={I.Chart}
                label="资产与负债"
                desc="管理您的资产、负债、收支记录，生成月度报表"
                onClick={() => router.push("/assets-and-liabilities")}
              />
            </div>

            {/* Footer hint */}
            <div className="mt-12 text-center">
              <p className="text-[12px] text-[#d2d2d7]">选择上方功能模块开始管理您的财务</p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
