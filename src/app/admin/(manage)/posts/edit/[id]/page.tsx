"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  SaveIcon,
  EyeIcon,
  ArrowLeftIcon,
  TagIcon
} from "lucide-react";

// 模拟文章详情
const MOCK_POSTS = [
  {
    id: "1",
    title: "Next.js 13 新特性介绍",
    slug: "nextjs-13-features",
    content: "# Next.js 13 新特性介绍\n\nNext.js 13 带来了许多令人兴奋的新特性，包括 App Router、React Server Components 等。本文将深入探讨这些新特性及其应用。\n\n## App Router\n\nApp Router 是 Next.js 13 的重要更新之一，它改变了我们构建页面和路由的方式。\n\n## React Server Components\n\nServer Components 允许我们在服务器端渲染组件，这大大提高了应用性能并简化了数据获取。",
    excerpt: "探索 Next.js 13 的新特性和改进，包括 App Router、Server Components 等",
    published: true,
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-04-20"),
    tags: ["Next.js", "React", "Web开发"]
  },
  {
    id: "2",
    title: "使用 Tailwind CSS 构建响应式界面",
    slug: "responsive-ui-with-tailwindcss",
    content: "# 使用 Tailwind CSS 构建响应式界面\n\nTailwind CSS 作为一个功能性优先的 CSS 框架，为开发者提供了高效构建响应式界面的工具。\n\n## Tailwind 的优势\n\n- 无需编写自定义 CSS\n- 响应式设计变得轻而易举\n- 主题定制非常灵活\n\n## 实例展示\n\n让我们通过一些实例来看看如何使用 Tailwind CSS 构建美观且响应式的用户界面。",
    excerpt: "学习如何使用 Tailwind CSS 高效构建美观且响应式的用户界面",
    published: true,
    createdAt: new Date("2023-05-22"),
    updatedAt: new Date("2023-05-25"),
    tags: ["CSS", "Tailwind", "响应式设计"]
  },
  {
    id: "3",
    title: "TypeScript 高级类型体操",
    slug: "advanced-typescript-types",
    content: "# TypeScript 高级类型体操\n\nTypeScript 的类型系统非常强大，本文将探讨一些高级类型技巧，帮助你更好地理解类型编程。\n\n## 条件类型\n\n条件类型允许我们基于条件表达式来选择类型。\n\n```typescript\ntype Check<T> = T extends string ? 'is string' : 'not string';\n```\n\n## 映射类型\n\n映射类型让我们能够从现有类型创建新类型。\n\n```typescript\ntype Readonly<T> = { readonly [P in keyof T]: T[P] };\n```",
    excerpt: "深入探讨 TypeScript 的高级类型系统，及其在大型项目中的应用",
    published: false,
    createdAt: new Date("2023-06-10"),
    updatedAt: new Date("2023-06-15"),
    tags: ["TypeScript", "JavaScript"]
  },
  {
    id: "4",
    title: "React 状态管理方案对比",
    slug: "react-state-management-comparison",
    content: "# React 状态管理方案对比\n\n在 React 生态系统中，有多种状态管理解决方案。本文将对比几种流行的状态管理库。\n\n## Redux\n\nRedux 是最成熟的状态管理库之一，提供了可预测的状态容器。\n\n## Zustand\n\nZustand 是一个小型、快速且可扩展的状态管理解决方案，它的 API 简单直观。\n\n## Jotai\n\nJotai 采用原子化的方法来管理状态，这使得状态管理更加灵活。",
    excerpt: "比较 Redux、Zustand、Jotai 等 React 状态管理库的优缺点和适用场景",
    published: true,
    createdAt: new Date("2023-07-05"),
    updatedAt: new Date("2023-07-10"),
    tags: ["React", "状态管理", "Redux", "Zustand"]
  },
  {
    id: "5",
    title: "Next.js API 路由实践",
    slug: "nextjs-api-routes-in-practice",
    content: "# Next.js API 路由实践\n\nNext.js 的 API 路由功能让我们能够在同一项目中构建前端和 API 端点。\n\n## API 路由基础\n\nAPI 路由文件位于 `pages/api` 或 `app/api` 目录中，每个文件都成为一个端点。\n\n## 处理请求\n\n```javascript\nexport async function GET(request) {\n  return Response.json({ message: 'Hello, world!' })\n}\n```\n\n## 连接数据库\n\nAPI 路由可以轻松连接到数据库，处理认证，并执行服务器端操作。",
    excerpt: "探索 Next.js API 路由的实际应用，包括数据获取、认证和第三方 API 集成",
    published: true,
    createdAt: new Date("2023-08-12"),
    updatedAt: new Date("2023-08-15"),
    tags: ["Next.js", "API", "后端"]
  },
];

