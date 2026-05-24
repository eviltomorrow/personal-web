"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nickname || !email || !password || !confirmPassword) {
      setError("请填写所有字段");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, email, password }),
      });

      const body = await res.json();

      if (body.code !== 0) {
        setError(body.message || "注册失败");
        return;
      }

      setSuccess(true);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-[#0071e3]/[0.06] to-transparent rounded-[50%] blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[400px]">
        <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 px-10 py-10 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#005bbf] shadow-sm">
              <svg viewBox="0 0 20 20" fill="white" className="h-6 w-6">
                <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM3 18c0-2.5 2-5 7-5s7 2.5 7 5" />
              </svg>
            </div>
            <h1 className="text-[27px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              创建账户
            </h1>
            <p className="mt-1 text-[14px] text-[#86868b]">填写以下信息完成注册</p>
          </div>

          <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nickname" className="text-[12px] font-medium text-[#6e6e73]">昵称</label>
              <input
                id="nickname"
                type="text"
                placeholder="您的昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#d2d2d7] bg-white px-[18px] py-[14px] text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-[12px] font-medium text-[#6e6e73]">邮箱</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#d2d2d7] bg-white px-[18px] py-[14px] text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-[12px] font-medium text-[#6e6e73]">密码</label>
              <input
                id="password"
                type="password"
                placeholder="至少 8 位字符"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#d2d2d7] bg-white px-[18px] py-[14px] text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-[12px] font-medium text-[#6e6e73]">确认密码</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#d2d2d7] bg-white px-[18px] py-[14px] text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200"
              />
            </div>

            {error && (
              <p className="text-[13px] text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-[#0071e3] py-[14px] text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] active:bg-[#006edb] disabled:opacity-50 shadow-sm"
            >
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-[14px] text-[#86868b]">已有账户？</span>
            <Link
              href="/"
              className="ml-1 text-[14px] font-medium text-[#0071e3] transition-colors duration-200 hover:text-[#0077ed] hover:underline"
            >
              登录
            </Link>
          </div>
        </div>

        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#d2d2d7]/40" />
          </div>
          <div className="relative bg-gradient-to-r from-transparent via-white to-transparent px-4">
            <div className="mx-auto h-1.5 w-24 rounded-full bg-gradient-to-r from-transparent via-[#0071e3]/30 to-transparent" />
          </div>
        </div>

        <div className="text-center text-[11px] text-[#86868b]">
          <a href="#" className="hover:underline">版权所有 © 2025 liarsa Inc. 保留所有权利。</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">隐私政策</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">服务条款</a>
        </div>
      </div>

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-[360px] rounded-3xl bg-white/95 p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[20px] font-semibold text-[#1d1d1f]">注册成功</h2>
            <p className="mt-2 text-[14px] text-[#86868b]">您的账户已创建成功，请前往登录。</p>
            <Link
              href="/"
              className="mt-6 inline-block w-full rounded-full bg-[#0071e3] py-[14px] text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] shadow-sm"
            >
              前往登录
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}