const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const EXPIRES_AT_KEY = "expires_at";

export function saveTokens(data: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  localStorage.setItem(EXPIRES_AT_KEY, String(data.expiresAt));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}

export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
  if (!expiresAt) return true;
  return Date.now() > Number(expiresAt) - 30_000;
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
      const res = await fetch("/api/v1/auth/refresh", {
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
        expiresAt: body.data.expires_at,
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
