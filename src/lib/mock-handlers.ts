function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const MOCK_USER = {
  user_id: "mock_user_001",
  nickname: "Demo用户",
  email: "demo@example.com",
  phone: "13800138000",
  avatar_url: "",
  gender: 0,
  birthday: Math.floor(Date.now() / 1000) - 86400 * 365 * 20,
  bio: "这是一个演示账户，所有数据均为本地模拟。",
  created_at: Math.floor(Date.now() / 1000) - 86400 * 30,
  updated_at: Math.floor(Date.now() / 1000),
};

export async function mockHandler(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;
  const key = `${method} ${path}`;

  switch (key) {
    case "POST /api/v1/auth/login":
    case "POST /api/v1/auth/register": {
      return jsonResponse({
        code: 0,
        message: "success",
        data: {
          access_token: "mock_access_token_" + Date.now(),
          refresh_token: "mock_refresh_token_" + Date.now(),
          expires_in: 604800,
        },
      });
    }

    case "POST /api/v1/auth/token/refresh": {
      return jsonResponse({
        code: 0,
        message: "success",
        data: {
          access_token: "mock_access_token_" + Date.now(),
          refresh_token: "mock_refresh_token_" + Date.now(),
          expires_in: 604800,
        },
      });
    }

    case "POST /api/v1/auth/token/revoke": {
      return jsonResponse({ code: 0, message: "success" });
    }

    case "GET /api/v1/user/profile": {
      return jsonResponse({ code: 0, message: "success", data: MOCK_USER });
    }

    case "PUT /api/v1/user/profile": {
      const body = await request.json();
      return jsonResponse({
        code: 0,
        message: "success",
        data: { ...MOCK_USER, ...body, updated_at: Math.floor(Date.now() / 1000) },
      });
    }

    case "POST /api/v1/user/avatar/upload": {
      const origin = url.origin;
      const presigned_url = `${origin}/api/v1/mock-upload/avatar_${Date.now()}.jpg`;
      return jsonResponse({
        code: 0,
        message: "success",
        data: {
          presigned_url,
          object_key: `avatars/mock_${Date.now()}.jpg`,
        },
      });
    }

    case "PUT /api/v1/user/avatar": {
      return jsonResponse({ code: 0, message: "success" });
    }

    case "GET /api/v1/balance-sheet": {
      const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
      return jsonResponse({
        code: 0,
        message: "success",
        data: {
          month,
          assets: [],
          liabilities: [],
          income: [],
          expenses: [],
        },
      });
    }

    case "POST /api/v1/balance-sheet": {
      return jsonResponse({ code: 0, message: "success" });
    }
  }

  if (method === "PUT" && path.startsWith("/api/v1/mock-upload/")) {
    return new Response(null, { status: 200 });
  }

  return null;
}
