"use client";

import { useState } from "react";
import AuthGuard from "@/components/auth-guard";
import Header from "@/components/header";

function PenIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M15.232 2.232a2.5 2.5 0 113.536 3.536L6.5 18.036 2 19l.964-4.5L15.232 2.232z" />
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 18V4m4 14V8m4 10v-6m4 6V6m4 12V2" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 6a4 4 0 11-8 0 4 4 0 018 0zM2 18c0-2.5 2-5 8-5s8 2.5 8 5" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.49 2.5H8.51l-.49 1.87-.99.41-1.7-.98-1.99 1.99.98 1.7-.41.99-1.87.49v2.98l1.87.49.41.99-.98 1.7 1.99 1.99 1.7-.98.99.41.49 1.87h2.98l.49-1.87.99-.41 1.7.98 1.99-1.99-.98-1.7.41-.99 1.87-.49V8.51l-1.87-.49-.41-.99.98-1.7-1.99-1.99-1.7.98-.99-.41L11.49 2.5z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
      <path d="M10 6v8M7 9h3.5a1.5 1.5 0 010 3H7" />
    </svg>
  );
}
function ScaleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 10h16M4 10l2-6h8l2 6M6 14a2 2 0 100 4 2 2 0 000-4zM14 14a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}
function TrendingIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 16l4-6 4 4 8-10" />
    </svg>
  );
}

const tools = [
  { icon: PenIcon, label: "写文章", href: "/home" },
  { icon: FolderIcon, label: "项目", href: "/home" },
  { icon: ChartIcon, label: "统计", href: "/home" },
  { icon: UserIcon, label: "用户", href: "/home" },
  { icon: GearIcon, label: "设置", href: "/home" },
];

const summaryCards = [
  {
    icon: DollarIcon,
    label: "总资产",
    value: "¥ 1,286,450.00",
    change: "+5.2%",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: ScaleIcon,
    label: "总负债",
    value: "¥ 486,200.00",
    change: "-2.1%",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: TrendingIcon,
    label: "净资产",
    value: "¥ 800,250.00",
    change: "+8.3%",
    color: "text-[#0071e3]",
    bg: "bg-blue-50",
  },
];

const assets = {
  title: "资产",
  total: "1,286,450.00",
  items: [
    { label: "货币资金", amount: "386,200.00" },
    { label: "应收账款", amount: "156,800.00" },
    { label: "存货", amount: "89,450.00" },
    { label: "预付账款", amount: "24,000.00" },
    { label: "其他流动资产", amount: "18,000.00" },
    { label: "长期股权投资", amount: "280,000.00" },
    { label: "固定资产", amount: "198,000.00" },
    { label: "无形资产", amount: "86,000.00" },
    { label: "其他非流动资产", amount: "48,000.00" },
  ],
};

const liabilities = {
  title: "负债",
  total: "486,200.00",
  items: [
    { label: "短期借款", amount: "120,000.00" },
    { label: "应付账款", amount: "98,600.00" },
    { label: "应付职工薪酬", amount: "45,800.00" },
    { label: "应交税费", amount: "32,400.00" },
    { label: "其他应付款", amount: "15,200.00" },
    { label: "长期借款", amount: "150,000.00" },
    { label: "应付债券", amount: "24,200.00" },
  ],
};

const equity = {
  title: "所有者权益",
  total: "800,250.00",
  items: [
    { label: "实收资本", amount: "500,000.00" },
    { label: "资本公积", amount: "120,000.00" },
    { label: "盈余公积", amount: "98,000.00" },
    { label: "未分配利润", amount: "82,250.00" },
  ],
};

function formatAmount(amount: string) {
  const parts = amount.split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts[1] ? `${intPart}.${parts[1]}` : intPart;
}

