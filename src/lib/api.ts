import {
  getAccessToken,
  isTokenExpired,
  refreshTokens,
} from "./auth";

export async function apiClient(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const accessToken = getAccessToken();
  if (accessToken && isTokenExpired()) {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      window.location.href = "/";
      return new Promise<Response>(() => {});
    }
  }

  const token = getAccessToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const newToken = getAccessToken();
      const retryHeaders = new Headers(options.headers);
      if (newToken) {
        retryHeaders.set("Authorization", `Bearer ${newToken}`);
      }
      return fetch(url, { ...options, headers: retryHeaders });
    }

    window.location.href = "/";
    return new Promise<Response>(() => {});
  }

  return response;
}
