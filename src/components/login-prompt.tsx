export default function LoginPrompt({ message = "您需要登录后才能访问此页面。" }: { message?: string }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-[#0071e3]/[0.06] to-transparent rounded-[50%] blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[400px]">
        <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 px-10 py-10 shadow-sm backdrop-blur-xl text-center">
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff9f0a] to-[#d68000] shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4" />
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <h1 className="text-[27px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">请先登录</h1>
            <p className="mt-1 text-[14px] text-[#86868b]">{message}</p>
            <a href="/login"
              className="mt-6 inline-block w-full rounded-full bg-[#0071e3] py-[14px] text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] shadow-sm cursor-pointer text-center no-underline">
              前往登录
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

        <div className="text-center text-[11px] text-[#86868b]">版权所有 © 2025 liarsa Inc. 保留所有权利。</div>
      </div>
    </div>
  );
}
