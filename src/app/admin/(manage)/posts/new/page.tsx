"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  SaveIcon, 
  EyeIcon, 
  ArrowLeftIcon,
  LoaderIcon
} from "lucide-react";
import { toast } from "sonner";

// 类型定义
type Tag = {
  id: string;
  name: string;
  slug: string;
};

export default function NewPost() {
  const router = useRouter();
  const [post, setPost] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    published: false
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 获取所有标签
  useEffect(() => {
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
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTags();
  }, []);

  // 根据标题自动生成别名
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[\s]+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  // 标题变化时自动生成别名
  const handleTitleChange = (title: string) => {
    setPost({
      ...post,
      title,
      slug: post.slug || generateSlug(title)
    });
  };

  // 切换标签选择
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // 保存文章
  const handleSave = async (publish: boolean = false) => {
    // 验证必填字段
    if (!post.title) {
      setError("标题不能为空");
      return;
    }
    
    if (!post.slug) {
      setError("URL别名不能为空");
      return;
    }
    
    if (!post.content) {
      setError("内容不能为空");
      return;
    }
    
    setIsSaving(true);
    setError("");
    
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...post,
          published: publish,
          tags: selectedTags
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '创建文章失败');
      }
      
      const newPost = await res.json();
      
      toast.success(publish ? "文章已发布" : "文章已保存为草稿");
      
      // 跳转到编辑页面
      router.push(`/admin/posts/edit/${newPost.id}`);
    } catch (error: any) {
      console.error("创建文章失败:", error);
      setError(error.message || "创建文章失败");
      setIsSaving(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">新建文章</h2>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin/posts")}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            返回列表
          </button>
          <button
            onClick={() => handleSave(true)}
            className="inline-flex items-center rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
            disabled={isSaving}
          >
            <EyeIcon className="mr-2 h-4 w-4" />
            直接发布
          </button>
          <button
            onClick={() => handleSave(false)}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={isSaving}
          >
            <SaveIcon className="mr-2 h-4 w-4" />
            保存为草稿
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

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
            onChange={(e) => handleTitleChange(e.target.value)}
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
      </div>
    </div>
  );
} 