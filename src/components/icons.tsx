"use client";

import type { ReactNode } from "react";

function Icon({ path, viewBox = "0 0 20 20" }: { path: string; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {path.split("|").map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

export function Svg({ children, className = "h-5 w-5" }: { children: ReactNode; className?: string }) {
  return <svg viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

export const I = {
  Home:       <Icon path="M2 10l8-7 8 7M4 8v7a2 2 0 002 2h8a2 2 0 002-2V8" />,
  Notebook:   <Icon path="M4 2h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z|M8 6h4m-4 4h4m-4 4h2" />,
  Folder:     <Icon path="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />,
  Bookmark:   <Icon path="M5 2h10a1 1 0 011 1v15l-6-4-6 4V3a1 1 0 011-1z" />,
  Photo:      <Icon path="M2 4h16a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V5a1 1 0 011-1z|M7 8a1 1 0 110-2 1 1 0 010 2z|M2 13l4-4 3 3 4-5 5 6" />,
  Calendar:   <Icon path="M3 4h14a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z|M3 8h14|M7 2v3m6-3v3" />,
  Chart:      <Icon path="M2 18V4m4 14V8m4 10v-6m4 6V6m4 12V2" />,
  Gear:       <Icon path="M11.49 2.5H8.51l-.49 1.87-.99.41-1.7-.98-1.99 1.99.98 1.7-.41.99-1.87.49v2.98l1.87.49.41.99-.98 1.7 1.99 1.99 1.7-.98.99.41.49 1.87h2.98l.49-1.87.99-.41 1.7.98 1.99-1.99-.98-1.7.41-.99 1.87-.49V8.51l-1.87-.49-.41-.99.98-1.7-1.99-1.99-1.7.98-.99-.41L11.49 2.5z|M10 10a1 1 0 110-2 1 1 0 010 2z" />,
  User:       <Icon path="M14 6a4 4 0 11-8 0 4 4 0 018 0zM2 18c0-2.5 2-5 8-5s8 2.5 8 5" />,
  Bell:       <Icon path="M10 2a6 6 0 00-6 6v3l-1 3h14l-1-3V8a6 6 0 00-6-6z|M8 16a2 2 0 004 0" />,
  Search:     <Icon path="M8.5 3a5.5 5.5 0 100 11 5.5 5.5 0 000-11z|M13 13l4 4" />,
  ChevronL:   <Icon path="M12 4l-6 6 6 6" />,
  Clock:      <Icon path="M10 2a8 8 0 100 16 8 8 0 000-16z|M10 6v4l3 2" />,
  Sun:        <Icon path="M10 1v2m0 14v2M3.5 3.5l1.4 1.4m10.2 10.2l1.4 1.4M1 10h2m14 0h2M3.5 16.5l1.4-1.4m10.2-10.2l1.4-1.4" />,
  Moon:       <Icon path="M18 11.5A8.5 8.5 0 018.5 3 7 7 0 1018 13.5z" />,
  Sparkle:    <Icon path="M10 1l1.5 4.5L16 7l-4.5 1.5L10 13l-1.5-4.5L4 7l4.5-1.5L10 1z|M6 14l.7 2.3L9 17l-2.3.7L6 20l-.7-2.3L3 17l2.3-.7L6 14z" />,
  ArrowUp:    <Icon path="M10 15V5m0 0l-4 4m4-4l4 4" />,
  More:       <Icon path="M10 5a1 1 0 100-2 1 1 0 000 2z|M10 11a1 1 0 100-2 1 1 0 000 2z|M10 17a1 1 0 100-2 1 1 0 000 2z" />,
};

export interface NavItem {
  key: string;
  icon: ReactNode;
  label: string;
  badge?: string;
}

export const navItems: NavItem[] = [
  { key: "home",          icon: I.Home,     label: "首页" },
  { key: "balance-sheet", icon: I.Chart,    label: "资产与负债" },
];
