"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { navItems } from "@/components/icons";
import { useUser } from "@/lib/user-context";
import { userApi } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useUser();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState(0);
  const [birthday, setBirthday] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setGender(user.gender ?? 0);
      setBirthday(user.birthday ? new Date(user.birthday * 1000).toISOString().split("T")[0] : "");
      setBio(user.bio || "");
    }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const bd = birthday ? Math.floor(new Date(birthday).getTime() / 1000) : 0;
      await userApi.updateProfile({
        nickname: nickname || undefined,
        gender,
        birthday: bd || undefined,
        bio: bio || undefined,
      });
      setMessage("保存成功");
      refreshUser();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  function handleNavChange(key: string) {
    if (key === "home") router.push("/home");
    else if (key === "assets-and-liabilities") router.push("/assets-and-liabilities");
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
                          {nickname.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#1d1d1f]">{nickname || "用户"}</p>
                  <p className="text-[13px] text-[#86868b] mt-0.5">{email || ""}</p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">昵称 <span className="text-red-400 ml-0.5">*</span></label>
                  <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                    className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[16px] py-[12px] text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200" />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">手机号</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[16px] py-[12px] text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200" />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">邮箱</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[16px] py-[12px] text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200" />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">性别</label>
                  <div className="flex gap-3">
                    {["保密", "男", "女"].map((label, i) => (
                      <button key={i} onClick={() => setGender(i)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-[10px] text-[14px] transition-all duration-200 cursor-pointer ${
                          gender === i
                            ? "border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3] font-medium"
                            : "border-[#d2d2d7] text-[#6e6e73] hover:border-[#b0b0b5]"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">生日</label>
                  <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)}
                    className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[16px] py-[12px] text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200" />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">简介</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                    className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[16px] py-[12px] text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200 resize-none" />
                </div>
              </div>

              {message && (
                <p className={`mt-4 text-[13px] text-center ${message === "保存成功" ? "text-green-600" : "text-red-500"}`}>
                  {message}
                </p>
              )}

              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} disabled={saving}
                  className="rounded-full bg-[#0071e3] px-8 py-[12px] text-[14px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] shadow-sm cursor-pointer disabled:opacity-50">
                  {saving ? "保存中..." : "保存"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
