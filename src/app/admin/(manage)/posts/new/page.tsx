"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  SaveIcon,
  ArrowLeftIcon,
  TagIcon
} from "lucide-react";

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

// 生成友好的URL别名
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export default function NewPost() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [error, setError] = useState("");
  
  // 新文章状态
  const [post, setPost] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "# 新文章标题\n\n## 小标题\n\n文章内容...",
    published: false,
    tags: [] as string[]
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setPost({
      ...post,
      title,
      slug: post.slug || generateSlug(title) // 如果slug为空，则根据标题自动生成
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPost({
      ...post,
      [name]: value
    });
  };

  const toggleTag = (tagName: string) => {
    if (post.tags.includes(tagName)) {
      setPost({
        ...post,
        tags: post.tags.filter(t => t !== tagName)
      });
    } else {
      setPost({
        ...post,
        tags: [...post.tags, tagName]
      });
    }
  };

  const handleSave = () => {
    // 验证表单
    if (!post.title.trim()) {
      setError("文章标题不能为空");
      return;
    }
    
    if (!post.slug.trim()) {
      setError("URL别名不能为空");
      return;
    }
    
    setIsSaving(true);
    setError("");
    
    // 模拟保存请求
    setTimeout(() => {
      // 在实际应用中，这里会发送API请求保存数据
      setIsSaving(false);
      // 显示成功消息
      alert("文章创建成功！");
      // 假设发布成功，重定向到编辑页面
      // 这里使用一个假的ID，实际中应该使用后端返回的ID
      router.push("/admin/tags");
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">创建新文章</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={isSaving}
          >
            <SaveIcon className="mr-2 h-4 w-4" />
            {post.published ? "发布文章" : "保存为草稿"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
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
            name="title"
            type="text"
            value={post.title}
            onChange={handleTitleChange}
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
            name="slug"
            type="text"
            value={post.slug}
            onChange={handleInputChange}
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
            name="excerpt"
            rows={2}
            value={post.excerpt}
            onChange={handleInputChange}
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

          {post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
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
                      checked={post.tags.includes(tag.name)}
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
            name="content"
            rows={15}
            value={post.content}
            onChange={handleInputChange}
            className="w-full rounded-md border border-input px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="使用 Markdown 格式编写文章内容"
          />
        </div>

        {/* 发布设置 */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="publish"
            checked={post.published}
            onChange={() => setPost({ ...post, published: !post.published })}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="publish" className="text-sm font-medium">
            创建后立即发布
          </label>
        </div>
      </div>
    </div>
  );
} 