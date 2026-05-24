"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTokens } from "@/lib/auth";

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

      router.push("/home");
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
            登录
          </h1>

        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              邮箱或手机号码
            </label>
            <input
              id="email"
              type="email"
              placeholder="邮箱或手机号码"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[18px] py-[14px] text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              密码
            </label>
            <input
              id="password"
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="mt-8 text-center text-[11px] text-[#86868b]">
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
