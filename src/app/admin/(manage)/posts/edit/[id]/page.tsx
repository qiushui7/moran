"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  SaveIcon,
  EyeIcon,
  ArrowLeftIcon,
  TagIcon,
  TrashIcon,
  AlertTriangleIcon,
  LoaderIcon
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

// 格式化日期时间
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
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
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 获取文章数据
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            setError("未找到文章");
            return;
          }
          throw new Error('获取文章失败');
        }
        
        const data = await res.json();
        setPost(data);
        setSelectedTags(data.tags.map((tag: Tag) => tag.id));
      } catch (error) {
        console.error("获取文章失败:", error);
        setError("加载失败");
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchTags = async () => {
      try {
        const res = await fetch('/api/tags');
        if (!res.ok) {
          throw new Error('获取标签失败');
        }
        const data = await res.json();
        setAvailableTags(data);
      } catch (error) {
        console.error('获取标签失败:', error);
        toast.error('获取标签失败');
      }
    };
    
    fetchPost();
    fetchTags();
  }, [postId]);

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
        description: "所有更改已成功保存",
      });
    } catch (error) {
      console.error("保存文章失败:", error);
      toast.error("保存文章失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 切换发布状态
  const handlePublishToggle = async () => {
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
      toast.error("更新发布状态失败");
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
      toast.error("删除文章失败");
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

  if (error || !post) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive">{error || "加载失败"}</h3>
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
            disabled={isSaving}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            删除文章
          </button>
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
            value={post.excerpt || ""}
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