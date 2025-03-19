# 墨韵

这是一个基于Next.js开发的现代博客系统，包含前台展示和后台管理功能。

## 功能特点

### 前台功能
- 响应式设计，适配各种设备
- 博客文章展示
- 标签分类
- 关于页面
- 干净简洁的UI设计

### 后台管理
- 安全的登录系统
- 文章管理（新增、编辑、删除、发布/草稿）
- 标签管理
- Markdown编辑器支持

## 技术栈

- **前端框架**: Next.js (App Router)
- **样式**: Tailwind CSS
- **UI组件**: 自定义组件
- **图标**: Lucide React
- **数据库ORM**: Prisma
- **认证**: NextAuth.js
- **开发语言**: TypeScript

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 配置数据库

1. 复制 `.env.example` 到 `.env`，并根据你的数据库配置修改 `DATABASE_URL`

```bash
cp .env.example .env
```

2. 运行 Prisma 迁移，创建数据库表

```bash
npx prisma migrate dev --name init
```

### 开发环境运行

```bash
npm run dev

```

打开 [http://localhost:3000](http://localhost:3000) 查看前台页面。
访问 [http://localhost:3000/admin](http://localhost:3000/admin) 进入后台管理

### 生产环境构建

```bash
npm run build
npm start

```

## 项目结构

```
├── prisma/             # Prisma模型和迁移
├── public/             # 静态资源
├── src/                # 源代码
│   ├── app/            # Next.js App Router
│   │   ├── admin/      # 后台管理页面
│   │   ├── posts/      # 博客文章页面
│   │   ├── tags/       # 标签页面
│   │   ├── about/      # 关于页面
│   │   ├── layout.tsx  # 全局布局
│   │   └── page.tsx    # 首页
│   ├── components/     # 可复用组件
│   ├── lib/            # 工具函数和库
│   └── styles/         # 样式文件
├── package.json        # 项目依赖
└── tailwind.config.js  # Tailwind 配置
```



