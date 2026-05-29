"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { I, navItems } from "@/components/icons";
import { financeApi, isLoggedIn } from "@/lib/api";

interface Entry {
  id: string;
  name: string;
  amount: number;
  code?: string;
  quantity?: number;
  sort_order?: number;
}

interface Group {
  id: string;
  label: string;
  type: string;
  sort_order?: number;
  entries: Entry[];
}

type Section = "assets" | "liabilities" | "income" | "expenses";

interface SheetData {
  assets: Group[];
  liabilities: Group[];
  income: Group[];
  expenses: Group[];
}

interface SheetStore {
  [month: string]: SheetData;
}

const STORAGE_KEY = "balance_sheet_store";
const GROUP_TYPES = [
  { value: "cash", label: "现金类" },
  { value: "fund", label: "基金" },
  { value: "stock", label: "股票" },
  { value: "property", label: "固定资产" },
  { value: "loan", label: "贷款" },
  { value: "credit", label: "信用卡" },
  { value: "income", label: "收入" },
  { value: "expense", label: "开支" },
  { value: "other", label: "其他" },
];

const INPUT_CLS = "rounded-lg border border-[#d2d2d7] px-3 py-2 text-[13px] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 bg-white";
const INPUT_SM_CLS = "rounded-md border border-[#d2d2d7] px-2 py-1 text-[11px] outline-none focus:border-[#0071e3] bg-white";

const SECTION_META: Record<string, { label: string; icon: React.ReactNode; totalColor: string; iconColor: string }> = {
  assets: {
    label: "资产",
    icon: <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5"><path d="M10 2v16M4 10l6-6 6 6" /></svg>,
    totalColor: "text-[#34c759]",
    iconColor: "bg-emerald-50 text-emerald-600",
  },
  liabilities: {
    label: "负债",
    icon: <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5"><path d="M10 2v16M4 10l6 6 6-6" /></svg>,
    totalColor: "text-red-500",
    iconColor: "bg-red-50 text-red-500",
  },
};

const TABLE_SIZE = {
  normal: { cell: "py-3 pr-6 text-[14px]", label: "text-[14px] font-semibold", sum: "py-3.5 text-[15px]", header: "pb-3 text-[13px]", icon: "text-[12px]" },
  small: { cell: "py-2 pr-4 text-[12px]", label: "text-[12px] font-semibold", sum: "py-2.5 text-[13px]", header: "pb-2 text-[12px]", icon: "text-[11px]" },
};

function defaultSheet(): SheetData {
  return { assets: [], liabilities: [], income: [], expenses: [] };
}

let idCounter = Date.now();
function genId() { return `e_${++idCounter}`; }

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(m: string): string {
  const d = new Date(m + "-01");
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
}

function prevMonth(m: string): string {
  const d = new Date(m + "-01");
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
}

function nextMonth(m: string): string {
  const d = new Date(m + "-01");
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 7);
}

function loadStore(): SheetStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SheetStore;
  } catch { /* ignore */ }
  return {};
}



function saveStore(s: SheetStore) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

async function loadFromAPI(): Promise<SheetData | null> {
  if (!isLoggedIn()) return null;
  try {
    const [assetCats, liabilityCats, incomeCats, expenseCats] = await Promise.all([
      financeApi.listAssetCategories(),
      financeApi.listLiabilityCategories(),
      financeApi.listTransactionCategories(1),
      financeApi.listTransactionCategories(2),
    ]);

    const assetIds = assetCats.categories.map((c) => c.category_id);
    const liabilityIds = liabilityCats.categories.map((c) => c.category_id);
    const incomeIds = incomeCats.categories.map((c) => c.category_id);
    const expenseIds = expenseCats.categories.map((c) => c.category_id);

    const [assetsRes, liabilitiesRes] = await Promise.all([
      financeApi.listAssets(),
      financeApi.listLiabilities(),
    ]);

    const now = new Date();
    const startDate = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
    const endDate = Math.floor(new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime() / 1000);

    const [incomeTxRes, expenseTxRes] = await Promise.all([
      financeApi.listTransactions({ type: 1, start_date: startDate, end_date: endDate, page_size: 1000 }),
      financeApi.listTransactions({ type: 2, start_date: startDate, end_date: endDate, page_size: 1000 }),
    ]);

    function buildGroups(
      cats: { category_id: string; name: string; sort_order: number }[],
      items: { category_id: string; name: string; amount: number }[],
      typeVal: string,
    ): Group[] {
      return cats.map((cat, i) => ({
        id: cat.category_id,
        label: cat.name,
        type: typeVal,
        sort_order: cat.sort_order,
        entries: items
          .filter((it) => it.category_id === cat.category_id)
          .map((it, ei) => ({
            id: `${cat.category_id}_${ei}`,
            name: it.name,
            amount: it.amount,
            sort_order: ei,
          })),
      }));
    }

    return {
      assets: buildGroups(assetCats.categories, assetsRes.assets, "cash"),
      liabilities: buildGroups(liabilityCats.categories, liabilitiesRes.liabilities, "loan"),
      income: buildGroups(incomeCats.categories, incomeTxRes.transactions.map((t) => ({ ...t, name: t.description })), "income"),
      expenses: buildGroups(expenseCats.categories, expenseTxRes.transactions.map((t) => ({ ...t, name: t.description })), "expense"),
    };
  } catch {
    return null;
  }
}

async function syncGroupToAPI(section: Section, group: Group, _action: "create" | "update" | "delete"): Promise<string | null> {
  if (!isLoggedIn()) return null;
  try {
    if (section === "assets") {
      if (_action === "create") {
        const res = await financeApi.createAssetCategory({ name: group.label, sort_order: group.sort_order || 0 });
        return res.category_id;
      } else if (_action === "update") {
        await financeApi.updateAssetCategory(group.id, { name: group.label, sort_order: group.sort_order });
        return group.id;
      } else if (_action === "delete") {
        await financeApi.deleteAssetCategory(group.id);
        return null;
      }
    } else if (section === "liabilities") {
      if (_action === "create") {
        const res = await financeApi.createLiabilityCategory({ name: group.label, sort_order: group.sort_order || 0 });
        return res.category_id;
      } else if (_action === "update") {
        await financeApi.updateLiabilityCategory(group.id, { name: group.label, sort_order: group.sort_order });
        return group.id;
      } else if (_action === "delete") {
        await financeApi.deleteLiabilityCategory(group.id);
        return null;
      }
    }
  } catch { /* background sync, ignore */ }
  return null;
}

async function syncEntryToAPI(section: Section, categoryId: string, entry: Entry, _action: "create" | "update" | "delete"): Promise<string | null> {
  if (!isLoggedIn()) return null;
  try {
    if (section === "assets") {
      if (_action === "create") {
        const res = await financeApi.createAsset({ category_id: categoryId, name: entry.name, amount: entry.amount });
        return res.asset_id;
      } else if (_action === "update") {
        await financeApi.updateAsset(entry.id, { name: entry.name, amount: entry.amount });
        return entry.id;
      } else if (_action === "delete") {
        await financeApi.deleteAsset(entry.id);
        return null;
      }
    } else if (section === "liabilities") {
      if (_action === "create") {
        const res = await financeApi.createLiability({ category_id: categoryId, name: entry.name, amount: entry.amount });
        return res.liability_id;
      } else if (_action === "update") {
        await financeApi.updateLiability(entry.id, { name: entry.name, amount: entry.amount });
        return entry.id;
      } else if (_action === "delete") {
        await financeApi.deleteLiability(entry.id);
        return null;
      }
    }
  } catch { /* background sync, ignore */ }
  return null;
}

