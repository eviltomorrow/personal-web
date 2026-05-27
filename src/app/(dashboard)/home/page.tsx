"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { I, navItems } from "@/components/icons";
import { useUser } from "@/lib/user-context";

function FeatureCard({ icon, label, desc, onClick, gradient, accent }: {
  icon: ReactNode; label: string; desc: string; onClick?: () => void;
  gradient: string; accent: string;
}) {
  return (
    <button onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-[#e8e8ed]/80 bg-white p-6 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
    >
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${gradient}`} />
      <div className="relative">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent} transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm`}>
          {icon}
        </div>
        <p className="mt-3 text-[16px] font-semibold text-[#1d1d1f]">{label}</p>
        <p className="mt-1 text-[13px] text-[#86868b]">{desc}</p>
      </div>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-[#86868b]">{label}</span>
      <span className="text-[13px] font-medium text-[#1d1d1f]">{value}</span>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();

  function handleNavChange(key: string) {
    if (key === "balance-sheet") {
      router.push("/balance-sheet");
    }
  }

  const nickname = user?.nickname || "";
  const avatarUrl = user?.avatar_url;
  const initial = nickname ? nickname.charAt(0).toUpperCase() : "U";

  const now = new Date();
  const h = now.getHours();
  const greeting = h < 6 ? "夜深了" : h < 9 ? "早上好" : h < 12 ? "上午好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";

  const createdDate = user?.created_at
    ? new Date(user.created_at * 1000).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#f5f5f7] selection:bg-[#0071e3]/20">

      <Sidebar items={navItems} activeNav="home" onNavChange={handleNavChange} />

      <div className="flex flex-1 flex-col overflow-hidden relative">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-[#0071e3]/8 to-transparent blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-[#5ac8fa]/6 to-transparent blur-3xl" />
        </div>

        <DashboardHeader activeNav="home" navItems={navItems} />

        <main className="relative flex-1 overflow-y-auto z-10">
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
                        <Image src={avatarUrl} alt="" width={64} height={64} className="h-full w-full object-cover" />
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
              </div>
            </div>

            {/* ── Two Column Layout ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 mb-8">

              {/* Left: Feature Cards */}
              <div className="lg:col-span-3">
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">功能</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#e8e8ed] to-transparent" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FeatureCard
                    icon={I.Chart}
                    label="资产负债表"
                    desc="查看企业的财务状况概览，包括资产、负债和所有者权益"
                    onClick={() => router.push("/balance-sheet")}
                    gradient="from-[#34c759]/10 via-[#68d88b]/5 to-transparent"
                    accent="text-[#34c759] bg-[#34c759]/10"
                  />
                  <FeatureCard
                    icon={I.User}
                    label="个人信息"
                    desc="管理您的个人资料，修改昵称、头像和其他信息"
                    onClick={() => router.push("/profile")}
                    gradient="from-[#0071e3]/10 via-[#4a9eff]/5 to-transparent"
                    accent="text-[#0071e3] bg-[#0071e3]/10"
                  />
                </div>
              </div>

              {/* Right: Account Summary */}
              <div className="lg:col-span-2">
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">账户</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#e8e8ed] to-transparent" />
                </div>
                <div className="rounded-2xl border border-[#e8e8ed]/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-md">
                  <InfoRow label="昵称" value={nickname} />
                  <InfoRow label="邮箱" value={user?.email || "—"} />
                  <InfoRow label="注册时间" value={createdDate} />
                  <InfoRow label="系统版本" value="v0.1.0" />
                </div>
              </div>
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

              {/* Activity */}
              <div className="rounded-2xl border border-[#e8e8ed]/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] lg:col-span-3 transition-all duration-200 hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold text-[#1d1d1f]">最近动态</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-10 text-[13px] text-[#d2d2d7]">
                  {I.Clock}
                  <span className="mt-2">暂无动态</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border border-[#e8e8ed]/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] lg:col-span-2 transition-all duration-200 hover:shadow-md">
                <h2 className="mb-4 text-[15px] font-semibold text-[#1d1d1f]">快捷操作</h2>
                <div className="flex flex-col gap-1">
                  <button onClick={() => router.push("/balance-sheet")}
                    className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-[#f5f5f7] cursor-pointer w-full text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#34c759]/10 text-[#34c759] transition-all duration-200 group-hover:scale-105">
                      {I.Chart}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#1d1d1f]">查看资产负债表</p>
                      <p className="text-[11px] text-[#86868b]">财务状况概览</p>
                    </div>
                  </button>
                  <button onClick={() => router.push("/profile")}
                    className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-[#f5f5f7] cursor-pointer w-full text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0071e3]/10 text-[#0071e3] transition-all duration-200 group-hover:scale-105">
                      {I.User}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#1d1d1f]">编辑个人资料</p>
                      <p className="text-[11px] text-[#86868b]">修改昵称和头像</p>
                    </div>
                  </button>

                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-5 py-2 text-[11px] text-[#d2d2d7] border border-[#e8e8ed]/60 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-[#30b94e]" />
                personal system
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
