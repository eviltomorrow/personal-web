"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { I, navItems } from "@/components/icons";

export default function SettingsPage() {
  const router = useRouter();

  function handleNavChange(key: string) {
    if (key === "home") {
      router.push("/home");
    } else if (key === "balance-sheet") {
      router.push("/balance-sheet");
    }
  }

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#f5f5f7] overflow-hidden">

      <Sidebar items={navItems} activeNav="settings" onNavChange={handleNavChange} />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />

        <DashboardHeader activeNav="settings" navItems={navItems} />

        <main className="relative flex-1 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f5f7]">
              {I.Gear}
            </div>
            <p className="text-[15px] font-medium text-[#86868b]">设置</p>
          </div>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
