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
src/app/
├── layout.tsx          # 根布局: lang="zh", 背景 #f5f5f7, SF Pro 字体
├── globals.css         # Tailwind 入口 + 自定义主题 (--color-background, --color-foreground, --font-sans)
├── page.tsx            # `/` 登录页 (LoginPage)
├── favicon.ico
└── home/
    └── page.tsx        # `/home` 后台首页 (HomePage) — "use client"
```

## 页面详情

### `/` — 登录页 (`page.tsx`)
- Server Component
- 邮箱/密码输入框 (Apple 风格圆角 UX)
- 登录按钮 + 底部版权/隐私/条款链接
- 布局: flex 居中, 最大宽度 400px

### `/home` — 后台首页 (`home/page.tsx`)
- Client Component (`"use client"`)
- **浮动侧边栏**: 左侧悬浮, hover 展开/收起, 5 个工具入口 (写文章/项目/统计/用户/设置)
- **顶部导航**: sticky, 毛玻璃效果, 显示用户名 + 头像
- **统计卡片**: 项目(12) / 文章(28) / 访问量(1,284)
- **最近活动**: 3 条静态活动记录
- **快捷操作**: 4 个按钮 (写文章/新建项目/查看统计/系统设置)

## 运行命令
- `npm run dev` — 开发
- `npm run build` — 构建 (禁用 DEP0205 警告)
- `npm run start` — 生产启动
- `npm run lint` — ESLint

## 注意事项
- 当前为前端骨架，无 API 路由、无后端逻辑、无状态管理
- 所有 UI 文案为中文
- Next.js 版本可能有 breaking changes，操作前查阅 `node_modules/next/dist/docs/`
