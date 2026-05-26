"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAccessToken, isTokenExpired } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    Promise.resolve().then(() => {
      setAuthorized(!!token && !isTokenExpired());
    });
  }, []);

  if (authorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7]">
        <div className="h-8 w-8 animate-pulse rounded-full bg-[#0071e3]/20" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-[#0071e3]/[0.06] to-transparent rounded-[50%] blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-[400px]">
          <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 px-10 py-10 shadow-sm backdrop-blur-xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
              <svg viewBox="0 0 20 20" fill="white" className="h-7 w-7">
                <path d="M10 2a6 6 0 00-6 6v2H3a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2h-1V8a6 6 0 00-6-6zM6 10V8a4 4 0 118 0v2H6z" />
              </svg>
            </div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              请先登录
            </h1>
            <p className="mt-2 text-[14px] text-[#86868b]">
              您需要登录后才能访问此页面。
            </p>
            <Link
              href="/"
              className="mt-6 inline-block w-full rounded-full bg-[#0071e3] py-[14px] text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] shadow-sm cursor-pointer"
            >
              前往登录
            </Link>
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
            版权所有 © 2025 liarsa Inc. 保留所有权利。
          </div>
        </div>
      </div>
    );
  }

  return children;
}
