# personal-web — 项目结构速览

## 技术栈
- **Next.js 16.2.6** (App Router) + **React 19.2.4**
- **TypeScript 5** (strict, bundler module resolution)
- **Tailwind CSS 4** (`@theme inline` CSS-first config)
- **ESLint 9** flat config

## 路径别名
- `@/` → `./src/*`

## 目录结构

```
src/
├── app/
│   ├── layout.tsx              # 根布局: lang="zh", 背景 #f5f5f7, SF Pro 字体
│   ├── globals.css             # Tailwind 入口 + 自定义主题
│   ├── page.tsx                # `/` 登录页 (LoginPage) — "use client"
│   ├── favicon.ico
│   ├── home/
│   │   └── page.tsx            # `/home` 后台首页 (HomePage) — "use client"
│   ├── register/
│   │   └── page.tsx            # `/register` 注册页 (RegisterPage) — "use client"
│   └── balance-sheet/
│       └── page.tsx            # `/balance-sheet` 资产负债表 — "use client"
└── lib/
    ├── auth.ts                 # Token 存储 & 自动刷新逻辑
    └── api.ts                  # Fetch 封装 (自动携带 token + 401 自动续约)
```

## 页面详情

### `/` — 登录页 (`page.tsx`)
- Client Component (`"use client"`)
- 背景: 非常淡的蓝色渐变 overlay + 底部模糊光晕
- 白色毛玻璃卡片 (`rounded-3xl bg-white/90 backdrop-blur-xl`) 包裹表单
- 顶部蓝色渐变图标 + "欢迎回到 liarsa" 副标题
- 邮箱/密码输入框，带可见标签（非 sr-only）+ 忘记密码链接
- 表单校验（空字段检查）+ 调用 `POST /api/v1/auth/login`
- 登录成功: `saveTokens()` 存入 localStorage → `router.push("/home")`
- 登录失败: 显示 `body.message` 错误提示
- 中下部渐变蓝色装饰分隔线
- 底部: 注册链接 + 版权/隐私/服务条款

### `/register` — 注册页 (`register/page.tsx`)
- Client Component (`"use client"`)
- 背景/卡片/分隔线/页脚与登录页完全一致
- 4 个字段: 昵称、邮箱、密码、确认密码，带可见标签
- 校验: 全部必填 + 两次密码一致
- 调用 `POST /api/v1/auth/register`
- 成功: 弹窗（渐变绿色图标 + 毛玻璃 card）→ "前往登录" 链接至 `/`
- 失败: 显示 `body.message` 错误提示

### `/home` — 后台首页 (`home/page.tsx`)
- Client Component (`"use client"`)
- **浮动侧边栏**: 左侧悬浮, hover 展开/收起, 5 个工具入口 (写文章/项目/统计/用户/设置)
- **顶部导航**: sticky, 毛玻璃效果, 显示用户名 + 头像
- **统计卡片**: 项目(12) / 文章(28) / 访问量(1,284)
- **最近活动**: 3 条静态活动记录
- **快捷操作**: 4 个按钮 (写文章/新建项目/查看统计/系统设置)

### `/balance-sheet` — 资产负债表 (`balance-sheet/page.tsx`)
- Client Component (`"use client"`)
- 顶部导航 + 浮动侧边栏（与 `/home` 一致）
- 卡片布局
- **概览卡片**: 总资产 ¥1,286,450 (+5.2%) / 总负债 ¥486,200 (-2.1%) / 净资产 ¥800,250 (+8.3%)
- **左侧**: 资产明细（货币资金、应收账款、存货、固定资产等 9 项 + 合计，绿色强调色）
- **右侧**: 负债明细（短期借款、应付账款等 7 项 + 合计，红色强调色）
- **右侧下方**: 所有者权益（实收资本、资本公积、盈余公积、未分配利润 + 合计，蓝色强调色）
- **底部**: 资产负债率 37.8% 进度条 + 流动比率 1.82

## API 代理
- `next.config.ts`: `/api/:path*` → `http://127.0.0.1:8080/api/:path*`

## Auth 系统

### `src/lib/auth.ts`
- `saveTokens({ accessToken, refreshToken, expiresAt })` — 存入 localStorage
- `getAccessToken()` — 读取 access token
- `clearTokens()` — 清除所有 token
- `isTokenExpired()` — 检查是否过期（提前 30s 预判）
- `refreshTokens()` — 调用 `POST /api/v1/auth/refresh` 刷新 token，支持并发请求合并

### `src/lib/api.ts`
- `apiClient(url, options)` — 替代 fetch
  - 请求前自动检查 token 过期 → 过期则刷新
  - 自动注入 `Authorization: Bearer <token>`
  - 收到 401 → 自动刷新 → 重放原请求
  - 刷新失败 → 清 token → 跳转 `/`

## 设计系统 (Apple 风格)
- 背景色: `#f5f5f7`
- 主色: `#0071e3` (蓝色), hover `#0077ed`, active `#006edb`
- 文字: `#1d1d1f` (主), `#6e6e73` (次要), `#86868b` (辅助)
- 圆角: `rounded-2xl` / `rounded-3xl` 卡片, `rounded-xl` 输入框, `rounded-full` 按钮
- 字体: SF Pro Display / SF Pro Text (fallback Helvetica Neue)
- 输入框: 白色背景, `.5px` 边框, focus 时蓝色 ring
- 按钮: 圆角 pill 样式, 带 `shadow-sm`, disabled 时 `opacity-50`
- 卡片: 细边框 (`border-[#d2d2d7]`), hover 微动效
- 毛玻璃: `bg-white/80 backdrop-blur-xl` (导航栏)

## UI 组件风格指南
- **页面结构**: `min-h-screen bg-[#f5f5f7]` → `header` (sticky 毛玻璃) → `main mx-auto max-w-[980px|1100px] px-6 pt-10 pb-20`
- **侧边栏**: `fixed left-4 top-1/2 -translate-y-1/2`, hover 展开动画, 5 icon+label 按钮
- **统计卡片**: `rounded-2xl border border-[#d2d2d7] bg-white p-6`, 大数字 + 微变化指示
- **概览/摘要栏**: `grid grid-cols-1 sm:grid-cols-3 gap-4`
- **详情卡片**: 带 header 色条的 SectionCard, 分割线列表, 合计 footer (`bg-[#fafafa]`)
- **登录/注册卡片**: `rounded-3xl border border-[#d2d2d7]/80 bg-white/90 px-10 py-10 shadow-sm backdrop-blur-xl`
- **分隔线**: 居中渐变圆点 (`bg-gradient-to-r from-transparent via-[#0071e3]/30 to-transparent rounded-full h-1.5 w-24`)
- **表单字段**: `text-[12px] font-medium text-[#6e6e73]` label, `mt-1.5` 间隔
- **错误提示**: `text-[13px] text-red-500`

## 运行命令
- `npm run dev` — 开发 (禁用 DEP0205 警告)
- `npm run build` — 构建
- `npm run start` — 生产启动
- `npm run lint` — ESLint
- `npx tsc --noEmit` — TypeScript 类型检查

## 注意事项
- 当前为前端骨架，无 API 路由、无后端逻辑、无状态管理
- 所有 UI 文案为中文
- Next.js 版本可能有 breaking changes，操作前查阅 `node_modules/next/dist/docs/`
