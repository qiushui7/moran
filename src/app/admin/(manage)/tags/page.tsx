"use client";

import { useState } from "react";
import { 
  PlusIcon, 
  XIcon, 
  SaveIcon, 
  EditIcon, 
  TrashIcon
} from "lucide-react";

// 模拟标签数据
const MOCK_TAGS = [
  { id: "1", name: "Next.js", slug: "nextjs", count: 8 },
  { id: "2", name: "React", slug: "react", count: 12 },
  { id: "3", name: "TypeScript", slug: "typescript", count: 5 },
  { id: "4", name: "Tailwind CSS", slug: "tailwind-css", count: 7 },
  { id: "5", name: "JavaScript", slug: "javascript", count: 15 },
];

export default function TagsManagement() {
  const [tags, setTags] = useState(MOCK_TAGS);
  const [newTag, setNewTag] = useState({ name: "", slug: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", slug: "" });
  const [error, setError] = useState("");

  // 添加新标签
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newTag.name || !newTag.slug) {
      setError("标签名称和别名不能为空");
      return;
    }

    if (tags.some(tag => tag.slug === newTag.slug)) {
      setError("标签别名已存在");
      return;
    }

    const newId = (Math.max(...tags.map(tag => parseInt(tag.id))) + 1).toString();
    
    setTags([...tags, { ...newTag, id: newId, count: 0 }]);
    setNewTag({ name: "", slug: "" });
  };

  // 删除标签
  const handleDeleteTag = (id: string) => {
    if (confirm("确定要删除这个标签吗？相关联的文章将会失去此标签。")) {
      setTags(tags.filter(tag => tag.id !== id));
    }
  };

  // 开始编辑标签
  const handleStartEdit = (tag: typeof MOCK_TAGS[0]) => {
    setEditingId(tag.id);
    setEditForm({ name: tag.name, slug: tag.slug });
    setError("");
  };

  // 保存编辑
  const handleSaveEdit = (id: string) => {
    setError("");

    if (!editForm.name || !editForm.slug) {
      setError("标签名称和别名不能为空");
      return;
    }

    if (tags.some(tag => tag.slug === editForm.slug && tag.id !== id)) {
      setError("标签别名已存在");
      return;
    }

    setTags(
      tags.map(tag => 
        tag.id === id ? { ...tag, name: editForm.name, slug: editForm.slug } : tag
      )
    );
    setEditingId(null);
  };

  // 自动生成别名（slug）
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">标签管理</h2>

      {/* 添加新标签表单 */}
      <div className="rounded-md border p-4">
        <h3 className="mb-4 text-lg font-medium">添加新标签</h3>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAddTag} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="tag-name" className="text-sm font-medium">
                标签名称
              </label>
              <input
                id="tag-name"
                type="text"
                value={newTag.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setNewTag({
                    name,
                    slug: newTag.slug || generateSlug(name),
                  });
                }}
                className="w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="标签名称"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="tag-slug" className="text-sm font-medium">
                标签别名
              </label>
              <input
                id="tag-slug"
                type="text"
                value={newTag.slug}
                onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
                className="w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="url-friendly-name"
              />
              <p className="text-xs text-muted-foreground">
                用于 URL 的短名称，只允许字母、数字和连字符
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              添加标签
            </button>
          </div>
        </form>
      </div>

      {/* 标签列表 */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">标签名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium">别名</th>
              <th className="px-4 py-3 text-left text-sm font-medium">文章数</th>
              <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-b">
                <td className="px-4 py-3 text-sm">
                  {editingId === tag.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => 
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full rounded-md border border-input px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  ) : (
                    tag.name
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === tag.id ? (
                    <input
                      type="text"
                      value={editForm.slug}
                      onChange={(e) => 
                        setEditForm({ ...editForm, slug: e.target.value })
                      }
                      className="w-full rounded-md border border-input px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  ) : (
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      {tag.slug}
                    </code>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {tag.count}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end space-x-2">
                    {editingId === tag.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(tag.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input text-green-600 hover:bg-green-50"
                        >
                          <SaveIcon className="h-4 w-4" />
                          <span className="sr-only">保存</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-accent"
                        >
                          <XIcon className="h-4 w-4" />
                          <span className="sr-only">取消</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(tag)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-accent"
                        >
                          <EditIcon className="h-4 w-4" />
                          <span className="sr-only">编辑</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input text-destructive hover:bg-destructive/10"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">删除</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 