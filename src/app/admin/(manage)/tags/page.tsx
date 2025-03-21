"use client";

import { useState, useEffect } from "react";
import { 
  PlusIcon, 
  XIcon, 
  SaveIcon, 
  EditIcon, 
  TrashIcon,
  AlertTriangleIcon,
  LoaderIcon
} from "lucide-react";
import { toast } from "sonner";
import { APP_CONSTANTS } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 标签类型定义
type Tag = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

export default function TagsManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState({ name: "", slug: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", slug: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // 最大标签数量限制
  const MAX_TAGS_LIMIT = APP_CONSTANTS.MAX_TAGS_LIMIT;
  
  // 加载标签数据
  useEffect(() => {
    fetchTags();
  }, []);
  
  // 获取所有标签
  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tags');
      
      if (!res.ok) {
        const data = await res.json();
        console.error('获取标签失败:', data);
        
        if (data.error === "未授权访问" || data.error === "未授权访问：用户ID缺失") {
          toast.error("登录状态已过期，请重新登录");
        } else {
          toast.error(data.error || '获取标签失败');
        }
        
        return;
      }
      
      const data = await res.json();
      setTags(data);
    } catch (error) {
      console.error('获取标签失败:', error);
      toast.error('获取标签失败，请刷新页面重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 添加新标签
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newTag.name || !newTag.slug) {
      setError("标签名称和别名不能为空");
      return;
    }

    // 检查是否达到最大标签数限制
    if (tags.length >= MAX_TAGS_LIMIT) {
      setError(`已达到最大标签数限制 (${MAX_TAGS_LIMIT}个)`);
      return;
    }

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTag),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error('添加标签失败:', data);
        
        // 显示详细错误信息（如果有）
        const errorMsg = data.error || '添加标签失败';
        const detailsMsg = data.details ? `\n详细信息: ${data.details}` : '';
        setError(`${errorMsg}${detailsMsg}`);
        
        if (data.error === "未授权访问" || data.error === "未授权访问：用户ID缺失") {
          toast.error("登录状态已过期，请重新登录");
        }
        
        return;
      }
      
      // 添加新标签到列表
      setTags([...tags, { 
        id: data.id,
        name: data.name,
        slug: data.slug,
        count: 0 
      }]);
      setNewTag({ name: "", slug: "" });
      toast.success('标签创建成功');
      
      // 触发刷新标签列表事件
      const refreshTagsEvent = new CustomEvent('refreshTagsList');
      window.dispatchEvent(refreshTagsEvent);
    } catch (error) {
      console.error('添加标签失败:', error);
      const errorMessage = typeof error === 'object' && error !== null 
        ? (error as Error).message || JSON.stringify(error)
        : '添加标签失败';
      
      setError(`添加标签失败: ${errorMessage}`);
      toast.error('添加标签失败，请稍后重试');
    }
  };

  // 打开删除标签对话框
  const openDeleteDialog = (id: string) => {
    setTagToDelete(id);
    setShowDeleteDialog(true);
  };

  // 删除标签
  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    
    try {
      const res = await fetch(`/api/tags/${tagToDelete}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '删除标签失败');
      }
      
      setTags(tags.filter(tag => tag.id !== tagToDelete));
      setShowDeleteDialog(false);
      toast.success('标签已成功删除');
      
      // 触发刷新标签列表事件
      const refreshTagsEvent = new CustomEvent('refreshTagsList');
      window.dispatchEvent(refreshTagsEvent);
    } catch (error) {
      console.error('删除标签失败:', error);
      toast.error('删除标签失败');
    }
  };

  // 开始编辑标签
  const handleStartEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditForm({ name: tag.name, slug: tag.slug });
    setError("");
  };

  // 保存编辑
  const handleSaveEdit = async (id: string) => {
    setError("");

    if (!editForm.name || !editForm.slug) {
      setError("标签名称和别名不能为空");
      return;
    }

    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || '更新标签失败');
        return;
      }
      
      // 更新标签列表
      setTags(
        tags.map(tag => 
          tag.id === id ? { ...tag, name: editForm.name, slug: editForm.slug } : tag
        )
      );
      setEditingId(null);
      toast.success('标签已更新');
      
      // 触发刷新标签列表事件
      const refreshTagsEvent = new CustomEvent('refreshTagsList');
      window.dispatchEvent(refreshTagsEvent);
    } catch (error) {
      console.error('更新标签失败:', error);
      setError('更新标签失败');
    }
  };

  // 自动生成别名（slug）
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
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
      <h2 className="text-xl font-semibold">标签管理</h2>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangleIcon className="h-5 w-5" />
              确认删除标签
            </DialogTitle>
            <DialogDescription>
              此操作将删除该标签。相关联的文章将会失去此标签。确定要继续吗？
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
              onClick={handleDeleteTag}
              className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              确认删除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加新标签表单 */}
      <div className="rounded-md border p-4">
        <h3 className="mb-4 text-lg font-medium">添加新标签</h3>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500 whitespace-pre-line">
            {error}
          </div>
        )}
        
        {/* 显示标签数量限制提示 */}
        {tags.length >= MAX_TAGS_LIMIT - 5 && tags.length < MAX_TAGS_LIMIT && (
          <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-600">
            注意：您已创建 {tags.length} 个标签，最多可创建 {MAX_TAGS_LIMIT} 个标签
          </div>
        )}
        
        {tags.length >= MAX_TAGS_LIMIT ? (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
            已达到最大标签数限制 ({MAX_TAGS_LIMIT}个)，请删除一些标签后再添加新标签
          </div>
        ) : (
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
        )}
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
            {tags.length > 0 ? (
              tags.map((tag) => (
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
                            onClick={() => openDeleteDialog(tag.id)}
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
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  暂无标签，请添加新标签
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 