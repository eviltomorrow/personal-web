const API_HOST = process.env.API_HOST || "http://127.0.0.1:8080";

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const backendUrl = new URL(url.pathname + url.search, API_HOST);
  return fetch(new Request(backendUrl, request));
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
