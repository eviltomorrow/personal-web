import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "登录 - liarsa",
  description: "登录您的 liarsa 账户",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f5f5f7]">{children}</body>
    </html>
  );
}
