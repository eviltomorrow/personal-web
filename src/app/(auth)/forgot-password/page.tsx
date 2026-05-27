import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-[#0071e3]/[0.06] to-transparent rounded-[50%] blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[400px]">
        <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 px-10 py-10 shadow-sm backdrop-blur-xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f5f7]">
            <svg viewBox="0 0 20 20" fill="none" className="h-7 w-7 text-[#86868b]" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 8V6a6 6 0 1112 0v2h1a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2v-6a2 2 0 012-2h1zm12 0H4V6a6 6 0 1112 0v2zM3 10v6h14v-6H3z" />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
            忘记密码
          </h1>
          <p className="mt-3 text-[14px] text-[#86868b]">
            密码重置功能暂未开放，请联系管理员处理。
          </p>
          <Link
            href="/"
            className="mt-6 inline-block w-full rounded-full bg-[#0071e3] py-[14px] text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] shadow-sm cursor-pointer"
          >
            返回登录
          </Link>
        </div>
      </div>
    </div>
  );
}