// 获取所有可用的标签
const AVAILABLE_TAGS = [
  { id: "1", name: "Next.js", slug: "nextjs" },
  { id: "2", name: "React", slug: "react" },
  { id: "3", name: "TypeScript", slug: "typescript" },
  { id: "4", name: "JavaScript", slug: "javascript" },
  { id: "5", name: "Tailwind", slug: "tailwind" },
  { id: "6", name: "CSS", slug: "css" },
  { id: "7", name: "响应式设计", slug: "responsive-design" },
  { id: "8", name: "Web开发", slug: "web-development" },
  { id: "9", name: "状态管理", slug: "state-management" },
  { id: "10", name: "Redux", slug: "redux" },
  { id: "11", name: "Zustand", slug: "zustand" },
  { id: "12", name: "API", slug: "api" },
  { id: "13", name: "后端", slug: "backend" },
];

// 格式化日期时间
function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function EditPost({ params }: { params: { id: string } }) {
  const actualParams = use(params as unknown as Promise<{ id: string }>);
  const router = useRouter();
  const [post, setPost] = useState<typeof MOCK_POSTS[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 模拟获取文章数据
    const foundPost = MOCK_POSTS.find(p => p.id === actualParams.id);
    if (foundPost) {
      setPost(foundPost);
      setSelectedTags(foundPost.tags);
    } else {
      setError("未找到文章");
    }
    setIsLoading(false);
  }, [actualParams.id]);

  const handleSave = () => {
    if (!post) return;
    
    setIsSaving(true);
    // 模拟保存请求
    setTimeout(() => {
      setPost({
        ...post,
        tags: selectedTags,
        updatedAt: new Date()
      });
      setIsSaving(false);
      // 显示保存成功提示
      alert("文章已保存");
    }, 800);
  };

  const handlePublishToggle = () => {
    if (!post) return;
    
    setIsSaving(true);
    // 模拟发布状态切换
    setTimeout(() => {
      setPost({
        ...post,
        published: !post.published,
        updatedAt: new Date()
      });
      setIsSaving(false);
      // 显示操作成功提示
      alert(post.published ? "文章已转为草稿" : "文章已发布");
    }, 800);
  };

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive">{error || "加载失败"}</h3>
          <button 
            onClick={() => router.push("/admin/tags")}
            className="mt-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            返回管理页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">编辑文章</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePublishToggle}
            className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              post.published
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
            disabled={isSaving}
          >
            <EyeIcon className="mr-2 h-4 w-4" />
            {post.published ? "转为草稿" : "发布文章"}
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={isSaving}
          >
            <SaveIcon className="mr-2 h-4 w-4" />
            保存修改
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 标题 */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            文章标题
          </label>
          <input
            id="title"
            type="text"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            className="w-full rounded-md border border-input px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="输入文章标题"
          />
        </div>

        {/* 别名/Slug */}
        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">
            URL 别名
          </label>
          <input
            id="slug"
            type="text"
            value={post.slug}
            onChange={(e) => setPost({ ...post, slug: e.target.value })}
            className="w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="url-friendly-name"
          />
          <p className="text-xs text-muted-foreground">
            用于 URL 的短名称，只允许字母、数字和连字符
          </p>
        </div>

        {/* 摘要 */}
        <div className="space-y-2">
          <label htmlFor="excerpt" className="text-sm font-medium">
            摘要
          </label>
          <textarea
            id="excerpt"
            rows={2}
            value={post.excerpt}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
            className="w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="文章简短摘要，显示在列表中"
          />
        </div>

        {/* 标签 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">标签</label>
            <button
              type="button"
              onClick={() => setShowTagSelector(!showTagSelector)}
              className="inline-flex items-center text-xs text-primary hover:underline"
            >
              {showTagSelector ? "完成选择" : "选择标签"}
            </button>
          </div>

          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">未选择标签</p>
          )}

          {showTagSelector && (
            <div className="mt-3 max-h-40 overflow-y-auto rounded-md border p-2">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {AVAILABLE_TAGS.map((tag) => (
                  <div key={tag.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`tag-${tag.id}`}
                      checked={selectedTags.includes(tag.name)}
                      onChange={() => toggleTag(tag.name)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor={`tag-${tag.id}`}
                      className="ml-2 text-sm cursor-pointer"
                    >
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 内容 */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            文章内容 (Markdown)
          </label>
          <textarea
            id="content"
            rows={15}
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            className="w-full rounded-md border border-input px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="使用 Markdown 格式编写文章内容"
          />
        </div>

        {/* 文章元数据信息 */}
        <div className="text-sm text-muted-foreground">
          <div>创建时间: {formatDateTime(post.createdAt)}</div>
          {post.updatedAt && (
            <div>上次更新: {formatDateTime(post.updatedAt)}</div>
          )}
          <div>
            状态:{" "}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                post.published
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {post.published ? "已发布" : "草稿"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 