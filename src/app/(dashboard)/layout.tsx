"use client";

import { useState, useEffect } from "react";
import { isLoggedIn } from "@/lib/api";
import LoginPrompt from "@/components/login-prompt";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#f5f5f7]" />;
  }

  if (!isLoggedIn()) {
    return <LoginPrompt />;
  }

  return <>{children}</>;
}
