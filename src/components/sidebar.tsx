"use client";

import { useState } from "react";
import { I, type NavItem } from "./icons";

export default function Sidebar({
  items,
  activeNav,
  onNavChange,
}: {
  items: NavItem[];
  activeNav: string;
  onNavChange: (key: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`flex flex-col border-r border-[#e8e8ed]/70 bg-white/95 backdrop-blur-xl transition-all duration-300 ${collapsed ? "w-[60px]" : "w-[220px]"}`}>
      <div className={`flex h-14 items-center border-b border-[#f0f0f0] ${collapsed ? "justify-center" : "gap-3 px-4"}`}>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071e3] via-[#4a9eff] to-[#005bbf] text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(0,113,227,0.3)]">
          L
        </div>
        <span className={`overflow-hidden whitespace-nowrap text-[15px] font-semibold text-[#1d1d1f] tracking-[-0.01em] transition-all duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"}`}>
          liarsa
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {items.map((item) => {
          const active = activeNav === item.key;
          return (
            <button key={item.key} onClick={() => onNavChange(item.key)}
              className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                active
                  ? "bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                  : "text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100"}`}>{item.label}</span>
              {item.badge && !collapsed && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${active ? "bg-white/20 text-white" : "bg-[#0071e3]/10 text-[#0071e3]"}`}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#f0f0f0] px-2 py-3">
        <button onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] text-[#86868b] transition-all duration-200 hover:bg-[#f5f5f7] cursor-pointer"
        >
          <span className={`flex-shrink-0 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}>{I.ChevronL}</span>
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[80px] opacity-100"}`}>收起侧栏</span>
        </button>
      </div>
    </aside>
  );
}
