"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function refreshTokens(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    let json: any;
    try { json = await res.json(); } catch { return false; }
    if (json.code === 0 && json.data) {
      setTokens(json.data.access_token, json.data.refresh_token);
      return true;
    }
  } catch {}
  clearTokens();
  return false;
}

async function request<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json: any;
  try {
    json = await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || res.statusText || "Request failed");
  }

  if (json.code !== 0) {
    if ((res.status === 401 || json.code === 401) && auth) {
      const refreshed = await refreshTokens();
      if (refreshed) return request<T>(method, path, body, auth);
      throw new ApiError(json.code, json.message || "Unauthorized");
    }
    throw new ApiError(json.code, json.message || "Request failed");
  }

  return json.data as T;
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AssetCategory {
  category_id: string;
  user_id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface Asset {
  asset_id: string;
  user_id: string;
  category_id: string;
  name: string;
  amount: number;
  currency: string;
  as_of_date: number;
  notes: string;
  created_at: number;
  updated_at: number;
}

export interface LiabilityCategory {
  category_id: string;
  user_id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface Liability {
  liability_id: string;
  user_id: string;
  category_id: string;
  name: string;
  amount: number;
  currency: string;
  interest_rate: number;
  due_date: number;
  notes: string;
  created_at: number;
  updated_at: number;
}

export interface TransactionCategory {
  category_id: string;
  user_id: string;
  name: string;
  type: number;
  icon: string;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface Transaction {
  transaction_id: string;
  user_id: string;
  category_id: string;
  type: number;
  amount: number;
  currency: string;
  transaction_date: number;
  description: string;
  notes: string;
  asset_id: string;
  created_at: number;
  updated_at: number;
}

// ── Auth API ──

export const authApi = {
  login(identifier: string, password: string): Promise<LoginResult> {
    const authType = identifier.includes("@") ? "email" : /^\d{11}$/.test(identifier) ? "phone" : "username";
    return request<LoginResult>("POST", "/auth/login", { auth_type: authType, identifier, password });
  },

  register(authType: "email" | "phone" | "username", identifier: string, password: string): Promise<LoginResult> {
    return request<LoginResult>("POST", "/auth/register", { auth_type: authType, identifier, password });
  },
};

// ── Finance API ──

export const financeApi = {
  // Asset Categories
  listAssetCategories(): Promise<{ categories: AssetCategory[] }> {
    return request("GET", "/finance/asset-categories");
  },
  createAssetCategory(data: { name: string; icon?: string; sort_order?: number }): Promise<{ category_id: string }> {
    return request("POST", "/finance/asset-categories", data);
  },
  updateAssetCategory(categoryId: string, data: { name?: string; icon?: string; sort_order?: number }) {
    return request("PUT", `/finance/asset-categories/${categoryId}`, data);
  },
  deleteAssetCategory(categoryId: string) {
    return request("DELETE", `/finance/asset-categories/${categoryId}`);
  },

  // Assets
  listAssets(categoryId?: string): Promise<{ assets: Asset[] }> {
    const qs = categoryId ? `?category_id=${categoryId}` : "";
    return request("GET", `/finance/assets${qs}`);
  },
  createAsset(data: { category_id: string; name: string; amount: number; currency?: string; as_of_date?: number; notes?: string }): Promise<{ asset_id: string }> {
    return request("POST", "/finance/assets", { currency: "CNY", ...data });
  },
  updateAsset(assetId: string, data: { name?: string; amount?: number; currency?: string; as_of_date?: number; notes?: string }) {
    return request("PUT", `/finance/assets/${assetId}`, data);
  },
  deleteAsset(assetId: string) {
    return request("DELETE", `/finance/assets/${assetId}`);
  },

  // Liability Categories
  listLiabilityCategories(): Promise<{ categories: LiabilityCategory[] }> {
    return request("GET", "/finance/liability-categories");
  },
  createLiabilityCategory(data: { name: string; icon?: string; sort_order?: number }): Promise<{ category_id: string }> {
    return request("POST", "/finance/liability-categories", data);
  },
  updateLiabilityCategory(categoryId: string, data: { name?: string; icon?: string; sort_order?: number }) {
    return request("PUT", `/finance/liability-categories/${categoryId}`, data);
  },
  deleteLiabilityCategory(categoryId: string) {
    return request("DELETE", `/finance/liability-categories/${categoryId}`);
  },

  // Liabilities
  listLiabilities(categoryId?: string): Promise<{ liabilities: Liability[] }> {
    const qs = categoryId ? `?category_id=${categoryId}` : "";
    return request("GET", `/finance/liabilities${qs}`);
  },
  createLiability(data: { category_id: string; name: string; amount: number; currency?: string; interest_rate?: number; due_date?: number; notes?: string }): Promise<{ liability_id: string }> {
    return request("POST", "/finance/liabilities", { currency: "CNY", ...data });
  },
  updateLiability(liabilityId: string, data: { name?: string; amount?: number; currency?: string; interest_rate?: number; due_date?: number; notes?: string }) {
    return request("PUT", `/finance/liabilities/${liabilityId}`, data);
  },
  deleteLiability(liabilityId: string) {
    return request("DELETE", `/finance/liabilities/${liabilityId}`);
  },

  // Transaction Categories
  listTransactionCategories(type?: number): Promise<{ categories: TransactionCategory[] }> {
    const qs = type !== undefined ? `?type=${type}` : "";
    return request("GET", `/finance/transaction-categories${qs}`);
  },
  createTransactionCategory(data: { name: string; type: number; icon?: string; sort_order?: number }): Promise<{ category_id: string }> {
    return request("POST", "/finance/transaction-categories", data);
  },
  updateTransactionCategory(categoryId: string, data: { name?: string; icon?: string; sort_order?: number }) {
    return request("PUT", `/finance/transaction-categories/${categoryId}`, data);
  },
  deleteTransactionCategory(categoryId: string) {
    return request("DELETE", `/finance/transaction-categories/${categoryId}`);
  },

  // Transactions
  listTransactions(params?: { type?: number; category_id?: string; start_date?: number; end_date?: number; page?: number; page_size?: number }): Promise<{ transactions: Transaction[]; total: number; page: number; page_size: number }> {
    const qs = new URLSearchParams();
    if (params?.type !== undefined) qs.set("type", String(params.type));
    if (params?.category_id) qs.set("category_id", params.category_id);
    if (params?.start_date) qs.set("start_date", String(params.start_date));
    if (params?.end_date) qs.set("end_date", String(params.end_date));
    if (params?.page) qs.set("page", String(params.page));
    if (params?.page_size) qs.set("page_size", String(params.page_size));
    return request("GET", `/finance/transactions?${qs.toString()}`);
  },
  createTransaction(data: { category_id: string; type: number; amount: number; transaction_date: number; description?: string; notes?: string; currency?: string }): Promise<{ transaction_id: string }> {
    return request("POST", "/finance/transactions", { currency: "CNY", ...data });
  },
  updateTransaction(transactionId: string, data: { amount?: number; description?: string; currency?: string; notes?: string }) {
    return request("PUT", `/finance/transactions/${transactionId}`, data);
  },
  deleteTransaction(transactionId: string) {
    return request("DELETE", `/finance/transactions/${transactionId}`);
  },
};
