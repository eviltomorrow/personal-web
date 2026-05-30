"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function getExpiresAt(): number | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem("expires_at");
  return v ? parseInt(v, 10) : null;
}

function decodeExpFromJWT(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

export function setTokens(access: string, refresh: string, expiresIn?: number) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  const exp = expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : decodeExpFromJWT(access);
  if (exp) {
    localStorage.setItem("expires_at", String(exp));
  }
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("expires_at");
}

export function isLoggedIn(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  const expiredAt = getExpiresAt();
  if (expiredAt && expiredAt * 1000 < Date.now()) return false;
  return true;
}

const REFRESH_INTERVAL_MS = 30_000;
const REFRESH_WINDOW_SEC = 120;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

async function tryProactiveRefresh(): Promise<void> {
  const exp = getExpiresAt();
  if (!exp) return;
  const nowSec = Math.floor(Date.now() / 1000);
  if (exp - nowSec > REFRESH_WINDOW_SEC) return;
  const access = getAccessToken();
  const refresh = getRefreshToken();
  if (!refresh) return;
  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(access ? { Authorization: `Bearer ${access}` } : {}) },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    const json: any = await res.json();
    if (json.code === 0 && json.data) {
      setTokens(json.data.access_token, json.data.refresh_token, json.data.expires_in);
    }
  } catch {}
}

export function startTokenRefresh() {
  stopTokenRefresh();
  tryProactiveRefresh();
  refreshTimer = setInterval(tryProactiveRefresh, REFRESH_INTERVAL_MS);
}

export function stopTokenRefresh() {
  if (refreshTimer !== null) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function refreshTokens(): Promise<boolean> {
  const access = getAccessToken();
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(access ? { Authorization: `Bearer ${access}` } : {}) },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    let json: any;
    try { json = await res.json(); } catch { return false; }
    if (json.code === 0 && json.data) {
      setTokens(json.data.access_token, json.data.refresh_token, json.data.expires_in);
      return true;
    }
  } catch {}
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

  async revokeToken(refreshToken: string): Promise<void> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    try {
      await fetch(`${API_BASE}/auth/token/revoke`, {
        method: "POST", headers,
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } finally {
      clearTokens();
    }
  },

};

// ── Finance API ──

export const financeApi = {
  // Asset Categories
  listAssetCategories(month?: string): Promise<{ categories: AssetCategory[] }> {
    const qs = month ? `?month=${month}` : "";
    return request("GET", `/finance/asset-categories${qs}`);
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
  listAssets(categoryId?: string, month?: string): Promise<{ assets: Asset[] }> {
    const params = new URLSearchParams();
    if (categoryId) params.set("category_id", categoryId);
    if (month) params.set("month", month);
    const qs = params.toString();
    return request("GET", `/finance/assets${qs ? `?${qs}` : ""}`);
  },
  createAsset(data: { category_id: string; name: string; amount: number; currency?: string; as_of_date?: number; sort_order?: number; notes?: string }): Promise<{ asset_id: string }> {
    return request("POST", "/finance/assets", { currency: "CNY", ...data });
  },
  updateAsset(assetId: string, data: { name?: string; amount?: number; currency?: string; as_of_date?: number; sort_order?: number; notes?: string }) {
    return request("PUT", `/finance/assets/${assetId}`, data);
  },
  deleteAsset(assetId: string) {
    return request("DELETE", `/finance/assets/${assetId}`);
  },

  // Liability Categories
  listLiabilityCategories(month?: string): Promise<{ categories: LiabilityCategory[] }> {
    const qs = month ? `?month=${month}` : "";
    return request("GET", `/finance/liability-categories${qs}`);
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
  listLiabilities(categoryId?: string, month?: string): Promise<{ liabilities: Liability[] }> {
    const params = new URLSearchParams();
    if (categoryId) params.set("category_id", categoryId);
    if (month) params.set("month", month);
    const qs = params.toString();
    return request("GET", `/finance/liabilities${qs ? `?${qs}` : ""}`);
  },
  createLiability(data: { category_id: string; name: string; amount: number; currency?: string; as_of_date?: number; sort_order?: number; interest_rate?: number; due_date?: number; notes?: string }): Promise<{ liability_id: string }> {
    return request("POST", "/finance/liabilities", { currency: "CNY", ...data });
  },
  updateLiability(liabilityId: string, data: { name?: string; amount?: number; currency?: string; as_of_date?: number; sort_order?: number; interest_rate?: number; due_date?: number; notes?: string }) {
    return request("PUT", `/finance/liabilities/${liabilityId}`, data);
  },
  deleteLiability(liabilityId: string) {
    return request("DELETE", `/finance/liabilities/${liabilityId}`);
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
  createTransaction(data: { category_id: string; type: number; amount: number; transaction_date: number; description?: string; sort_order?: number; notes?: string; currency?: string }): Promise<{ transaction_id: string }> {
    return request("POST", "/finance/transactions", { currency: "CNY", ...data });
  },
  updateTransaction(transactionId: string, data: { amount?: number; description?: string; transaction_date?: number; sort_order?: number; currency?: string; notes?: string }) {
    return request("PUT", `/finance/transactions/${transactionId}`, data);
  },
  deleteTransaction(transactionId: string) {
    return request("DELETE", `/finance/transactions/${transactionId}`);
  },
};