function fmt(n: number): string {
  return "¥ " + n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function totalGroup(g: Group): number {
  return g.entries.reduce((s, e) => s + e.amount, 0);
}

const GROUP_COLORS: Record<string, string> = {
  cash: "text-emerald-600 bg-emerald-50 border-emerald-200/50",
  fund: "text-blue-600 bg-blue-50 border-blue-200/50",
  stock: "text-violet-600 bg-violet-50 border-violet-200/50",
  property: "text-orange-600 bg-orange-50 border-orange-200/50",
  other: "text-slate-600 bg-slate-50 border-slate-200/50",
  loan: "text-red-500 bg-red-50 border-red-200/50",
  credit: "text-amber-600 bg-amber-50 border-amber-200/50",
  income: "text-green-600 bg-green-50 border-green-200/50",
  expense: "text-orange-600 bg-orange-50 border-orange-200/50",
};

const GROUP_ICONS: Record<string, React.ReactNode> = {
  cash: <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0z" /><path d="M10 6v8M7 9h3.5a1.5 1.5 0 010 3H7" /></svg>,
  fund: <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><path d="M2 18V4m4 14V8m4 10v-6m4 6V6m4 12V2" /></svg>,
  stock: <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><path d="M2 16l4-6 4 4 8-10" /></svg>,
  property: <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><path d="M2 10l8-7 8 7M4 8v7a2 2 0 002 2h8a2 2 0 002-2V8" /></svg>,
  loan: <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h12v12H4z" /><path d="M8 8h4M8 12h4" /></svg>,
  credit: <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h14v10H3z" /><path d="M3 10h14" /></svg>,
  income: <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><path d="M10 2v16M4 10l6-6 6 6" /></svg>,
  expense: <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><path d="M10 2v16M4 10l6 6 6-6" /></svg>,
  other: <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8" /><path d="M10 6v8M7 9h6" /></svg>,
};

function getGroups(d: SheetData, section: Section): Group[] {
  if (section === "assets") return d.assets;
  if (section === "liabilities") return d.liabilities;
  if (section === "income") return d.income;
  return d.expenses;
}

function DragHandle({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-0.5 cursor-grab active:cursor-grabbing ${className}`}>
      <div className="flex gap-0.5"><span className="w-0.5 h-0.5 rounded-full bg-current" /><span className="w-0.5 h-0.5 rounded-full bg-current" /><span className="w-0.5 h-0.5 rounded-full bg-current" /></div>
      <div className="flex gap-0.5"><span className="w-0.5 h-0.5 rounded-full bg-current" /><span className="w-0.5 h-0.5 rounded-full bg-current" /><span className="w-0.5 h-0.5 rounded-full bg-current" /></div>
    </div>
  );
}

function renderPreviewTable(
  leftGroups: Group[], rightGroups: Group[],
  col1Label: string, col2Label: string,
  col1Color: string, col2Color: string,
  totalLabel: string, totalVal: number,
  col1Sum: number, col2Sum: number,
  size: "normal" | "small",
) {
  const s = TABLE_SIZE[size];
  const cellCls = s.cell;
  const labelCls = s.label;

  function renderGroupRows(g: Group, primaryCol: "left" | "right") {
    return g.entries.map((entry, ei) => (
      <tr key={entry.id} className="border-b border-[#f0f0f2]">
        {ei === 0 && (
          <td className={`${cellCls} align-top`} rowSpan={g.entries.length}>
            <span className={`${labelCls} text-[#1d1d1f]`}>{g.label}</span>
            <span className={`ml-2 ${s.icon} text-[#b0b0b5]`}>{g.entries.length}</span>
          </td>
        )}
        <td className={cellCls}>
          <span className="text-[#1d1d1f]">{entry.name}</span>
          {entry.code && <span className="ml-2 text-[12px] text-[#b0b0b5] font-mono">{entry.code}</span>}
        </td>
        <td className={`${cellCls} text-right tabular-nums ${primaryCol === "left" ? "text-[#1d1d1f]" : "text-[#b0b0b5]"}`}>
          {primaryCol === "left" ? fmt(entry.amount) : "-"}
        </td>
        <td className={`${cellCls} text-right tabular-nums ${primaryCol === "right" ? "text-[#1d1d1f]" : "text-[#b0b0b5]"}`}>
          {primaryCol === "right" ? fmt(entry.amount) : "-"}
        </td>
      </tr>
    ));
  }

  function renderEmptyGroupRow(g: Group, primaryCol: "left" | "right") {
    return (
      <tr key={g.id} className="border-b border-[#f0f0f2]">
        <td className={`${cellCls} text-[#86868b]`}>{g.label}</td>
        <td className={cellCls} />
        {primaryCol === "left" ? (
          <>
            <td className={`${cellCls} text-right tabular-nums text-[#d2d2d7]`}>暂无</td>
            <td className={cellCls} />
          </>
        ) : (
          <>
            <td className={`${cellCls} text-right tabular-nums text-[#b0b0b5]`}>-</td>
            <td className={`${cellCls} text-right tabular-nums text-[#d2d2d7]`}>暂无</td>
          </>
        )}
      </tr>
    );
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-[#e8e8ed]">
          <th className={`${s.header} pr-6 text-left font-semibold text-[#1d1d1f]`}>分类</th>
          <th className={`${s.header} pr-6 text-left font-semibold text-[#1d1d1f]`}>项目</th>
          <th className={`${s.header} pr-6 text-right font-semibold ${col1Color}`}>{col1Label}</th>
          <th className={`${s.header} pr-6 text-right font-semibold ${col2Color}`}>{col2Label}</th>
        </tr>
      </thead>
      <tbody>
        {leftGroups.map((g) => g.entries.length === 0 ? renderEmptyGroupRow(g, "left") : renderGroupRows(g, "left"))}
        {rightGroups.map((g) => g.entries.length === 0 ? renderEmptyGroupRow(g, "right") : renderGroupRows(g, "right"))}
        <tr className="border-t-2 border-[#1d1d1f]">
          <td colSpan={2} className={`${s.sum} pr-6 text-right font-semibold text-[#1d1d1f]`}>合计</td>
          <td className={`${s.sum} pr-6 text-right font-semibold tabular-nums ${col1Color}`}>{fmt(col1Sum)}</td>
          <td className={`${s.sum} pr-6 text-right font-semibold tabular-nums ${col2Color}`}>{fmt(col2Sum)}</td>
        </tr>
        <tr className="bg-[#f8f8fa]">
          <td colSpan={2} className={`${s.sum} pr-6 text-right font-semibold text-[#1d1d1f]`}>{totalLabel}</td>
          <td colSpan={2} className={`${s.sum} pr-6 text-right font-semibold tabular-nums ${totalVal >= 0 ? "text-[#1d1d1f]" : "text-red-500"}`}>
            {fmt(totalVal)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default function BalanceSheetPage() {
  const router = useRouter();
  const [store, setStore] = useState<SheetStore>({});
  const [ready, setReady] = useState(false);
  const [activeMonth, setActiveMonth] = useState(currentMonth());
  const [editing, setEditing] = useState(false);
  const [editEntry, setEditEntry] = useState<{ section: Section; groupIdx: number; entryIdx: number } | null>(null);
  const [editForm, setEditForm] = useState({ name: "", amount: "", code: "", quantity: "" });
  const [addingTo, setAddingTo] = useState<{ section: Section; groupIdx: number } | null>(null);
  const [renamingGroup, setRenamingGroup] = useState<{ section: Section; groupIdx: number } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showAddGroup, setShowAddGroup] = useState<Section | null>(null);
  const [addGroupForm, setAddGroupForm] = useState({ label: "", type: "cash" });
  const [dragItem, setDragItem] = useState<{ type: "group" | "entry"; section: Section; groupIdx: number; entryIdx?: number } | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<number | null>(null);
  const [dragOverEntry, setDragOverEntry] = useState<number | null>(null);
  const [floatEdit, setFloatEdit] = useState<{ section: "income" | "expenses"; groupIdx: number; entryIdx: number } | null>(null);
  const [floatForm, setFloatForm] = useState({ name: "", amount: "" });
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ msg: string; onConfirm: () => void } | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMom, setShowMom] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const syncedIdsRef = useRef<Set<string>>(new Set());
  const pendingDeletionsRef = useRef<{ section: Section; categoryId: string; id: string; type: "group" | "entry" }[]>([]);
  useEffect(() => {
    const saved = loadStore();
    const month = currentMonth();
    if (!saved[month]) {
      saved[month] = defaultSheet();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* ignore */ }
    }
    loadFromAPI().then((apiData) => {
      if (apiData) {
        saved[month] = apiData;
        saveStore(saved);
        const ids = new Set<string>();
        for (const g of apiData.assets) { ids.add(g.id); for (const e of g.entries) ids.add(e.id); }
        for (const g of apiData.liabilities) { ids.add(g.id); for (const e of g.entries) ids.add(e.id); }
        syncedIdsRef.current = ids;
      }
      setStore(saved);
      setReady(true);
    });
  }, []);
  useEffect(() => {
    saveStore(store);
  }, [store]);

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);
  useEffect(() => {
    if (!isLoggedIn() || !ready) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      try {
        const d = store[activeMonth];
        if (!d) return;

        const deletions = pendingDeletionsRef.current.splice(0);
        for (const del of deletions) {
          if (syncedIdsRef.current.has(del.id)) {
            if (del.type === "group") {
              await syncGroupToAPI(del.section, { id: del.id, label: "", type: "", entries: [], sort_order: 0 }, "delete");
            } else {
              await syncEntryToAPI(del.section, del.categoryId, { id: del.id, name: "", amount: 0 }, "delete");
            }
            syncedIdsRef.current.delete(del.id);
          }
        }

        for (const section of ["assets", "liabilities"] as Section[]) {
          const groups = getGroups(d, section);
          for (const g of groups) {
            if (!syncedIdsRef.current.has(g.id)) {
              const newId = await syncGroupToAPI(section, g, "create");
              if (newId && newId !== g.id) {
                syncedIdsRef.current.add(newId);
                setStore(prev => {
                  const data = prev[activeMonth];
                  if (!data) return prev;
                  if (section === "assets") {
                    const grp = data.assets.find(gr => gr.id === g.id);
                    if (grp) grp.id = newId;
                  } else {
                    const grp = data.liabilities.find(gr => gr.id === g.id);
                    if (grp) grp.id = newId;
                  }
                  return { ...prev };
                });
              }
            } else {
              await syncGroupToAPI(section, g, "update");
            }

            for (const e of g.entries) {
              if (!syncedIdsRef.current.has(e.id)) {
                const newId = await syncEntryToAPI(section, g.id, e, "create");
                if (newId && newId !== e.id) {
                  syncedIdsRef.current.add(newId);
                  setStore(prev => {
                    const data = prev[activeMonth];
                    if (!data) return prev;
                    const groups = section === "assets" ? data.assets : data.liabilities;
                    const grp = groups.find(gr => gr.id === g.id);
                    if (grp) {
                      const entry = grp.entries.find(en => en.id === e.id);
                      if (entry) entry.id = newId;
                    }
                    return { ...prev };
                  });
                }
              } else {
                await syncEntryToAPI(section, g.id, e, "update");
              }
            }
          }
        }
      } finally {
        isSyncingRef.current = false;
      }
    }, 5000);
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [store, activeMonth, ready]);


  useEffect(() => {
    if (showMonthPicker) {
      setCalendarYear(parseInt(activeMonth.slice(0, 4)));
    }
  }, [showMonthPicker]);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target as Node)) {
        setShowMonthPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleNavChange(key: string) {
    if (key === "home") router.push("/home");
  }

  function ensureMonth(m: string): SheetData {
    if (!store[m]) {
      setStore((prev) => ({ ...prev, [m]: defaultSheet() }));
    }
    return { ...defaultSheet(), ...store[m] };
  }

  function goPrevMonth() {
    const prev = prevMonth(activeMonth);
    ensureMonth(prev);
    setActiveMonth(prev);
  }

  function goNextMonth() {
    const next = nextMonth(activeMonth);
    ensureMonth(next);
    setActiveMonth(next);
  }

  function updateData(mutator: (d: SheetData) => SheetData) {
    setStore((prev) => {
      const d = structuredClone(prev[activeMonth] ? { ...defaultSheet(), ...prev[activeMonth] } : defaultSheet());
      prev[activeMonth] = mutator(d);
      return { ...prev };
    });
  }

  const sheet = { ...defaultSheet(), ...store[activeMonth] };
  const totalAssets = sheet.assets.reduce((s, g) => s + totalGroup(g), 0);
  const totalLiabilities = sheet.liabilities.reduce((s, g) => s + totalGroup(g), 0);
  const totalIncome = sheet.income.reduce((s, g) => s + totalGroup(g), 0);
  const totalExpenses = sheet.expenses.reduce((s, g) => s + totalGroup(g), 0);
  const netWorth = totalAssets - totalLiabilities;
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  const months = Object.keys(store).sort().reverse();

  function openEdit(section: Section, groupIdx: number, entryIdx: number, entry: Entry) {
    setEditEntry({ section, groupIdx, entryIdx });
    setEditForm({
      name: entry.name,
      amount: String(entry.amount),
      code: entry.code || "",
      quantity: entry.quantity !== undefined ? String(entry.quantity) : "",
    });
    setAddingTo(null);
    setRenamingGroup(null);
  }

  function openAdd(section: Section, groupIdx: number) {
    setAddingTo({ section, groupIdx });
    setEditForm({ name: "", amount: "", code: "", quantity: "" });
    setEditEntry(null);
    setRenamingGroup(null);
  }

  function applyEdit(section: Section, mutator: (g: Group[]) => void) {
    updateData((d) => {
      const groups = getGroups(d, section);
      mutator(groups);
      return d;
    });
  }

  function saveEdit() {
    if (editEntry) {
      const { section, groupIdx, entryIdx } = editEntry;
      applyEdit(section, (groups) => {
        const entry = groups[groupIdx]?.entries[entryIdx];
        if (entry) {
          entry.name = editForm.name || entry.name;
          entry.amount = parseFloat(editForm.amount) || 0;
          entry.code = editForm.code || undefined;
          entry.quantity = editForm.quantity ? parseFloat(editForm.quantity) : undefined;
        }
      });
      setEditEntry(null);
    } else if (addingTo) {
      const { section, groupIdx } = addingTo;
      applyEdit(section, (groups) => {
        const g = groups[groupIdx];
        if (g) {
          g.entries.push({
            id: genId(),
            name: editForm.name || "新条目",
            amount: parseFloat(editForm.amount) || 0,
            code: editForm.code || undefined,
            quantity: editForm.quantity ? parseFloat(editForm.quantity) : undefined,
          });
        }
      });
      setAddingTo(null);
    }
  }

  function deleteEntry(section: Section, groupIdx: number, entryIdx: number) {
    const groups = getGroups(sheet, section);
    const g = groups[groupIdx];
    const entry = g?.entries[entryIdx];
    if (entry) {
      pendingDeletionsRef.current.push({ section, categoryId: g.id, id: entry.id, type: "entry" });
    }
    applyEdit(section, (groups) => {
      groups[groupIdx].entries.splice(entryIdx, 1);
    });
    setEditEntry(null);
    setAddingTo(null);
  }

  function cancelEdit() {
    setEditEntry(null);
    setAddingTo(null);
    setRenamingGroup(null);
  }

  function startRename(section: Section, groupIdx: number, label: string) {
    setRenamingGroup({ section, groupIdx });
    setRenameValue(label);
    setEditEntry(null);
    setAddingTo(null);
  }

  function saveRename() {
    if (renamingGroup && renameValue.trim()) {
      const { section, groupIdx } = renamingGroup;
      applyEdit(section, (groups) => {
        groups[groupIdx].label = renameValue.trim();
      });
    }
    setRenamingGroup(null);
  }

  function confirmDeleteGroup(section: Section, groupIdx: number, label: string) {
    const groups = getGroups(sheet, section);
    const group = groups[groupIdx];
    setConfirmAction({
      msg: `确定删除分组「${label}」？所有条目将被移除。`,
      onConfirm: () => {
        if (group) {
          for (const entry of group.entries) {
            pendingDeletionsRef.current.push({ section, categoryId: group.id, id: entry.id, type: "entry" });
          }
          pendingDeletionsRef.current.push({ section, categoryId: "", id: group.id, type: "group" });
        }
        applyEdit(section, (groups) => { groups.splice(groupIdx, 1); });
        setConfirmAction(null);
      },
    });
  }

  function addGroup() {
    const label = addGroupForm.label.trim();
    if (!label || !showAddGroup) return;
    const groups = getGroups(sheet, showAddGroup);
    if (groups.some((g) => g.label === label)) {
      setAlertMsg(`分组「${label}」已存在，请使用其他名称。`);
      return;
    }
    applyEdit(showAddGroup, (groups) => {
      groups.unshift({ id: genId(), label, type: addGroupForm.type, entries: [] });
    });
    setShowAddGroup(null);
    setAddGroupForm({ label: "", type: "cash" });
  }

  function handleDragStart(type: "group" | "entry", section: Section, groupIdx: number, entryIdx?: number) {
    return (e: React.DragEvent) => {
      setDragItem({ type, section, groupIdx, entryIdx });
      e.dataTransfer.effectAllowed = "move";
      (e.currentTarget as HTMLElement).classList.add("opacity-40");
    };
  }

  function clearDragOver() {
    setDragOverGroup(null);
    setDragOverEntry(null);
  }

  function handleDragEnd(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).classList.remove("opacity-40");
    setDragItem(null);
    clearDragOver();
  }

  function handleGroupDrop(section: Section, targetIdx: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragItem || dragItem.type !== "group" || dragItem.section !== section) return;
      const from = dragItem.groupIdx;
      if (from === targetIdx) return;
      applyEdit(section, (groups) => {
        const [moved] = groups.splice(from, 1);
        groups.splice(targetIdx, 0, moved);
      });
      setDragItem(null);
      clearDragOver();
    };
  }

  function handleEntryDrop(section: Section, groupIdx: number, targetIdx: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragItem || dragItem.type !== "entry" || dragItem.section !== section || dragItem.groupIdx !== groupIdx) return;
      const from = dragItem.entryIdx!;
      if (from === targetIdx) return;
      applyEdit(section, (groups) => {
        const entries = groups[groupIdx].entries;
        const [moved] = entries.splice(from, 1);
        entries.splice(targetIdx, 0, moved);
      });
      setDragItem(null);
      clearDragOver();
    };
  }

  function handleEntryDragOver(section: Section, groupIdx: number, targetIdx: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragItem && dragItem.type === "entry" && dragItem.section === section && dragItem.groupIdx === groupIdx && dragItem.entryIdx !== targetIdx) {
        setDragOverEntry(targetIdx);
      }
    };
  }

  function handleGroupDragOver(section: Section, targetIdx: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragItem && dragItem.type === "group" && dragItem.section === section && dragItem.groupIdx !== targetIdx) {
        setDragOverGroup(targetIdx);
      }
    };
  }

  function EditFormFields({ groupType }: { groupType: string }) {
    const isStockFund = groupType === "stock" || groupType === "fund";
    return (
      <div className="space-y-2.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {editing && <DragHandle className="text-[#d2d2d7]" />}
          <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="名称"
            className={`flex-1 ${INPUT_CLS}`}
            {...(editing && addingTo ? { autoFocus: true } : {})} />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#86868b]">¥</span>
            <input value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              placeholder="金额" type="number"
              className={`w-[120px] pl-7 pr-3 ${INPUT_CLS}`} />
          </div>
        </div>
        {isStockFund && (
          <div className="flex items-center gap-2">
            {editing && <DragHandle className="text-transparent" />}
            <input value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
              placeholder={groupType === "stock" ? "股票代码" : "基金代码"}
              className={`flex-1 ${INPUT_CLS}`} />
            <input value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
              placeholder={groupType === "stock" ? "持仓数量" : "持有份额"} type="number"
              className={`w-[120px] ${INPUT_CLS}`} />
          </div>
        )}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button onClick={cancelEdit}
            className="rounded-lg px-3 py-1.5 text-[12px] text-[#86868b] transition-colors hover:bg-[#f5f5f7] cursor-pointer">取消</button>
          {editing && editEntry && (
            <button onClick={(e) => { e.stopPropagation(); deleteEntry(editEntry.section, editEntry.groupIdx, editEntry.entryIdx); }}
              className="rounded-lg px-3 py-1.5 text-[12px] text-red-500 transition-colors hover:bg-red-50 cursor-pointer">删除</button>
          )}
          <button onClick={(e) => { e.stopPropagation(); saveEdit(); }}
            className="rounded-lg bg-[#0071e3] px-4 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#0077ed] cursor-pointer">
            {addingTo ? "添加" : "保存"}
          </button>
        </div>
      </div>
    );
  }

  function renderEntryActions(opts: { section: Section; groupIdx: number; entryIdx: number; entry: Entry; g: Group }) {
    const { section, groupIdx, entryIdx, entry, g } = opts;
    const editingThis = editEntry?.section === section && editEntry?.groupIdx === groupIdx && editEntry?.entryIdx === entryIdx;
    return (
      <div key={entry.id} draggable={editing}
        onDragStart={handleDragStart("entry", section, groupIdx, entryIdx)}
        onDragEnd={handleDragEnd}
        onDragOver={handleEntryDragOver(section, groupIdx, entryIdx)}
        onDragLeave={() => setDragOverEntry(null)}
        onDrop={handleEntryDrop(section, groupIdx, entryIdx)}
        className={`group relative px-5 py-3 transition-all duration-200 ${editing ? "cursor-default hover:bg-[#fafafa]" : ""} ${dragOverEntry === entryIdx && dragItem?.type === "entry" ? "ring-2 ring-[#0071e3]/40 bg-[#0071e3]/5 shadow-sm" : ""}`}
        onClick={() => editing && !editingThis && openEdit(section, groupIdx, entryIdx, entry)}
      >
        {editingThis ? (
          <EditFormFields groupType={g.type} />
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {editing && <DragHandle className="text-[#d2d2d7] shrink-0" />}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-[#1d1d1f] truncate">{entry.name}</span>
                  {entry.code && <span className="text-[11px] text-[#d2d2d7] font-mono">{entry.code}</span>}
                </div>
                {(entry.quantity !== undefined || entry.code) && (
                  <p className="text-[11px] text-[#86868b] mt-0.5">
                    {entry.quantity !== undefined ? `${entry.quantity.toLocaleString()} ${g.type === "stock" ? "股" : "份"}` : ""}
                  </p>
                )}
              </div>
            </div>
            <span className={`text-[14px] tabular-nums font-medium text-[#1d1d1f] ml-4 ${editing ? "pr-10" : ""}`}>{fmt(entry.amount)}</span>
          </div>
        )}
        {!editingThis && !addingTo && editing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[11px] text-[#0071e3]">编辑</span>
          </div>
        )}
      </div>
    );
  }

  function renderGroup(section: Section, groupIdx: number, g: Group) {
    const isAdding = addingTo?.section === section && addingTo?.groupIdx === groupIdx;
    const isRenaming = renamingGroup?.section === section && renamingGroup?.groupIdx === groupIdx;
    const total = totalGroup(g);
    const colorClass = GROUP_COLORS[g.type] || "text-slate-600 bg-slate-50 border-slate-200/50";
    const icon = GROUP_ICONS[g.type] || GROUP_ICONS.other;

    return (
      <div key={g.id} draggable={editing} onDragStart={handleDragStart("group", section, groupIdx)} onDragEnd={handleDragEnd}
        onDragOver={handleGroupDragOver(section, groupIdx)}
        onDragLeave={() => setDragOverGroup(null)}
        onDrop={handleGroupDrop(section, groupIdx)}
        className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all duration-200 ${editing ? "cursor-default" : ""} ${dragOverGroup === groupIdx ? "ring-2 ring-[#0071e3]/40 shadow-md" : "border-[#e8e8ed] hover:shadow-md"}`}>
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${editing ? "bg-[#fafafa]" : "bg-white"}`}>
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {editing && <DragHandle className="text-[#d2d2d7] shrink-0" />}
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] border ${colorClass}`}>
              {icon}
            </span>
            {isRenaming ? (
              <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                onBlur={saveRename} onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") setRenamingGroup(null); }}
                className="rounded-lg border border-[#0071e3] px-2 py-1 text-[14px] font-semibold outline-none focus:ring-[3px] focus:ring-[#0071e3]/20 bg-white min-w-0"
                autoFocus onClick={(e) => e.stopPropagation()} />
            ) : (
              <span className="text-[14px] font-semibold text-[#1d1d1f] truncate">{g.label}</span>
            )}
            <span className="text-[11px] text-[#86868b] shrink-0">{g.entries.length} 项</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[15px] font-semibold tabular-nums text-[#1d1d1f]">{fmt(total)}</span>
            {editing && (
              <div className="flex items-center gap-1 ml-1">
                <button onClick={() => startRename(section, groupIdx, g.label)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#86868b] transition-all duration-200 hover:bg-[#f0f0f0] hover:text-[#0071e3] cursor-pointer" title="重命名分组">
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.5"><path d="M11 2l3 3-8 8H3v-3l8-8z" /></svg>
                </button>
                <button onClick={() => confirmDeleteGroup(section, groupIdx, g.label)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#86868b] transition-all duration-200 hover:bg-red-50 hover:text-red-500 cursor-pointer" title="删除分组">
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M5 4V2.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V4M13 4v9.5a1 1 0 01-1 1H4a1 1 0 01-1-1V4" /></svg>
                </button>
                <button onClick={() => openAdd(section, groupIdx)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3] transition-all duration-200 hover:bg-[#0071e3]/20 cursor-pointer" title="添加条目">
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2"><path d="M8 3v10M3 8h10" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="divide-y divide-[#f5f5f7]">
          {g.entries.length === 0 && !isAdding && (
            <div className="px-5 py-6 text-center text-[13px] text-[#d2d2d7]">暂无条目</div>
          )}
          {g.entries.map((entry, entryIdx) => renderEntryActions({ section, groupIdx, entryIdx, entry, g }))}
          {isAdding && (
            <div className="px-5 py-3 bg-[#fafafa]">
              <EditFormFields groupType={g.type} />
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderSection(section: Section) {
    const groups = getGroups(sheet, section);
    const meta = SECTION_META[section];
    const total = section === "assets" ? totalAssets : totalLiabilities;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] ${meta.iconColor}`}>
              {meta.icon}
            </span>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f]">{meta.label}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[15px] font-semibold tabular-nums ${meta.totalColor}`}>
              {fmt(total)}
            </span>
            {editing && (
              <button onClick={() => setShowAddGroup(section)}
                className="flex items-center gap-1 rounded-lg border border-dashed border-[#d2d2d7] px-2.5 py-1.5 text-[11px] text-[#86868b] transition-all duration-200 hover:border-[#0071e3] hover:text-[#0071e3] hover:bg-[#f5f5f7] cursor-pointer">
                <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2"><path d="M7 2v10M2 7h10" /></svg>
                分组
              </button>
            )}
          </div>
        </div>
        {groups.map((g, i) => renderGroup(section, i, g))}
      </div>
    );
  }

  function editFloatEntry(section: "income" | "expenses", groupIdx: number, entryIdx: number, entry: Entry) {
    setFloatEdit({ section, groupIdx, entryIdx });
    setFloatForm({ name: entry.name, amount: String(entry.amount) });
  }

  function saveFloatEdit() {
    if (!floatEdit) return;
    const { section, groupIdx, entryIdx } = floatEdit;
    applyEdit(section, (groups) => {
      const entry = groups[groupIdx]?.entries[entryIdx];
      if (entry) {
        entry.name = floatForm.name || entry.name;
        entry.amount = parseFloat(floatForm.amount) || 0;
      }
    });
    setFloatEdit(null);
  }

  function deleteFloatEntry(section: "income" | "expenses", groupIdx: number, entryIdx: number) {
    applyEdit(section, (groups) => {
      groups[groupIdx].entries.splice(entryIdx, 1);
    });
    setFloatEdit(null);
  }

  function addFloatEntry(section: "income" | "expenses", groupIdx: number) {
    applyEdit(section, (groups) => {
      if (!groups[groupIdx]) {
        groups.push({ id: genId(), label: section === "income" ? "其他收入" : "其他开支", type: section === "income" ? "income" : "expense", entries: [] });
        groupIdx = groups.length - 1;
      }
      groups[groupIdx].entries.push({
        id: genId(), name: "新条目", amount: 0,
      });
    });
  }

  function renderFloatEntry(entry: Entry, groupIdx: number, entryIdx: number, section: "income" | "expenses") {
    const editingThis = floatEdit?.section === section && floatEdit?.groupIdx === groupIdx && floatEdit?.entryIdx === entryIdx;
    return (
      <div key={entry.id}
        onClick={() => !editingThis && editFloatEntry(section, groupIdx, entryIdx, entry)}
        className="group flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-[#f5f5f7] transition-colors cursor-pointer">
        {editingThis ? (
          <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
            <input value={floatForm.name} onChange={(e) => setFloatForm({ ...floatForm, name: e.target.value })}
              placeholder="名称" autoFocus
              className={`flex-1 min-w-0 ${INPUT_SM_CLS}`} />
            <input value={floatForm.amount} onChange={(e) => setFloatForm({ ...floatForm, amount: e.target.value })}
              placeholder="金额" type="number"
              className={`w-[72px] text-right ${INPUT_SM_CLS}`} />
            <button onClick={() => { saveFloatEdit(); }}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0071e3] text-white hover:bg-[#0077ed] cursor-pointer shrink-0">
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="1.5"><path d="M2 6l3 3 5-5" /></svg>
            </button>
            <button onClick={() => { deleteFloatEntry(section, groupIdx, entryIdx); }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#b0b0b5] hover:text-red-500 hover:bg-red-50 cursor-pointer shrink-0">
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h8M5 3V2a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1M9.5 3v7a.5.5 0 01-.5.5H3a.5.5 0 01-.5-.5V3" /></svg>
            </button>
          </div>
        ) : (
          <>
            <span className="text-[12px] text-[#1d1d1f] truncate flex-1 min-w-0">{entry.name}</span>
            <span className="text-[12px] tabular-nums font-medium ml-3 shrink-0">{fmt(entry.amount)}</span>
          </>
        )}
      </div>
    );
  }

  const FLOAT_COLORS = {
    income: { bg: "bg-green-100", text: "text-green-600", textDark: "text-green-700", hoverText: "hover:text-green-600", hoverBg: "hover:bg-green-50", iconPath: "M5 2v6M3 5l2-2 2 2" },
    expenses: { bg: "bg-orange-100", text: "text-orange-600", textDark: "text-orange-700", hoverText: "hover:text-orange-600", hoverBg: "hover:bg-orange-50", iconPath: "M5 2v6M3 8l2-2 2 2" },
  } as const;

  function renderFloatSection(type: "income" | "expenses") {
    const isIncome = type === "income";
    const c = FLOAT_COLORS[type];
    const label = isIncome ? "收入" : "开支";
    const total = isIncome ? totalIncome : totalExpenses;
    const items = isIncome ? sheet.income : sheet.expenses;

    return (
      <div className={`px-3 ${isIncome ? "pt-3 pb-1.5" : "pt-1.5 pb-3"}`}>
        <div className="flex items-center gap-1.5 mb-1.5 px-1">
          <div className={`flex h-4 w-4 items-center justify-center rounded ${c.bg}`}>
            <svg viewBox="0 0 10 10" fill="none" className={`h-2.5 w-2.5 ${c.text}`} stroke="currentColor" strokeWidth="2">
              <path d={c.iconPath} />
            </svg>
          </div>
          <span className={`text-[10px] font-semibold ${c.textDark}`}>{label}</span>
          <button onClick={() => addFloatEntry(type, 0)}
            className={`flex h-4 w-4 items-center justify-center rounded text-[#c7c7cc] ${c.hoverText} ${c.hoverBg} transition-colors cursor-pointer`}>
            <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5" stroke="currentColor" strokeWidth="1.5"><path d="M5 2v6M2 5h6" /></svg>
          </button>
          <span className={`ml-auto text-[11px] font-semibold tabular-nums ${c.text}`}>{fmt(total)}</span>
        </div>
        {items.length > 0 && items.map((g, gi) => g.entries.map((e, ei) => renderFloatEntry(e, gi, ei, type)))}
        {items.length === 0 && (
          <div className="text-[11px] text-[#b0b0b5] text-center py-4">暂无数据，点击 + 添加</div>
        )}
      </div>
    );
  }

  function initDragPanel(e: React.MouseEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: panelPos.x, origY: panelPos.y };
    const el = panelRef.current;
    if (!el) return;
    const pw = el.offsetWidth, ph = el.offsetHeight;
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const x = dragRef.current.origX + (ev.clientX - dragRef.current.startX);
      const y = dragRef.current.origY + (ev.clientY - dragRef.current.startY);
      const minX = pw + 16 - window.innerWidth;
      const maxX = 16;
      const minY = ph + 24 - window.innerHeight;
      const maxY = 24;
      setPanelPos({ x: Math.max(minX, Math.min(maxX, x)), y: Math.max(minY, Math.min(maxY, y)) });
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] overflow-hidden">

      <Sidebar items={navItems} activeNav="assets-and-liabilities" onNavChange={handleNavChange} />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0071e3]/[0.02] to-[#0071e3]/[0.04] pointer-events-none" />

        <DashboardHeader activeNav="assets-and-liabilities" navItems={navItems} />

        {!ready ? (
          <main className="relative flex-1 overflow-y-auto z-10 mx-auto w-full max-w-[1080px] px-6 pt-6 pb-20">
            <div className="flex items-center justify-center h-64 text-[14px] text-[#86868b]">加载中...</div>
          </main>
        ) : (

        <main className="relative flex-1 overflow-y-auto z-10 mx-auto w-full max-w-[1080px] px-6 pt-6 pb-20">

          {/* ── Header ── */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">资产与负债</h1>
                <span className="rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#0071e3]">
                  {sheet.assets.length + sheet.liabilities.length + sheet.income.length + sheet.expenses.length} 组 · {sheet.assets.reduce((s, g) => s + g.entries.length, 0) + sheet.liabilities.reduce((s, g) => s + g.entries.length, 0) + sheet.income.reduce((s, g) => s + g.entries.length, 0) + sheet.expenses.reduce((s, g) => s + g.entries.length, 0)} 项
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-[#6e6e73]">
                数据自动保存至本地 {editing && <span className="text-[#ff9f0a]">· 编辑模式（拖拽排序）</span>}
              </p>
            </div>
            <button onClick={() => { setEditing(!editing); cancelEdit(); setShowAddGroup(null); }}
              className={`rounded-full px-5 py-2.5 text-[13px] font-medium transition-all duration-200 cursor-pointer shrink-0 ${
                editing
                  ? "bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-sm"
                  : "border border-[#d2d2d7] text-[#6e6e73] hover:bg-[#f5f5f7]"
              }`}>
              {editing ? "完成编辑" : "编辑"}
            </button>
          </div>

          {/* ── Month Picker + Net Worth ── */}
          <div className="relative mb-6 rounded-3xl border border-[#e8e8ed]/80 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 via-white to-[#34c759]/5" />
            </div>
            <div className="relative">

              {/* Month Selector */}
              <div className="relative flex items-center justify-center pt-5 pb-3" ref={monthPickerRef}>
                <button onClick={goPrevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#86868b] transition-all duration-200 hover:bg-[#f5f5f7] hover:text-[#1d1d1f] cursor-pointer">
                  {I.ChevronL}
                </button>
                <button onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="relative mx-3 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[14px] font-semibold text-[#1d1d1f] transition-all duration-200 hover:bg-[#f5f5f7] cursor-pointer">
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h14a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM3 8h14M7 2v3m6-3v3" /></svg>
                  {monthLabel(activeMonth)}
                </button>
                <button onClick={goNextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#86868b] transition-all duration-200 hover:bg-[#f5f5f7] hover:text-[#1d1d1f] cursor-pointer">
                  <span className="rotate-180">{I.ChevronL}</span>
                </button>

                {showMonthPicker && (
                  <div className="absolute top-full mt-1 z-50 w-64 rounded-2xl border border-[#d2d2d7]/80 bg-white/95 p-4 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => setCalendarYear(y => y - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] cursor-pointer transition-all duration-200">
                        {I.ChevronL}
                      </button>
                      <span className="text-[14px] font-semibold text-[#1d1d1f]">{calendarYear} 年</span>
                      <button onClick={() => setCalendarYear(y => y + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] cursor-pointer transition-all duration-200">
                        <span className="rotate-180">{I.ChevronL}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = `${calendarYear}-${String(i + 1).padStart(2, "0")}`;
                        const isActive = m === activeMonth;
                        return (
                          <button key={m} onClick={() => { setActiveMonth(m); setShowMonthPicker(false); }}
                            className={`rounded-lg px-2 py-2.5 text-[13px] text-center transition-all duration-200 cursor-pointer ${
                              isActive
                                ? "bg-[#0071e3] text-white font-medium shadow-sm"
                                : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                            }`}>
                            {i + 1} 月
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Net Worth */}
              <div className="px-6 pb-6 text-center">
                <p className="text-[12px] font-medium text-[#86868b] tracking-wide">净资产</p>
                <p className={`mt-1 text-[40px] font-semibold tracking-[-0.03em] leading-none ${netWorth >= 0 ? "text-[#1d1d1f]" : "text-red-500"}`}>
                  {fmt(netWorth)}
                </p>
                <div className="mt-5 flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-[11px] font-medium text-[#86868b]">总资产</p>
                    <p className="mt-0.5 text-[17px] font-semibold tabular-nums text-[#34c759]">{fmt(totalAssets)}</p>
                  </div>
                  <div className="w-px h-9 bg-[#e8e8ed]" />
                  <div className="text-center">
                    <p className="text-[11px] font-medium text-[#86868b]">总负债</p>
                    <p className="mt-0.5 text-[17px] font-semibold tabular-nums text-red-500">{fmt(totalLiabilities)}</p>
                  </div>
                  <div className="w-px h-9 bg-[#e8e8ed]" />
                  <div className="text-center">
                    <p className="text-[11px] font-medium text-[#86868b]">负债率</p>
                    <p className="mt-0.5 text-[17px] font-semibold tabular-nums text-[#0071e3]">{debtRatio.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Two Columns ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {renderSection("assets")}
            {renderSection("liabilities")}
          </div>

        </main>
        )}
      </div>

      {/* ── Floating Toolbar ── */}
      <div className="fixed right-0 top-1/3 -translate-y-1/2 z-40 flex flex-col items-center gap-2 rounded-l-xl border border-r-0 border-[#e8e8ed]/40 bg-white/80 py-2.5 px-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
        <button onClick={() => setShowPreview(true)}
          className="flex flex-row items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-[#6e6e73] transition-all duration-200 hover:bg-[#0071e3] hover:text-white hover:shadow-sm cursor-pointer bg-[#0071e3]/5"
          title="生成预览表格">
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3h14v14H3z" />
            <path d="M3 7h14M7 3v14" />
          </svg>
          <span className="tracking-wider">表格</span>
        </button>
        <button onClick={() => setShowMom(true)}
          className="flex flex-row items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-[#6e6e73] transition-all duration-200 hover:bg-[#0071e3] hover:text-white hover:shadow-sm cursor-pointer bg-[#0071e3]/5"
          title="生成环比对比">
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h16v12H2z" /><path d="M6 2v4m8-4v4M2 10h16" /><path d="M6 14l3-3 3 2 4-4" /></svg>
          <span className="tracking-wider">环比</span>
        </button>
      </div>

      {/* ── Floating Income & Expenses ── */}
      <div ref={panelRef} className="fixed z-40 w-[280px] rounded-xl border border-[#e8e8ed]/60 bg-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl overflow-hidden"
        style={{ right: 16, bottom: 24, transform: `translate(${panelPos.x}px, ${panelPos.y}px)` }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f2] cursor-grab active:cursor-grabbing select-none bg-gradient-to-r from-white to-[#fafbfc]"
          onMouseDown={initDragPanel}>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071e3]/10 to-[#0071e3]/5">
              <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3 text-[#0071e3]" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h10v8H2z" /><path d="M4 2v2m6-2v2M2 7h10" /></svg>
            </div>
            <span className="text-[13px] font-semibold text-[#1d1d1f]">收支流水</span>
          </div>
          <span className="text-[10px] text-[#b0b0b5] font-medium">{monthLabel(activeMonth)}</span>
        </div>
        <div className="max-h-[360px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d2d2d7] [&::-webkit-scrollbar-thumb]:hover:bg-[#b0b0b5] [&::-webkit-scrollbar-track]:bg-white">
          {renderFloatSection("income")}
          <div className="mx-4 border-t border-[#f0f0f2]" />
          {renderFloatSection("expenses")}
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#f0f0f2] bg-gradient-to-r from-[#fafbfc] to-white">
          <span className="text-[11px] font-medium text-[#86868b]">月度结余</span>
          <div className="flex items-center gap-3">
            <span className={`text-[12px] font-semibold tabular-nums ${totalIncome - totalExpenses >= 0 ? "text-green-600" : "text-red-500"}`}>
              {fmt(totalIncome - totalExpenses)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Preview Table Modal ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 px-4 py-8 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}>
          <div className="flex max-h-[85vh] w-full max-w-[1000px] flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/[0.04]"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between shrink-0 px-8 pt-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12v10H2z" /><path d="M5 2v2m6-2v2M2 8h12" /></svg>
                </div>
                <h2 className="text-[18px] font-semibold text-[#1d1d1f]">资产负债表</h2>
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[11px] font-medium text-[#86868b]">{monthLabel(activeMonth)}</span>
              </div>
              <button onClick={() => setShowPreview(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#86868b] transition-colors hover:bg-[#f0f0f0] cursor-pointer">
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </div>

            <div className="[overflow-y:overlay] overflow-x-hidden px-8 pb-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d2d2d7]/80 [&::-webkit-scrollbar-thumb]:hover:bg-[#b0b0b5] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-corner]:bg-transparent group/scroll">
              <div className="overflow-x-auto pr-6 [&::-webkit-scrollbar]:h-0 [&:hover::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d2d2d7]/80 [&::-webkit-scrollbar-track]:bg-transparent">

                <div className="rounded-b-xl overflow-hidden">
                  {renderPreviewTable(sheet.assets, sheet.liabilities, "资产", "负债", "text-[#34c759]", "text-red-500", "净资产", netWorth, totalAssets, totalLiabilities, "normal")}
                </div>

                {/* Table 2: Income & Expenses */}
                <div className="mt-8 border-t border-[#e8e8ed] pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-px flex-1 bg-gradient-to-r from-[#e8e8ed] to-transparent" />
                    <span className="text-[11px] font-medium text-[#86868b] tracking-wide">收支明细</span>
                    <span className="h-px flex-1 bg-gradient-to-l from-[#e8e8ed] to-transparent" />
                  </div>
                  <div className="rounded-b-xl overflow-hidden">
                    {renderPreviewTable(sheet.income, sheet.expenses, "收入", "开支", "text-green-600", "text-orange-600", "结余", totalIncome - totalExpenses, totalIncome, totalExpenses, "small")}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MoM Comparison Modal ── */}
      {showMom && (() => {
        const prevM = prevMonth(activeMonth);
        const prevSheet = store[prevM] ? { ...defaultSheet(), ...store[prevM] } : null;
        const prevTotalAssets = prevSheet ? prevSheet.assets.reduce((s, g) => s + totalGroup(g), 0) : 0;
        const prevTotalLiabilities = prevSheet ? prevSheet.liabilities.reduce((s, g) => s + totalGroup(g), 0) : 0;
        const prevTotalIncome = prevSheet ? prevSheet.income.reduce((s, g) => s + totalGroup(g), 0) : 0;
        const prevTotalExpenses = prevSheet ? prevSheet.expenses.reduce((s, g) => s + totalGroup(g), 0) : 0;
        const rows = [
          { label: "总资产", current: totalAssets, prev: prevTotalAssets, color: "text-[#34c759]" },
          { label: "总负债", current: totalLiabilities, prev: prevTotalLiabilities, color: "text-red-500" },
          { label: "净资产", current: netWorth, prev: prevTotalAssets - prevTotalLiabilities, color: "text-[#1d1d1f]" },
          { label: "总收入", current: totalIncome, prev: prevTotalIncome, color: "text-green-600" },
          { label: "总开支", current: totalExpenses, prev: prevTotalExpenses, color: "text-orange-600" },
          { label: "结余", current: totalIncome - totalExpenses, prev: prevTotalIncome - prevTotalExpenses, color: "" },
        ];
        function diffPct(c: number, p: number): string {
          if (p === 0) return c > 0 ? "+∞" : c === 0 ? "0.0%" : "-∞";
          return ((c - p) / p * 100).toFixed(1) + "%";
        }
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 px-4 py-8 backdrop-blur-sm"
          onClick={() => setShowMom(false)}>
          <div className="flex max-h-[85vh] w-full max-w-[600px] flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/[0.04]"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between shrink-0 px-8 pt-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h16v12H2z" /><path d="M6 2v4m8-4v4M2 10h16" /><path d="M6 14l3-3 3 2 4-4" /></svg>
                </div>
                <h2 className="text-[18px] font-semibold text-[#1d1d1f]">环比对比</h2>
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[11px] font-medium text-[#86868b]">{monthLabel(prevM)} → {monthLabel(activeMonth)}</span>
              </div>
              <button onClick={() => setShowMom(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#86868b] transition-colors hover:bg-[#f0f0f0] cursor-pointer">
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto px-8 pb-8">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="pb-3 pr-6 text-left text-[13px] font-semibold text-[#1d1d1f] border-b border-[#e8e8ed]">项目</th>
                    <th className="pb-3 pr-6 text-right text-[13px] font-semibold text-[#1d1d1f] border-b border-[#e8e8ed]">本月</th>
                    <th className="pb-3 pr-6 text-right text-[13px] font-semibold text-[#6e6e73] border-b border-[#e8e8ed]">上月</th>
                    <th className="pb-3 pr-6 text-right text-[13px] font-semibold text-[#6e6e73] border-b border-[#e8e8ed]">差额</th>
                    <th className="pb-3 text-right text-[13px] font-semibold text-[#6e6e73] border-b border-[#e8e8ed]">环比</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const diff = r.current - r.prev;
                    const isLast = i === rows.length - 1;
                    return (
                      <tr key={r.label} className={isLast ? "" : "border-b border-[#f0f0f2]"}>
                        <td className={`py-3 pr-6 text-[14px] ${r.color || "text-[#1d1d1f]"} font-medium`}>{r.label}</td>
                        <td className={`py-3 pr-6 text-right tabular-nums text-[14px] ${r.color || "text-[#1d1d1f]"}`}>{fmt(r.current)}</td>
                        <td className={`py-3 pr-6 text-right tabular-nums text-[14px] text-[#6e6e73]`}>{prevSheet ? fmt(r.prev) : "-"}</td>
                        <td className={`py-3 pr-6 text-right tabular-nums text-[14px] ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {prevSheet ? (diff >= 0 ? "+" : "") + fmt(Math.abs(diff)) : "-"}
                        </td>
                        <td className={`py-3 text-right tabular-nums text-[14px] font-medium ${r.current - r.prev >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {prevSheet ? diffPct(r.current, r.prev) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!prevSheet && (
                <div className="mt-6 text-center text-[13px] text-[#86868b] bg-[#f5f5f7] rounded-xl py-4">
                  暂无 {monthLabel(prevM)} 的数据，无法进行环比对比
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── Add Group Modal ── */}
      {showAddGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setShowAddGroup(null)}>
          <div className="w-full max-w-[380px] rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[18px] font-semibold text-[#1d1d1f]">添加分组</h3>
            <p className="mt-1 text-[13px] text-[#86868b]">为{showAddGroup === "assets" ? "资产" : showAddGroup === "liabilities" ? "负债" : showAddGroup === "income" ? "收入" : "开支"}添加新的分类</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">分组名称</label>
                <input value={addGroupForm.label} onChange={(e) => setAddGroupForm({ ...addGroupForm, label: e.target.value })}
                  placeholder="如：基金、股票、房贷" autoFocus
                  className="w-full rounded-xl border border-[#d2d2d7] px-4 py-3 text-[14px] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 bg-white" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {GROUP_TYPES.map((t) => (
                    <label key={t.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] transition-all duration-200 ${
                        addGroupForm.type === t.value
                          ? "border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3] font-medium"
                          : "border-[#d2d2d7] text-[#6e6e73] hover:border-[#b0b0b5]"
                      }`}>
                      <input type="radio" name="groupType" value={t.value} checked={addGroupForm.type === t.value}
                        onChange={() => setAddGroupForm({ ...addGroupForm, type: t.value })} className="sr-only" />
                      <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                        addGroupForm.type === t.value ? "border-[#0071e3]" : "border-[#d2d2d7]"
                      }`}>
                        {addGroupForm.type === t.value && <span className="h-2 w-2 rounded-full bg-[#0071e3]" />}
                      </span>
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button onClick={() => setShowAddGroup(null)}
                className="flex-1 rounded-full border border-[#d2d2d7] py-3 text-[14px] font-medium text-[#6e6e73] transition-all duration-200 hover:bg-[#f5f5f7] cursor-pointer">取消</button>
              <button onClick={addGroup}
                className="flex-1 rounded-full bg-[#0071e3] py-3 text-[14px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] shadow-sm cursor-pointer">添加</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Alert Modal ── */}
      {alertMsg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4"
          onClick={() => setAlertMsg("")}>
          <div className="w-full max-w-[340px] rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500">
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8" /><path d="M10 6v4M10 13v1" /></svg>
              </div>
              <span className="text-[16px] font-semibold text-[#1d1d1f]">提示</span>
            </div>
            <p className="text-[14px] text-[#6e6e73] leading-relaxed">{alertMsg}</p>
            <button onClick={() => setAlertMsg("")}
              className="mt-5 w-full rounded-full bg-[#0071e3] py-2.5 text-[14px] font-medium text-white transition-all duration-200 hover:bg-[#0077ed] cursor-pointer shadow-sm">知道了</button>
          </div>
        </div>
      )}

      {/* ── Custom Confirm Modal ── */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4"
          onClick={() => setConfirmAction(null)}>
          <div className="w-full max-w-[340px] rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8" /><path d="M10 6v4M10 13v1" /></svg>
              </div>
              <span className="text-[16px] font-semibold text-[#1d1d1f]">确认删除</span>
            </div>
            <p className="text-[14px] text-[#6e6e73] leading-relaxed">{confirmAction.msg}</p>
            <div className="mt-5 flex items-center gap-3">
              <button onClick={() => setConfirmAction(null)}
                className="flex-1 rounded-full border border-[#d2d2d7] py-2.5 text-[14px] font-medium text-[#6e6e73] transition-all duration-200 hover:bg-[#f5f5f7] cursor-pointer">取消</button>
              <button onClick={confirmAction.onConfirm}
                className="flex-1 rounded-full bg-red-500 py-2.5 text-[14px] font-medium text-white transition-all duration-200 hover:bg-red-600 cursor-pointer shadow-sm">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
