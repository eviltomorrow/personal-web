export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center">
          <svg
            viewBox="0 0 18 22"
            className="mb-8 h-[44px] w-[36px]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.652 11.78c-.027-2.96 2.41-4.382 2.52-4.452-1.372-2.006-3.508-2.28-4.269-2.312-1.818-.184-3.547 1.07-4.47 1.07-.921 0-2.346-1.043-3.855-1.016-1.983.028-3.81 1.153-4.832 2.931-2.06 3.574-.527 8.87 1.48 11.77.98 1.416 2.15 3.006 3.686 2.95 1.48-.062 2.04-.955 3.827-.955 1.787 0 2.29.955 3.855.925 1.59-.027 2.599-1.443 3.55-2.87 1.118-1.635 1.578-3.217 1.605-3.298-.035-.017-3.08-1.183-3.11-4.694z"
              fill="currentColor"
            />
            <path
              d="M12.009 3.437c.815-.987 1.363-2.36 1.213-3.727-1.172.047-2.592.78-3.435 1.764-.754.874-1.414 2.27-1.236 3.61 1.307.101 2.644-.664 3.458-1.647z"
              fill="currentColor"
            />
          </svg>

          <h1 className="mb-2 text-[27px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
            Sign in
          </h1>
          <p className="mb-8 text-center text-[15px] leading-[1.4] text-[#6e6e73]">
            Use your Apple ID to sign in.
          </p>
        </div>

        <form className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email or phone number
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email or phone number"
              className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[18px] py-[14px] text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-[#d2d2d7] bg-white px-[18px] py-[14px] text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-[#0071e3] py-[14px] text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] active:bg-[#006edb]"
          >
            Sign in
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-5 text-center text-[13px]">
          <a
            href="#"
            className="text-[#0071e3] hover:underline"
          >
            Forgot Apple ID or password?
          </a>
          <div className="h-[1px] w-full max-w-[120px] bg-[#d2d2d7]" />
          <p className="text-[#6e6e73]">
            Don&apos;t have an Apple ID?{" "}
            <a href="#" className="text-[#0071e3] hover:underline">
              Create yours now.
            </a>
          </p>
        </div>

        <div className="mt-12 text-center text-[11px] text-[#86868b]">
          <a href="#" className="hover:underline">
            Copyright © 2025 Apple Inc. All rights reserved.
          </a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}
