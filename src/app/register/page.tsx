"use client";

import { useState } from "react";

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
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center">
          <h1 className="mb-2 text-[27px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
            创建账户
          </h1>
          <p className="mb-6 text-[14px] text-[#86868b]">填写以下信息完成注册</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nickname" className="sr-only">昵称</label>
            <input
              id="nickname"
              type="text"
              placeholder="昵称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[18px] py-[14px] text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">邮箱</label>
            <input
              id="email"
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[18px] py-[14px] text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">密码</label>
            <input
              id="password"
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[18px] py-[14px] text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="sr-only">确认密码</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[18px] py-[14px] text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-[#0071e3] py-[14px] text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] active:bg-[#006edb] disabled:opacity-50"
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-[14px] text-[#86868b]">已有账户？</span>
          <a
            href="/"
            className="ml-1 text-[14px] font-medium text-[#0071e3] transition-colors duration-200 hover:text-[#0077ed] hover:underline"
          >
            登录
          </a>
        </div>

        <div className="mt-8 text-center text-[11px] text-[#86868b]">
          <a href="#" className="hover:underline">版权所有 © 2025 liarsa Inc. 保留所有权利。</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">隐私政策</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">服务条款</a>
        </div>
      </div>

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-[340px] rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]">注册成功</h2>
            <p className="mt-2 text-[14px] text-[#86868b]">您的账户已创建成功，请前往登录。</p>
            <a
              href="/"
              className="mt-5 inline-block w-full rounded-full bg-[#0071e3] py-[12px] text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed]"
            >
              前往登录
            </a>
          </div>
        </div>
      )}
    </div>
  );
}