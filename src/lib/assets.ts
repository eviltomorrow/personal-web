import { apiClient } from "./api";

export interface ApiEntry {
  id: string;
  name: string;
  amount: number;
  code?: string;
  quantity?: number;
  sort_order?: number;
}

export interface ApiGroup {
  id: string;
  label: string;
  type: string;
  sort_order?: number;
  entries: ApiEntry[];
}

export interface ApiSheetData {
  month: string;
  assets: ApiGroup[];
  liabilities: ApiGroup[];
  income: ApiGroup[];
  expenses: ApiGroup[];
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

function toYuan(fen: number): number {
  return fen / 100;
}

function toFen(yuan: number): number {
  return Math.round(yuan * 100);
}

function convertEntryFromApi(e: ApiEntry) {
  return { ...e, amount: toYuan(e.amount) };
}

function convertEntryToApi(e: { id: string; name: string; amount: number; code?: string; quantity?: number }): ApiEntry {
  return { id: e.id, name: e.name, amount: toFen(e.amount), code: e.code || undefined, quantity: e.quantity || undefined };
}

function convertGroupFromApi(g: ApiGroup) {
  return { ...g, entries: g.entries.map(convertEntryFromApi) };
}

function convertGroupToApi(g: { id: string; label: string; type: string; entries: { id: string; name: string; amount: number; code?: string; quantity?: number }[] }, idx: number): ApiGroup {
  return {
    id: g.id, label: g.label, type: g.type, sort_order: idx,
    entries: g.entries.map((e, ei) => ({ ...convertEntryToApi(e), sort_order: ei })),
  };
}

export async function fetchSheet(month: string): Promise<ApiSheetData | null> {
  const res = await apiClient(`/api/v1/balance-sheet?month=${month}`);
  if (res.status === 404) {
    return { month, assets: [], liabilities: [], income: [], expenses: [] };
  }
  if (!res.ok) return null;
  const body: ApiResponse<ApiSheetData> = await res.json();
  if (body.code !== 0 || !body.data) return null;
  const d = body.data;
  return {
    month: d.month,
    assets: (d.assets ?? []).map(convertGroupFromApi),
    liabilities: (d.liabilities ?? []).map(convertGroupFromApi),
    income: (d.income ?? []).map(convertGroupFromApi),
    expenses: (d.expenses ?? []).map(convertGroupFromApi),
  };
}

export async function saveSheet(
  month: string,
  sections: { assets: ApiGroup[]; liabilities: ApiGroup[]; income: ApiGroup[]; expenses: ApiGroup[] },
): Promise<boolean> {
  const payload = {
    month,
    assets: sections.assets.map((g, i) => convertGroupToApi(g, i)),
    liabilities: sections.liabilities.map((g, i) => convertGroupToApi(g, i)),
    income: sections.income.map((g, i) => convertGroupToApi(g, i)),
    expenses: sections.expenses.map((g, i) => convertGroupToApi(g, i)),
  };
  try {
    const res = await apiClient("/api/v1/balance-sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return false;
    const body: ApiResponse<null> = await res.json();
    return body.code === 0;
  } catch {
    return false;
  }
}
