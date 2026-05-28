import { mockHandler } from "@/lib/mock-handlers";

export async function GET(request: Request): Promise<Response> {
  const mock = await mockHandler(request);
  if (mock) return mock;
  return proxy(request);
}

export async function POST(request: Request): Promise<Response> {
  const mock = await mockHandler(request);
  if (mock) return mock;
  return proxy(request);
}

export async function PUT(request: Request): Promise<Response> {
  const mock = await mockHandler(request);
  if (mock) return mock;
  return proxy(request);
}

export async function DELETE(request: Request): Promise<Response> {
  const mock = await mockHandler(request);
  if (mock) return mock;
  return proxy(request);
}

export async function PATCH(request: Request): Promise<Response> {
  const mock = await mockHandler(request);
  if (mock) return mock;
  return proxy(request);
}

const API_HOST = process.env.API_HOST || "http://127.0.0.1:8080";

async function proxy(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const backendUrl = new URL(url.pathname + url.search, API_HOST);
  return fetch(new Request(backendUrl, request));
}
