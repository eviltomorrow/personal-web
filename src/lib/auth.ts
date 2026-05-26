const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const EXPIRES_AT_KEY = "expires_at";
const USER_KEY = "user_info";

export interface UserInfo {
  nickname: string;
  email?: string;
  avatar_url?: string;
}

function ls(): Storage | null {
  if (typeof window === "undefined") return null;
  return localStorage;
}

export function saveTokens(data: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}): void {
  ls()?.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  ls()?.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  // expiresIn is relative seconds from now, compute absolute timestamp
  const expiresAt = Date.now() + data.expiresIn * 1000;
  ls()?.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export function getAccessToken(): string | null {
  return ls()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return ls()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function saveUserInfo(user: UserInfo): void {
  ls()?.setItem(USER_KEY, JSON.stringify(user));
}

export function getUserInfo(): UserInfo | null {
  const raw = ls()?.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

let refreshTimer: ReturnType<typeof setInterval> | null = null;

export function startPeriodicRefresh(intervalMs = 60_000): void {
  stopPeriodicRefresh();
  refreshTimer = setInterval(async () => {
    const expiresAt = ls()?.getItem(EXPIRES_AT_KEY);
    if (!expiresAt) return;
    if (Date.now() > Number(expiresAt) - 5 * 60 * 1000) {
      await refreshTokens();
    }
  }, intervalMs);
}

export function stopPeriodicRefresh(): void {
  if (refreshTimer !== null) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

export function clearTokens(): void {
  stopPeriodicRefresh();
  ls()?.removeItem(ACCESS_TOKEN_KEY);
  ls()?.removeItem(REFRESH_TOKEN_KEY);
  ls()?.removeItem(EXPIRES_AT_KEY);
  ls()?.removeItem(USER_KEY);
}

export function isTokenExpired(): boolean {
  const expiresAt = ls()?.getItem(EXPIRES_AT_KEY);
  if (!expiresAt) return false;
  let expires = Number(expiresAt);
  if (expires < 1e12) expires *= 1000;
  return Date.now() > expires - 30_000;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return false;
  }

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/v1/auth/token/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const body = await res.json();
      if (body.code !== 0) {
        clearTokens();
        return false;
      }
      saveTokens({
        accessToken: body.data.access_token,
        refreshToken: body.data.refresh_token,
        expiresIn: body.data.expires_in,
      });
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
