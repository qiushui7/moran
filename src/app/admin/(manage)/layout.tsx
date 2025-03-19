"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  TagIcon, 
  LogOutIcon,
  SearchIcon,
  PlusIcon,
  FileTextIcon,
  LoaderIcon
} from "lucide-react";

// 类型定义
type Tag = {
  id: string;
  name: string;
  slug: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  tags: Tag[];
};

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString);
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  
  // 检查登录状态
  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in") === "true";
    setIsLoggedIn(loggedIn);
  }, []);
  
  // 获取文章列表和标签列表
  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
      fetchTags();
    }
  }, [isLoggedIn]);
  
  // 添加事件监听，以便在文章更新后刷新列表
  useEffect(() => {
    if (!isLoggedIn) return;
    
    // 刷新文章列表事件处理函数
    const handleRefreshPosts = (e: CustomEvent) => {
      console.log('刷新文章列表事件触发');
      fetchPosts();
      
      // 如果事件中包含文章ID，则选中该文章
      if (e.detail?.postId) {
        setSelectedPostId(e.detail.postId);
      }
    };
    
    // 添加事件监听
    window.addEventListener('refreshPostsList', handleRefreshPosts as EventListener);
    
    // 清理函数
    return () => {
      window.removeEventListener('refreshPostsList', handleRefreshPosts as EventListener);
    };
  }, [isLoggedIn]);
  
  // 添加事件监听，以便在标签更新后刷新标签列表
  useEffect(() => {
    if (!isLoggedIn) return;
    
    // 刷新标签列表事件处理函数
    const handleRefreshTags = () => {
      console.log('刷新标签列表事件触发');
      fetchTags();
    };
    
    // 添加事件监听
    window.addEventListener('refreshTagsList', handleRefreshTags as EventListener);
    
    // 清理函数
    return () => {
      window.removeEventListener('refreshTagsList', handleRefreshTags as EventListener);
    };
  }, [isLoggedIn]);
  
  // 从API获取文章
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      let url = '/api/posts';
      // 如果有选中的标签，添加标签过滤
      if (selectedTagId) {
        url += `?tagId=${selectedTagId}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('获取文章失败');
      }
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 获取所有标签
  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      if (!res.ok) {
        throw new Error('获取标签失败');
      }
      const data = await res.json();
      setTags(data);
    } catch (error) {
      console.error('获取标签失败:', error);
    }
  };

  // 处理标签选择
  const handleTagSelect = (tagId: string | null) => {
    setSelectedTagId(tagId);
    setIsLoading(true);
    // 重置当前选择的文章
    setSelectedPostId(null);
  };
  
  // 当标签选择变化时重新获取文章
  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
    }
  }, [selectedTagId, isLoggedIn]);

  // 过滤后的文章
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <div className="flex flex-1">
        {/* 左侧导航 - 包含文章列表 */}
        <aside className="flex-shrink-0 border-r bg-muted/30 w-[280px] md:w-[320px] h-screen fixed">
          <div className="flex h-full flex-col">
            <header className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-lg font-bold">
                  墨韵
                </Link>
              </div>
            </header>
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
            
            {/* 标签筛选 */}
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleTagSelect(null)}
                  className={`text-xs px-2 py-1 rounded-md transition-colors ${
                    selectedTagId === null 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  全部
                </button>
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagSelect(tag.id)}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${
                      selectedTagId === tag.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
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
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <LoaderIcon className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
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
                                {post.tags[0].name}{post.tags.length > 1 ? ` +${post.tags.length - 1}` : ''}
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
              )}
            </div>

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
        <main className="flex-1 overflow-auto p-6 ml-[280px] md:ml-[320px]">
          {children}
        </main>
      </div>
    </div>
  );
} 