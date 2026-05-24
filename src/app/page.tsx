"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTokens, saveUserInfo } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("请输入邮箱和密码");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json();

      if (body.code !== 0) {
        setError(body.message || "登录失败");
        return;
      }

      saveTokens({
        accessToken: body.data.access_token,
        refreshToken: body.data.refresh_token,
        expiresAt: body.data.expires_at,
      });

      saveUserInfo({
        nickname: body.data.nickname,
        email: body.data.email,
      });

      router.push("/home");
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
              登录
            </h1>
            <p className="mt-1 text-[14px] text-[#86868b]">欢迎回到 liarsa</p>
          </div>

          <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="text-[12px] font-medium text-[#6e6e73]">
                邮箱或手机号码
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
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[12px] font-medium text-[#6e6e73]">
                  密码
                </label>
                <a href="/forgot-password" className="text-[12px] text-[#0071e3] hover:underline">
                  忘记密码？
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-[14px] text-[#86868b]">还没有账户？</span>
            <a
              href="/register"
              className="ml-1 text-[14px] font-medium text-[#0071e3] transition-colors duration-200 hover:text-[#0077ed] hover:underline"
            >
              注册
            </a>
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
