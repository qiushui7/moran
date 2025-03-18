# 秋水博客

一个使用Next.js、Prisma、Tailwind CSS和PostgreSQL构建的极简风格个人博客。

## 技术栈

- [Next.js 15](https://nextjs.org/) - React框架
- [Prisma](https://www.prisma.io/) - TypeScript ORM
- [PostgreSQL](https://www.postgresql.org/) - 数据库
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [shadcn/ui](https://ui.shadcn.com/) - UI组件库
- [TypeScript](https://www.typescriptlang.org/) - 类型系统

## 功能特点

- 响应式设计
- 明/暗模式切换
- 文章标签分类
- SEO友好
- 极简风格界面

## 本地开发

1. 克隆仓库:

```bash
git clone https://github.com/yourusername/qiushui-blog.git
cd qiushui-blog
```

2. 安装依赖:

```bash
npm install
```

3. 设置环境变量:

复制`.env.example`文件为`.env`并配置你的PostgreSQL数据库连接:

```bash
cp .env.example .env
```

4. 创建数据库表并填充示例数据:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

5. 启动开发服务器:

```bash
npm run dev
```

然后在浏览器中访问 [http://localhost:3000](http://localhost:3000)。

## 部署

该项目可以轻松部署到Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fqiushui-blog)

## 许可证

MIT
