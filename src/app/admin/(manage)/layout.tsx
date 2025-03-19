"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  TagIcon, 
  LogOutIcon,
  SearchIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon
} from "lucide-react";

// 模拟文章数据
const MOCK_POSTS = [
  {
    id: "1",
    title: "Next.js 13 新特性介绍",
    slug: "nextjs-13-features",
    published: true,
    createdAt: new Date("2023-04-15"),
    tags: ["Next.js", "React", "Web开发"]
  },
  {
    id: "2",
    title: "使用 Tailwind CSS 构建响应式界面",
    slug: "responsive-ui-with-tailwindcss",
    published: true,
    createdAt: new Date("2023-05-22"),
    tags: ["CSS", "Tailwind", "响应式设计"]
  },
  {
    id: "3",
    title: "TypeScript 高级类型体操",
    slug: "advanced-typescript-types",
    published: false,
    createdAt: new Date("2023-06-10"),
    tags: ["TypeScript", "JavaScript"]
  },
  {
    id: "4",
    title: "React 状态管理方案对比",
    slug: "react-state-management-comparison",
    published: true,
    createdAt: new Date("2023-07-05"),
    tags: ["React", "状态管理", "Redux", "Zustand"]
  },
  {
    id: "5",
    title: "Next.js API 路由实践",
    slug: "nextjs-api-routes-in-practice",
    published: true,
    createdAt: new Date("2023-08-12"),
    tags: ["Next.js", "API", "后端"]
  },
];

// 格式化日期
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const postsPerPage = 5;

  // 检查登录状态
  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  // 过滤后的文章
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // 分页
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    setIsLoggedIn(false);
  };

  // 如果未登录，仅显示子组件
  if (!isLoggedIn) {
    return <>{children}</>;
  }

  // 计算是否在编辑或创建文章页面
  const isEditOrCreatePage = pathname?.includes('/admin/posts/edit') || pathname?.includes('/admin/posts/new');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-lg font-bold">
            墨韵
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* 左侧导航 - 包含文章列表 */}
        <aside className="flex-shrink-0 border-r bg-muted/30 w-[280px] md:w-[320px]">
          <div className="flex h-full flex-col">
            <div className="p-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索文章..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-input pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-4 pb-2">
              <h3 className="text-sm font-medium">文章列表</h3>
              <Link
                href="/admin/posts/new"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="sr-only">新建文章</span>
              </Link>
            </div>

            <div className="flex-1 overflow-auto px-2">
              <div className="space-y-1">
                {currentPosts.length > 0 ? (
                  currentPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/admin/posts/edit/${post.id}`}
                      className={`flex items-start gap-2 rounded-md p-2 text-sm ${
                        selectedPostId === post.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => setSelectedPostId(post.id)}
                    >
                      <FileTextIcon className={`h-4 w-4 mt-0.5 ${post.published ? 'text-green-600' : 'text-amber-500'}`} />
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium line-clamp-1">{post.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(post.createdAt)}</span>
                          {post.tags.length > 0 && (
                            <span className="truncate">
                              {post.tags[0]}{post.tags.length > 1 ? ` +${post.tags.length - 1}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    {searchTerm ? "没有找到匹配的文章" : "还没有文章"}
                  </div>
                )}
              </div>
            </div>

            {/* 分页控制 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t p-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-50 hover:bg-accent"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  第 {currentPage} / {totalPages} 页
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-50 hover:bg-accent"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* 导航菜单 */}
            <nav className="px-2 py-4 border-t">
              <Link
                href="/admin/tags"
                className={`flex items-center gap-2 rounded-md p-2 text-sm ${
                  pathname === "/admin/tags" ? "bg-primary/10 text-primary" : "hover:bg-accent"
                }`}
              >
                <TagIcon className="h-4 w-4" />
                <span>标签管理</span>
              </Link>
            </nav>

            {/* 登出按钮 */}
            <div className="border-t p-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent"
              >
                <LogOutIcon className="h-4 w-4" />
                <span>登出</span>
              </button>
            </div>
          </div>
        </aside>

        {/* 右侧内容区域 */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 