function SectionCard({
  title,
  items,
  total,
  accentClass,
}: {
  title: string;
  items: { label: string; amount: string }[];
  total: string;
  accentClass: string;
}) {
  return (
    <div className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 shadow-sm backdrop-blur-xl overflow-hidden">
      <div className={`px-6 py-4 ${accentClass}`}>
        <h2 className="text-[15px] font-semibold text-[#1d1d1f]">{title}</h2>
      </div>
      <div className="divide-y divide-[#f5f5f7]">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-6 py-3.5 transition-colors duration-200 hover:bg-[#fafafa]"
          >
            <span className="text-[14px] text-[#1d1d1f]">{item.label}</span>
            <span className="text-[14px] tabular-nums text-[#1d1d1f]">
              ¥ {formatAmount(item.amount)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-[#d2d2d7] bg-[#fafafa] px-6 py-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-[#1d1d1f]">合计</span>
          <span className="text-[14px] font-semibold tabular-nums text-[#1d1d1f]">
            ¥ {formatAmount(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BalanceSheetPage() {
  const [expanded, setExpanded] = useState(false);

  return (
    <AuthGuard>
    <div className="relative min-h-screen bg-[#f5f5f7] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-[#0071e3]/[0.06] to-transparent rounded-[50%] blur-3xl pointer-events-none" />

      <div
        className="fixed left-4 top-1/2 z-40 -translate-y-1/2 flex flex-col gap-2"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div
          className={`flex flex-col gap-1.5 rounded-2xl border border-[#d2d2d7]/80 bg-white/90 px-2 py-3 shadow-lg backdrop-blur-xl transition-all duration-300 ${
            expanded ? "w-40" : "w-12"
          }`}
        >
          {tools.map((tool) => (
            <a
              key={tool.label}
              href={tool.href}
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-[13px] text-[#1d1d1f] transition-all duration-200 hover:bg-[#f5f5f7]"
            >
              <span className="flex-shrink-0 text-[#6e6e73]">
                <tool.icon />
              </span>
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  expanded ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                {tool.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      <Header />

      <main className="relative mx-auto max-w-[1100px] px-6 pt-10 pb-20">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              资产负债表
            </h1>
            <span className="rounded-full bg-[#0071e3]/10 px-3 py-1 text-[12px] font-medium text-[#0071e3]">
              截至 2026 年 4 月
            </span>
          </div>
          <p className="mt-1 text-[15px] text-[#6e6e73]">
            查看企业的财务状况概览
          </p>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-3xl border border-[#d2d2d7]/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bg}`}
                >
                  <span className={card.color}>
                    <card.icon />
                  </span>
                </div>
                <p className="text-[13px] font-medium text-[#6e6e73]">
                  {card.label}
                </p>
              </div>
              <p className="mt-3 text-[28px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                {card.value}
              </p>
              <p className={`mt-1 text-[13px] ${card.color}`}>
                {card.change} 较上期
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <SectionCard
              title={assets.title}
              items={assets.items}
              total={assets.total}
              accentClass="bg-emerald-50/60 border-b border-[#d2d2d7]"
            />
          </div>

          <div className="space-y-6">
            <SectionCard
              title={liabilities.title}
              items={liabilities.items}
              total={liabilities.total}
              accentClass="bg-red-50/60 border-b border-[#d2d2d7]"
            />
            <SectionCard
              title={equity.title}
              items={equity.items}
              total={equity.total}
              accentClass="bg-blue-50/60 border-b border-[#d2d2d7]"
            />
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-[#d2d2d7]/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#6e6e73]">
                资产负债率
              </p>
              <p className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                37.8%
              </p>
            </div>
            <div className="h-2 w-48 overflow-hidden rounded-full bg-[#f5f5f7]">
              <div
                className="h-full rounded-full bg-[#0071e3] transition-all duration-500"
                style={{ width: "37.8%" }}
              />
            </div>
            <div className="text-right">
              <p className="text-[13px] font-medium text-[#6e6e73]">
                流动比率
              </p>
              <p className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                1.82
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
