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

    case "GET /api/v1/assets-and-liabilities": {
      const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
      const MOCK_SHEET = {
        month,
        assets: [
          {
            id: "mock_grp_cash",
            label: "现金类",
            type: "cash",
            sort_order: 0,
            entries: [
              { id: "mock_ent_current_deposit", name: "活期存款", amount: 5000000, sort_order: 0 },
              { id: "mock_ent_fixed_deposit", name: "定期存款", amount: 20000000, sort_order: 1 },
              { id: "mock_ent_cash", name: "现金", amount: 500000, sort_order: 2 },
              { id: "mock_ent_money_fund", name: "货币基金", amount: 3000000, sort_order: 3 },
            ],
          },
          {
            id: "mock_grp_fund",
            label: "基金",
            type: "fund",
            sort_order: 1,
            entries: [
              { id: "mock_ent_index_fund", name: "沪深300指数基金", amount: 15000000, sort_order: 0 },
              { id: "mock_ent_bond_fund", name: "债券基金", amount: 8000000, sort_order: 1 },
              { id: "mock_ent_equity_fund", name: "股票型基金", amount: 6000000, sort_order: 2 },
            ],
          },
          {
            id: "mock_grp_stock",
            label: "股票",
            type: "stock",
            sort_order: 2,
            entries: [
              { id: "mock_ent_tencent", name: "腾讯控股", amount: 5000000, quantity: 100, code: "00700", sort_order: 0 },
              { id: "mock_ent_kweichow", name: "贵州茅台", amount: 3000000, quantity: 15, code: "600519", sort_order: 1 },
              { id: "mock_ent_alibaba", name: "阿里巴巴", amount: 2000000, quantity: 200, code: "09988", sort_order: 2 },
            ],
          },
          {
            id: "mock_grp_property",
            label: "固定资产",
            type: "property",
            sort_order: 3,
            entries: [
              { id: "mock_ent_house", name: "自住房产", amount: 200000000, sort_order: 0 },
              { id: "mock_ent_car", name: "汽车", amount: 15000000, sort_order: 1 },
            ],
          },
        ],
        liabilities: [
          {
            id: "mock_grp_loan",
            label: "贷款",
            type: "loan",
            sort_order: 0,
            entries: [
              { id: "mock_ent_mortgage", name: "住房贷款", amount: 80000000, sort_order: 0 },
              { id: "mock_ent_car_loan", name: "车贷", amount: 10000000, sort_order: 1 },
            ],
          },
          {
            id: "mock_grp_credit",
            label: "信用卡",
            type: "credit",
            sort_order: 1,
            entries: [
              { id: "mock_ent_credit_cmb", name: "招商银行信用卡", amount: 500000, sort_order: 0 },
              { id: "mock_ent_credit_ccb", name: "建设银行信用卡", amount: 300000, sort_order: 1 },
              { id: "mock_ent_credit_boc", name: "中国银行信用卡", amount: 200000, sort_order: 2 },
            ],
          },
        ],
        income: [
          {
            id: "mock_grp_salary",
            label: "工资收入",
            type: "income",
            sort_order: 0,
            entries: [
              { id: "mock_ent_monthly_salary", name: "月薪", amount: 2500000, sort_order: 0 },
              { id: "mock_ent_bonus", name: "奖金", amount: 500000, sort_order: 1 },
              { id: "mock_ent_allowance", name: "补贴", amount: 100000, sort_order: 2 },
            ],
          },
          {
            id: "mock_grp_invest",
            label: "投资收益",
            type: "income",
            sort_order: 1,
            entries: [
              { id: "mock_ent_fund_income", name: "基金分红", amount: 200000, sort_order: 0 },
              { id: "mock_ent_stock_dividend", name: "股票股息", amount: 100000, sort_order: 1 },
            ],
          },
        ],
        expenses: [
          {
            id: "mock_grp_daily",
            label: "日常开支",
            type: "expense",
            sort_order: 0,
            entries: [
              { id: "mock_ent_meal", name: "餐饮", amount: 300000, sort_order: 0 },
              { id: "mock_ent_transport", name: "交通", amount: 50000, sort_order: 1 },
              { id: "mock_ent_shopping", name: "购物", amount: 200000, sort_order: 2 },
              { id: "mock_ent_utilities", name: "水电燃气", amount: 80000, sort_order: 3 },
            ],
          },
          {
            id: "mock_grp_entertain",
            label: "娱乐",
            type: "expense",
            sort_order: 1,
            entries: [
              { id: "mock_ent_movie", name: "电影", amount: 20000, sort_order: 0 },
              { id: "mock_ent_travel", name: "旅游", amount: 100000, sort_order: 1 },
              { id: "mock_ent_game", name: "游戏充值", amount: 30000, sort_order: 2 },
            ],
          },
        ],
      };
      return jsonResponse({
        code: 0,
        message: "success",
        data: MOCK_SHEET,
      });
    }

    case "POST /api/v1/assets-and-liabilities": {
      return jsonResponse({ code: 0, message: "success" });
    }
  }

  if (method === "PUT" && path.startsWith("/api/v1/mock-upload/")) {
    return new Response(null, { status: 200 });
  }

  return null;
}
