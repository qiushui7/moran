"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  LoaderIcon
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 文章类型定义
type Tag = {
  id: string;
  name: string;
  slug: string;
};

type Post = {
  id: string;
  title: string;
  excerpt?: string;
  published: boolean;
  createdAt: string;
  tags: Tag[];
};

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const postsPerPage = 10;
  
  // 加载文章数据
  useEffect(() => {
    fetchPosts();
  }, []);
  
  // 获取所有文章
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) {
        throw new Error('获取文章失败');
      }
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('获取文章失败:', error);
      toast.error('获取文章失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 根据搜索词过滤文章
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // 分页
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  
  // 打开删除对话框
  const openDeleteDialog = (id: string) => {
    setPostToDelete(id);
    setShowDeleteDialog(true);
  };
  
  // 删除文章
  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      const res = await fetch(`/api/posts/${postToDelete}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '删除文章失败');
      }
      
      setPosts(posts.filter(post => post.id !== postToDelete));
      setShowDeleteDialog(false);
      
      toast.success("文章已删除", {
        description: "文章已成功删除"
      });
    } catch (error) {
      console.error('删除文章失败:', error);
      toast.error('删除文章失败');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }
  
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
      
      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangleIcon className="h-5 w-5" />
              确认删除文章
            </DialogTitle>
            <DialogDescription>
              此操作将永久删除该文章，删除后将无法恢复。确定要继续吗？
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent"
            >
              取消
            </button>
            <button
              onClick={handleDeletePost}
              className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              确认删除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
                          key={tag.id}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {tag.name}
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
                        onClick={() => openDeleteDialog(post.id)}
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