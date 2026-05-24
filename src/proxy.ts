import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const apiHost = process.env.API_HOST || "http://127.0.0.1:8080";
    return NextResponse.rewrite(new URL(pathname + search, apiHost));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
