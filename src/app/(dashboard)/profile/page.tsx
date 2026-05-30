"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { I, navItems } from "@/components/icons";
import { authApi } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    authApi.getProfile().then((data) => {
      const init: Record<string, string> = {};
      for (const k of ["nickname", "email", "phone", "region", "bio", "gender", "birthday", "avatar"]) {
        init[k] = (data as any)[k] || "";
      }
      setForm(init);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function handleNavChange(key: string) {
    if (key === "assets-and-liabilities") router.push("/assets-and-liabilities");
    else if (key === "home") router.push("/home");
  }

  function set(k: string, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await authApi.updateProfile({
        nickname: form.nickname || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        region: form.region || undefined,
        bio: form.bio || undefined,
        gender: form.gender || undefined,
        birthday: form.birthday || undefined,
        avatar: form.avatar || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
  }

  function handleAvatarClick() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      set("avatar", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  const fields: { key: string; label: string; icon: string; type: string; placeholder: string }[] = [
    { key: "nickname", label: "昵称", icon: "M12 5v14M5 12h14", type: "text", placeholder: "输入昵称" },
    { key: "email", label: "邮箱", icon: "M3 5h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2zM3 7l9 6 9-6", type: "email", placeholder: "输入邮箱" },
    { key: "phone", label: "电话", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z", type: "tel", placeholder: "输入电话号码" },
    { key: "region", label: "地区", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z", type: "text", placeholder: "如：中国 · 北京" },
  ];

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] selection:bg-[#0071e3]/20">

      <Sidebar items={navItems} activeNav="profile" onNavChange={handleNavChange} />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />

        <DashboardHeader activeNav="profile" navItems={navItems} />

        <main className="relative flex-1 overflow-y-auto z-10 animate-in fade-in duration-500">
          <div className="mx-auto w-full max-w-[640px] px-6 pt-8 pb-20">

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-6">

                {/* Hero Card */}
                <div className="relative overflow-hidden rounded-3xl border border-[#e8e8ed]/80 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 via-white to-[#34c759]/5" />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#0071e3]/[0.06] to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="relative px-8 py-8">
                    <div className="flex items-center gap-6">
                      <button onClick={handleAvatarClick}
                        className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#e8e8ed] transition-all duration-200 hover:border-[#0071e3] cursor-pointer shadow-sm"
                      >
                        {form.avatar ? (
                          <img src={form.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0071e3]/10 to-[#005bbf]/10 text-[#0071e3]">
                            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/30">
                          <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6 text-white opacity-0 transition-all duration-200 group-hover:opacity-100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 4v12M4 10h12" />
                          </svg>
                        </div>
                      </button>
                      <div className="min-w-0">
                        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1d1d1f] truncate">{form.nickname || "未设置昵称"}</h1>
                        <p className="mt-0.5 text-[14px] text-[#6e6e73]">{form.email || form.phone || "完善您的个人信息"}</p>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="rounded-2xl border border-[#e8e8ed]/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
                      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5"><path d="M12 14v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1M8 7a2 2 0 100-4 2 2 0 000 4z" /></svg>
                    </div>
                    <p className="text-[15px] font-semibold text-[#1d1d1f]">基本信息</p>
                  </div>
                  <div className="space-y-5">
                    {fields.map((f) => (
                      <div key={f.key}>
                        <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#6e6e73] mb-1.5">
                          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d={f.icon} />
                          </svg>
                          {f.label}
                        </label>
                        <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                          onChange={(e) => set(f.key, e.target.value)}
                          className="w-full rounded-xl border border-[#e8e8ed] bg-white px-4 py-2.5 text-[14px] text-[#1d1d1f] outline-none transition-all duration-200 placeholder:text-[#d2d2d7] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 hover:border-[#d2d2d7]"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#6e6e73] mb-2.5">
                        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 1a4 4 0 100 8 4 4 0 000-8zM2 15a6 6 0 0112 0" />
                        </svg>
                        性别
                      </label>
                      <div className="flex items-center gap-2 bg-[#f5f5f7] rounded-xl p-1">
                        {["男", "女", "保密"].map((opt) => (
                          <button key={opt} type="button" onClick={() => set("gender", opt === "保密" ? "" : opt)}
                            className={`flex-1 rounded-lg py-2 text-[14px] font-medium transition-all duration-200 cursor-pointer ${
                              (opt === "保密" ? !form.gender : form.gender === opt)
                                ? "bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                                : "text-[#86868b] hover:text-[#6e6e73]"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#6e6e73] mb-1.5">
                        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6h12M3 3h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z" />
                        </svg>
                        生日
                      </label>
                      <input type="date" value={form.birthday}
                        onChange={(e) => set("birthday", e.target.value)}
                        className="w-full rounded-xl border border-[#e8e8ed] bg-white px-4 py-2.5 text-[14px] text-[#1d1d1f] outline-none transition-all duration-200 placeholder:text-[#d2d2d7] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 hover:border-[#d2d2d7]"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="rounded-2xl border border-[#e8e8ed]/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 3h10v10H3z" />
                          <path d="M6 6h4v4H6z" />
                        </svg>
                      </div>
                      <p className="text-[15px] font-semibold text-[#1d1d1f]">个人简介</p>
                    </div>
                    <span className="text-[11px] text-[#d2d2d7]">{(form.bio || "").length} / 200</span>
                  </div>
                  <textarea value={form.bio} placeholder="介绍一下自己…"
                    onChange={(e) => { if (e.target.value.length <= 200) set("bio", e.target.value); }}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[#e8e8ed] bg-white px-4 py-2.5 text-[14px] text-[#1d1d1f] outline-none transition-all duration-200 placeholder:text-[#d2d2d7] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 hover:border-[#d2d2d7]"
                  />
                </div>

                {/* Save */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button onClick={handleSave} disabled={saving}
                    className={`rounded-full px-8 py-2.5 text-[14px] font-medium text-white transition-all duration-200 shadow-sm cursor-pointer ${
                      saved
                        ? "bg-[#34c759] shadow-[0_2px_8px_rgba(52,199,89,0.3)]"
                        : "bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_2px_8px_rgba(0,113,227,0.25)] active:scale-[0.97]"
                    }`}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        保存中…
                      </span>
                    ) : saved ? "已保存 ✓" : "保存修改"}
                  </button>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
