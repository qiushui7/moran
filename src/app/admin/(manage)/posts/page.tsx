"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// 模拟文章数据
const MOCK_POSTS = [
  {
    id: "1",
    title: "Next.js 13 新特性介绍",
    excerpt: "探索 Next.js 13 的新特性和改进，包括 App Router、Server Components 等",
    published: true,
    createdAt: new Date("2023-04-15"),
    tags: ["Next.js", "React", "Web开发"]
  },
  {
    id: "2",
    title: "使用 Tailwind CSS 构建响应式界面",
    excerpt: "学习如何使用 Tailwind CSS 高效构建美观且响应式的用户界面",
    published: true,
    createdAt: new Date("2023-05-22"),
    tags: ["CSS", "Tailwind", "响应式设计"]
  },
  {
    id: "3",
    title: "TypeScript 高级类型体操",
    excerpt: "深入探讨 TypeScript 的高级类型系统，及其在大型项目中的应用",
    published: false,
    createdAt: new Date("2023-06-10"),
    tags: ["TypeScript", "JavaScript"]
  },
];

export default function PostsManagement() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  
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
  
  // 删除文章（模拟）
  const handleDelete = (id: string) => {
    if (confirm("确定要删除这篇文章吗？此操作不可撤销。")) {
      setPosts(posts.filter(post => post.id !== id));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">文章列表</h2>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          新建文章
        </Link>
      </div>
      
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索文章标题或标签..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-input pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">标题</th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium sm:table-cell">标签</th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium md:table-cell">创建日期</th>
              <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
              <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.length > 0 ? (
              currentPosts.map((post) => (
                <tr key={post.id} className="border-b">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium">{post.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-1 md:hidden">
                      {formatDate(post.createdAt)}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.published
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {post.published ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/admin/posts/edit/${post.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-accent"
                      >
                        <EditIcon className="h-4 w-4" />
                        <span className="sr-only">编辑</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input text-destructive hover:bg-destructive/10"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">删除</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {searchTerm ? "没有找到匹配的文章" : "还没有文章，点击\"新建文章\"创建第一篇吧！"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            显示 {indexOfFirstPost + 1}-{Math.min(indexOfLastPost, filteredPosts.length)} 篇，共 {filteredPosts.length} 篇
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input disabled:opacity-50"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 