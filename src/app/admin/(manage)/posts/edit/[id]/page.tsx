"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  SaveIcon,
  ArrowLeftIcon,
  TrashIcon,
  AlertTriangleIcon,
  LoaderIcon,
  MaximizeIcon,
  EyeOffIcon,
  RocketIcon
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";

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
  content: string;
  excerpt?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
};

// 参数类型
type PageParams = {
  id: string;
};

function formatContentPreview(content: string): string {
  // 简单转换Markdown为HTML预览
  // 这里使用一个非常简单的方法，实际项目中应使用专业的Markdown解析库
  let html = content
    // 转义HTML标签
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 处理标题
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    // 处理加粗和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 处理列表
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    // 处理链接
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    // 处理换行
    .replace(/\n/g, '<br />');
  
  return html;
}

export default function EditPost({ params }: { params: Promise<PageParams> }) {
  // 使用React.use()解包params
  // 注意: 根据Next.js的说明，在未来版本中，对params直接访问将不再支持
  // 必须使用React.use()来解包Promise以获取params值
  const unwrappedParams = use(params);
  const postId = unwrappedParams.id;
  
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 获取文章数据
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          toast.error("获取文章失败", {
            description: "无法加载文章内容"
          });
          return;
        }
        const data = await response.json();
        setPost(data);
        setSelectedTags(data.tags ? data.tags.map((tag: { id: string }) => tag.id) : []);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("获取文章失败", {
          description: "发生错误，请稍后重试"
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) {
          console.error("Failed to fetch tags");
          return;
        }
        const data = await response.json();
        setAvailableTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchPost();
    fetchTags();
  }, [params]);

  // 保存文章
  const handleSave = async () => {
    if (!post) return;
    
    setIsSaving(true);
    
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          published: post.published,
          tags: selectedTags
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        toast.error("保存文章失败", {
          description: data.error || "请稍后重试"
        });
        throw new Error(data.error || '保存文章失败');
      }
      
      const updatedPost = await res.json();
      setPost(updatedPost);
      
      // 触发自定义事件，通知布局组件刷新文章列表
      const refreshEvent = new CustomEvent('refreshPostsList', {
        detail: { postId: post.id }
      });
      window.dispatchEvent(refreshEvent);
      
      // 显示保存成功提示
      toast.success("文章已保存", {
        description: "标签和发布状态已更新",
      });
    } catch (error) {
      console.error("保存文章失败:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // 切换发布状态
  const handleTogglePublished = async () => {
    if (!post) return;
    
    setIsSaving(true);
    
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...post,
          published: !post.published,
          tags: selectedTags
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        toast.error("更新发布状态失败", {
          description: data.error || "请稍后重试"
        });
        throw new Error(data.error || '更新发布状态失败');
      }
      
      const updatedPost = await res.json();
      setPost(updatedPost);
      
      // 触发自定义事件，通知布局组件刷新文章列表
      const refreshEvent = new CustomEvent('refreshPostsList', {
        detail: { postId: post.id }
      });
      window.dispatchEvent(refreshEvent);
      
      // 显示操作成功提示
      if (post.published) {
        toast.info("已转为草稿", {
          description: "文章已设置为草稿状态",
        });
      } else {
        toast.success("文章已发布", {
          description: "文章已成功发布",
        });
      }
    } catch (error) {
      console.error("更新发布状态失败:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // 删除文章
  const handleDelete = async () => {
    if (!post) return;
    
    setShowDeleteDialog(false);
    setIsSaving(true);
    
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        toast.error("删除文章失败", {
          description: data.error || "请稍后重试"
        });
        throw new Error(data.error || '删除文章失败');
      }
      
      // 触发自定义事件，通知布局组件刷新文章列表
      const refreshEvent = new CustomEvent('refreshPostsList');
      window.dispatchEvent(refreshEvent);
      
      toast.success("文章已成功删除");
      // 删除后返回文章列表
      router.push("/admin/posts");
    } catch (error) {
      console.error("删除文章失败:", error);
      setIsSaving(false);
    }
  };

  // 切换标签选择
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // 保存URL别名
  const saveSlug = async () => {
    if (!post) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          published: post.published,
          tags: selectedTags
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        toast.error("保存URL别名失败", {
          description: data.error || "请稍后重试"
        });
        throw new Error(data.error || '保存URL别名失败');
      }
      
      const updatedPost = await res.json();
      setPost(updatedPost);
      
      toast.success("URL别名已更新");
    } catch (error) {
      console.error("保存URL别名失败:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理URL别名变更
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (post) {
      setPost({
        ...post,
        slug: e.target.value
      });
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 显示错误界面
  if (!post) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive">文章不存在或已被删除</h3>
          <button 
            onClick={() => router.push("/admin/posts")}
            className="mt-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            返回文章列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">编辑文章</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push("/admin/posts")}
            className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            返回列表
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="ml-auto inline-flex items-center rounded-md border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            删除文章
          </button>
          <button
            onClick={handleTogglePublished}
            className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              post.published
                ? "border border-amber-600 bg-white text-amber-600 hover:bg-amber-50"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {post.published ? (
              <>
                <EyeOffIcon className="mr-2 h-4 w-4" />
                转为草稿
              </>
            ) : (
              <>
                <RocketIcon className="mr-2 h-4 w-4" />
                发布文章
              </>
            )}
          </button>
          <button
            onClick={() => {
              router.push(`/admin/posts/editor/${post.id}`);
            }}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <MaximizeIcon className="mr-2 h-4 w-4" />
            沉浸式编辑
          </button>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangleIcon className="h-5 w-5" />
              确认删除
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
              onClick={handleDelete}
              className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 ml-4"
            >
              确认删除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            readOnly
            className="w-full rounded-md border border-input bg-muted px-3 py-2 text-base ring-offset-background cursor-not-allowed"
          />
        </div>

        {/* 摘要 */}
        <div className="space-y-2">
          <label htmlFor="excerpt" className="text-sm font-medium">
            摘要
          </label>
          <textarea
            id="excerpt"
            rows={2}
            value={post.excerpt || ""}
            readOnly
            className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background cursor-not-allowed"
          />
        </div>

        {/* 标签 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">标签</label>
            <button
              type="button"
              onClick={() => {
                if (showTagSelector) {
                  // 关闭选择器时自动保存
                  handleSave();
                }
                setShowTagSelector(!showTagSelector);
              }}
              className="inline-flex items-center text-xs text-primary hover:underline"
            >
              {showTagSelector ? "完成选择" : "选择标签"}
            </button>
          </div>

          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedTags.map((tagId) => {
                const tag = availableTags.find(t => t.id === tagId);
                return tag ? (
                  <span
                    key={tag.id}
                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {tag.name}
                  </span>
                ) : null;
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">未选择标签</p>
          )}

          {showTagSelector && (
            <div className="mt-3 max-h-40 overflow-y-auto rounded-md border p-2">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {availableTags.map((tag) => (
                  <div key={tag.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`tag-${tag.id}`}
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
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

        {/* 别名/Slug */}
        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">
            URL 别名
          </label>
          <div className="flex space-x-2">
            <input
              id="slug"
              type="text"
              value={post.slug}
              onChange={handleSlugChange}
              className="w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="url-friendly-name"
            />
            <button
              onClick={saveSlug}
              className="inline-flex items-center rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              disabled={isSaving}
            >
              <SaveIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            用于 URL 的短名称，只允许字母、数字和连字符
          </p>
        </div>

        {/* 内容 */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            文章内容
            <span className="text-xs text-muted-foreground ml-2">
              支持Markdown和富文本格式，在沉浸式编辑器中编辑
            </span>
          </label>
          <div className="w-full rounded-md border border-input p-6 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-3">
              文章内容仅在沉浸式编辑模式中可编辑
            </p>
            <button
              onClick={() => {
                router.push(`/admin/posts/editor/${post.id}`);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <MaximizeIcon className="h-5 w-5" />
              进入沉浸式编辑模式
            </button>
          </div>
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