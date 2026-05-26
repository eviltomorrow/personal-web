import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-[#0071e3]/[0.06] to-transparent rounded-[50%] blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[400px]">
        <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 px-10 py-10 shadow-sm backdrop-blur-xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#005bbf] shadow-sm">
            <span className="text-[28px] font-bold text-white">404</span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
            页面未找到
          </h1>
          <p className="mt-2 text-[14px] text-[#86868b]">
            您访问的页面不存在或已被移除。
          </p>
          <Link
            href="/"
            className="mt-6 inline-block w-full rounded-full bg-[#0071e3] py-[14px] text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] shadow-sm cursor-pointer"
          >
            返回首页
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
