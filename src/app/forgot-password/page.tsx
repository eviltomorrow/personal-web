"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("请输入邮箱地址");
      return;
    }

    setLoading(true);
    // 后端尚未实现忘记密码功能，直接展示发送成功界面
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
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
                <path d="M4 8V6a6 6 0 1112 0v2h1a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2v-6a2 2 0 012-2h1zm12 0H4V6a6 6 0 1112 0v2zM3 10v6h14v-6H3z" />
              </svg>
            </div>
            <h1 className="text-[27px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              忘记密码
            </h1>
            <p className="mt-1 text-[14px] text-[#86868b]">
              {sent ? "重置链接已发送" : "输入邮箱地址以重置密码"}
            </p>
          </div>

          {sent ? (
            <div className="mt-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[15px] text-[#1d1d1f]">
                如果该邮箱已注册，您将收到一封包含重置链接的邮件。
              </p>
              <p className="mt-2 text-[13px] text-[#86868b]">
                请检查您的收件箱和垃圾邮件。
              </p>
              <Link
                href="/"
                className="mt-6 inline-block w-full rounded-full bg-[#0071e3] py-[14px] text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] shadow-sm"
              >
                返回登录
              </Link>
            </div>
          ) : (
            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="text-[12px] font-medium text-[#6e6e73]">
                  邮箱地址
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "发送中..." : "发送重置链接"}
              </button>
            </form>
          )}
        </div>

        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#d2d2d7]/40" />
          </div>
          <div className="relative bg-gradient-to-r from-transparent via-white to-transparent px-4">
            <div className="mx-auto h-1.5 w-24 rounded-full bg-gradient-to-r from-transparent via-[#0071e3]/30 to-transparent" />
          </div>
        </div>

        <div className="text-center">
          <span className="text-[14px] text-[#86868b]">想起密码了？</span>
          <Link
            href="/"
            className="ml-1 text-[14px] font-medium text-[#0071e3] transition-colors duration-200 hover:text-[#0077ed] hover:underline"
          >
            返回登录
          </Link>
        </div>

        <div className="mt-6 text-center text-[11px] text-[#86868b]">
          <a href="#" className="hover:underline">
            版权所有 © 2025 liarsa Inc. 保留所有权利。
          </a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">
            隐私政策
          </a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">
            服务条款
          </a>
        </div>
      </div>
    </div>
  );
}
