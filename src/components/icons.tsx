"use client";

import type { ReactNode } from "react";

function Icon({ path, viewBox = "0 0 20 20" }: { path: string; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {path.split("|").map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

export const I = {
  Home:     <Icon path="M2 10l8-7 8 7M4 8v7a2 2 0 002 2h8a2 2 0 002-2V8" />,
  Chart:    <Icon path="M2 18V4m4 14V8m4 10v-6m4 6V6m4 12V2" />,
  User:     <Icon path="M14 6a4 4 0 11-8 0 4 4 0 018 0zM2 18c0-2.5 2-5 8-5s8 2.5 8 5" />,
  Bell:     <Icon path="M10 2a6 6 0 00-6 6v3l-1 3h14l-1-3V8a6 6 0 00-6-6z|M8 16a2 2 0 004 0" />,
  Search:   <Icon path="M8.5 3a5.5 5.5 0 100 11 5.5 5.5 0 000-11z|M13 13l4 4" />,
  ChevronL: <Icon path="M12 4l-6 6 6 6" />,
};

export interface NavItem {
  key: string;
  icon: ReactNode;
  label: string;
  badge?: string;
}

export const navItems: NavItem[] = [
  { key: "home",          icon: I.Home,  label: "首页" },
  { key: "balance-sheet", icon: I.Chart, label: "资产与负债" },
];
