import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sign In - Apple",
  description: "Sign in to your Apple account",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f5f5f7]">{children}</body>
    </html>
  );
}
