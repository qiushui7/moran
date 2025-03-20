import Link from "next/link";

export const metadata = {
  title: "关于 - 墨染",
  description: "了解关于作者的更多信息",
};

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">关于</h1>
        <p className="text-muted-foreground mt-2">关于墨染</p>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <p>
          墨染是一个基于Next.js构建的个人博客网站，设计风格简约而现代。该博客采用了极简主义的设计理念，注重内容的展示和阅读体验。
        </p>
        
        <h2>技术栈</h2>
        <ul>
          <li>Next.js - React框架</li>
          <li>Prisma - 数据库ORM</li>
          <li>PostgreSQL - 数据库</li>
          <li>Tailwind CSS - 样式框架</li>
          <li>shadcn/ui - UI组件库</li>
        </ul>

        <h2>功能特点</h2>
        <ul>
          <li>响应式设计，适配各种设备</li>
          <li>明/暗模式切换</li>
          <li>支持按标签分类查看文章</li>
          <li>SEO友好</li>
          <li>性能优化</li>
        </ul>

        <h2>联系方式</h2>
        <p>
          如果您有任何问题或建议，欢迎通过以下方式联系我：
        </p>
        <ul>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:contact@example.com">contact@example.com</a>
          </li>
          <li>
            <strong>GitHub:</strong>{" "}
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/yourusername
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
} 