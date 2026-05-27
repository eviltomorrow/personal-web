"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { navItems } from "@/components/icons";
import { apiClient } from "@/lib/api";
import { saveUserInfo, getAccessToken } from "@/lib/auth";
import type { UserInfo } from "@/lib/auth";

const GENDER_LABELS = ["保密", "男", "女"];

function toDateString(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return d.toISOString().split("T")[0];
}

function toTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    nickname: "",
    email: "",
    phone: "",
    gender: 0,
    birthday: "",
    bio: "",
  });

  const [profile, setProfile] = useState<UserInfo | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    apiClient("/api/v1/user/profile")
      .then((res) => res.json())
      .then((body) => {
        if (body.code === 0 && body.data) {
          const d = body.data;
          setProfile(d);
          setForm({
            nickname: d.nickname || "",
            email: d.email || "",
            phone: d.phone || "",
            gender: d.gender ?? 0,
            birthday: toDateString(d.birthday),
            bio: d.bio || "",
          });
        } else {
          setError(body.message || "加载失败");
        }
      })
      .catch(() => setError("网络错误"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.nickname.trim()) {
      setError("昵称不能为空");
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient("/api/v1/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: form.nickname,
          email: form.email || undefined,
          phone: form.phone || undefined,
          gender: form.gender,
          birthday: toTimestamp(form.birthday),
          bio: form.bio || undefined,
        }),
      });
      const body = await res.json();
      if (body.code !== 0) {
        setError(body.message || "保存失败");
        return;
      }
      saveUserInfo({
        user_id: profile?.user_id,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
        avatar_url: profile?.avatar_url,
        gender: form.gender,
        birthday: toTimestamp(form.birthday),
        bio: form.bio,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    setError("");
    if (file.size > 5 * 1024 * 1024) {
      setError("头像图片不能超过 5MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const uploadRes = await apiClient("/api/v1/user/avatar/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const uploadBody = await uploadRes.json();
      if (uploadBody.code !== 0) {
        setError(uploadBody.message || "获取上传地址失败");
        return;
      }
      const { presigned_url, object_key } = uploadBody.data;
      await fetch(presigned_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      const confirmRes = await apiClient("/api/v1/user/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: presigned_url.split("?")[0], avatar_key: object_key }),
      });
      const confirmBody = await confirmRes.json();
      if (confirmBody.code !== 0) {
        setError(confirmBody.message || "确认头像失败");
        return;
      }
      const avatarUrl = confirmBody.data?.avatar_url || presigned_url.split("?")[0];
      setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev);
      saveUserInfo({ nickname: form.nickname, email: form.email, avatar_url: avatarUrl });
      setPreviewUrl(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("头像上传失败，请稍后重试");
    } finally {
      setAvatarUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    handleAvatarUpload(file);
  }

  function handleNavChange(key: string) {
    if (key === "home") router.push("/home");
    else if (key === "balance-sheet") router.push("/balance-sheet");
    else if (key === "settings") router.push("/settings");
  }

  return (
    <AuthGuard>
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

            {loading ? (
              <div className="space-y-5 animate-pulse">
                <div className="flex items-center gap-5 mb-8">
                  <div className="h-20 w-20 rounded-full bg-[#e8e8ed]" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-[#e8e8ed]" />
                    <div className="h-3 w-48 rounded bg-[#e8e8ed]" />
                  </div>
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-[52px] rounded-xl bg-[#e8e8ed]" />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 px-8 py-8 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center gap-5 pb-8 border-b border-[#f0f0f0]">
                    <div className="relative h-20 w-20 flex-shrink-0 group cursor-pointer" onClick={() => fileRef.current?.click()}>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0071e3] via-[#4a9eff] to-[#005bbf] p-[2px] shadow-[0_4px_16px_rgba(0,113,227,0.25)]">
                        <div className="h-full w-full overflow-hidden rounded-full bg-white">
                          {previewUrl ? (
                            <Image src={previewUrl} alt="" width={80} height={80} className="h-full w-full object-cover" />
                          ) : profile?.avatar_url ? (
                            <Image src={profile.avatar_url} alt="" width={80} height={80} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0071e3] to-[#005bbf] text-[28px] font-semibold text-white">
                              {form.nickname.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {avatarUploading ? (
                          <svg className="h-6 w-6 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 20 20" fill="white" className="h-6 w-6">
                            <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4z" />
                            <path d="M10 8a3 3 0 100 6 3 3 0 000-6z" />
                          </svg>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                    <div>
                      <p className="text-[16px] font-semibold text-[#1d1d1f]">{form.nickname || "用户"}</p>
                      <p className="text-[13px] text-[#86868b] mt-0.5">{form.email || profile?.email || ""}</p>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-500 border border-red-100">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-[13px] text-emerald-600 border border-emerald-100 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      保存成功
                    </div>
                  )}

                  <div className="mt-6 space-y-5">
                    <Field label="昵称" required>
                      <input type="text" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                        placeholder="您的昵称"
                        className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[16px] py-[12px] text-[14px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200" />
                    </Field>

                    <Field label="手机号">
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="未设置"
                        className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[16px] py-[12px] text-[14px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200" />
                    </Field>

                    <Field label="邮箱">
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="未设置"
                        className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[16px] py-[12px] text-[14px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200" />
                    </Field>

                    <Field label="性别">
                      <div className="flex gap-3">
                        {GENDER_LABELS.map((label, i) => (
                          <label key={i} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-[10px] text-[14px] transition-all duration-200 ${
                            form.gender === i
                              ? "border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3] font-medium"
                              : "border-[#d2d2d7] text-[#6e6e73] hover:border-[#b0b0b5]"
                          }`}>
                            <input type="radio" name="gender" checked={form.gender === i} onChange={() => setForm({ ...form, gender: i })}
                              className="sr-only" />
                            <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                              form.gender === i ? "border-[#0071e3]" : "border-[#d2d2d7]"
                            }`}>
                              {form.gender === i && <span className="h-2 w-2 rounded-full bg-[#0071e3]" />}
                            </span>
                            {label}
                          </label>
                        ))}
                      </div>
                    </Field>

                    <Field label="生日">
                      <input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                        className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[16px] py-[12px] text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200" />
                    </Field>

                    <Field label="简介">
                      <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        placeholder="写一段关于自己的介绍..."
                        rows={3}
                        className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[16px] py-[12px] text-[14px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200 resize-none" />
                    </Field>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => router.back()}
                    className="rounded-full border border-[#d2d2d7] px-6 py-[12px] text-[14px] font-medium text-[#6e6e73] transition-all duration-200 hover:bg-[#f5f5f7] cursor-pointer">
                    取消
                  </button>
                  <button type="submit" disabled={saving}
                    className="rounded-full bg-[#0071e3] px-6 py-[12px] text-[14px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] active:bg-[#006edb] disabled:opacity-50 shadow-sm cursor-pointer disabled:cursor-not-allowed">
                    {saving ? "保存中..." : "保存修改"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
