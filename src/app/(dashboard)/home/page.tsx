"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
      router.push("/assets-and-liabilities");
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
    <div className="flex min-h-screen bg-[#f5f5f7] selection:bg-[#0071e3]/20">

      <Sidebar items={navItems} activeNav="home" onNavChange={handleNavChange} />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />

        <DashboardHeader activeNav="home" navItems={navItems} />

        <main className="relative flex-1 overflow-y-auto z-10">
          <div className="mx-auto w-full max-w-[800px] px-6 pt-12 pb-20">

            <div className="mb-10">
              <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">{greeting}，{nickname}</h1>
              <p className="mt-1.5 text-[15px] text-[#6e6e73]">欢迎回来，今天是 {now.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <FeatureCard
                icon={I.Chart}
                label="资产与负债"
                desc="管理您的资产、负债、收支记录"
                gradient="from-emerald-500/10 to-emerald-500/5"
                accent="bg-emerald-50 text-emerald-600"
                onClick={() => router.push("/assets-and-liabilities")}
              />
              <FeatureCard
                icon={I.User}
                label="个人信息"
                desc="查看和编辑您的个人资料"
                gradient="from-blue-500/10 to-blue-500/5"
                accent="bg-blue-50 text-blue-600"
                onClick={() => router.push("/profile")}
              />
            </div>

            <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 px-8 py-8 shadow-sm backdrop-blur-xl">
              <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f] mb-6">账户概览</h2>
              <div className="space-y-1">
                <InfoRow label="昵称" value={nickname || "—"} />
                <InfoRow label="邮箱" value={user?.email || "—"} />
                <InfoRow label="手机" value={user?.phone || "—"} />
                <InfoRow label="性别" value={user?.gender !== undefined ? ["保密", "男", "女"][user.gender] : "—"} />
                <InfoRow label="生日" value={user?.birthday ? new Date(user.birthday * 1000).toLocaleDateString("zh-CN") : "—"} />
                <InfoRow label="注册时间" value={createdDate} />
                <InfoRow label="简介" value={user?.bio || "—"} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
