# 墨韵博客系统

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

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **UI组件**: 自定义组件
- **图标**: Lucide React
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

### 开发环境运行

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看前台页面。
访问 [http://localhost:3000/admin](http://localhost:3000/admin) 进入后台管理（默认用户名：admin，密码：password）。

### 生产环境构建

```bash
npm run build
npm start
# 或
yarn build
yarn start
# 或
pnpm build
pnpm start
```

## 项目结构

```
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

## 后台管理功能说明

### 登录
- 访问 `/admin` 路径输入用户名和密码登录

### 文章管理
- 左侧导航显示所有文章列表
- 支持搜索文章
- 点击文章进入编辑页面
- 可以新建、编辑、删除文章
- 支持文章发布/草稿状态切换

### 标签管理
- 可以添加、编辑、删除标签
- 显示每个标签关联的文章数量

## 自定义配置

- 修改 `src/lib/utils.ts` 中的工具函数
- 编辑 `src/app/layout.tsx` 调整全局布局和元数据

## 许可

该项目采用 MIT 许可证。
