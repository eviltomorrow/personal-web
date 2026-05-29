"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { navItems } from "@/components/icons";
import { useUser } from "@/lib/user-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();

  const [form] = useState({
    nickname: user?.nickname || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender ?? 0,
    birthday: user?.birthday ? new Date(user.birthday * 1000).toISOString().split("T")[0] : "",
    bio: user?.bio || "",
  });

  function handleNavChange(key: string) {
    if (key === "home") router.push("/home");
    else if (key === "balance-sheet") router.push("/assets-and-liabilities");
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] overflow-hidden">

      <Sidebar items={navItems} activeNav="" onNavChange={handleNavChange} />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />

        <DashboardHeader activeNav="" navItems={navItems} />

        <main className="relative flex-1 overflow-y-auto z-10">
          <div className="mx-auto max-w-[640px] px-6 pt-10 pb-20">

            <div className="mb-8">
              <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">个人信息</h1>
              <p className="mt-1 text-[14px] text-[#6e6e73]">查看和编辑您的个人资料</p>
            </div>

            <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 px-8 py-8 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-5 pb-8 border-b border-[#f0f0f0]">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0071e3] via-[#4a9eff] to-[#005bbf] p-[2px] shadow-[0_4px_16px_rgba(0,113,227,0.25)]">
                    <div className="h-full w-full overflow-hidden rounded-full bg-white">
                      {user?.avatar_url ? (
                        <Image src={user.avatar_url} alt="" width={80} height={80} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0071e3] to-[#005bbf] text-[28px] font-semibold text-white">
                          {form.nickname.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#1d1d1f]">{form.nickname || "用户"}</p>
                  <p className="text-[13px] text-[#86868b] mt-0.5">{form.email || ""}</p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">昵称 <span className="text-red-400 ml-0.5">*</span></label>
                  <input type="text" value={form.nickname} readOnly
                    className="w-full rounded-xl border border-[#d2d2d7] bg-gray-50 px-[16px] py-[12px] text-[14px] text-[#6e6e73] outline-none" />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">手机号</label>
                  <input type="tel" value={form.phone} readOnly
                    className="w-full rounded-xl border border-[#d2d2d7] bg-gray-50 px-[16px] py-[12px] text-[14px] text-[#6e6e73] outline-none" />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">邮箱</label>
                  <input type="email" value={form.email} readOnly
                    className="w-full rounded-xl border border-[#d2d2d7] bg-gray-50 px-[16px] py-[12px] text-[14px] text-[#6e6e73] outline-none" />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">性别</label>
                  <div className="flex gap-3">
                    {["保密", "男", "女"].map((label, i) => (
                      <div key={i} className={`flex items-center gap-2 rounded-xl border px-4 py-[10px] text-[14px] ${
                        form.gender === i
                          ? "border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3] font-medium"
                          : "border-[#d2d2d7] text-[#6e6e73]"
                      }`}>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">生日</label>
                  <input type="date" value={form.birthday} readOnly
                    className="w-full rounded-xl border border-[#d2d2d7] bg-gray-50 px-[16px] py-[12px] text-[14px] text-[#6e6e73] outline-none" />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">简介</label>
                  <textarea value={form.bio} readOnly rows={3}
                    className="w-full rounded-xl border border-[#d2d2d7] bg-gray-50 px-[16px] py-[12px] text-[14px] text-[#6e6e73] outline-none resize-none" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


