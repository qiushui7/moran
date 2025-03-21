"use client";

import { useState, useEffect, useRef, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  ArrowUp,
  LoaderCircle
} from "lucide-react";
import { toast } from "sonner";
import LexicalEditor from "@/components/editor/LexicalEditor";
import { debounce } from "@/lib/helpers";

type Post = {
  id: string;
  title: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
  excerpt?: string;
  slug?: string;
  published: boolean;
  tags?: { id: string; name?: string; color?: string }[];
};

export default function PostEditorPage({ params }: { params: { id: string } }) {
  const actualParams = use(params as unknown as Promise<{ id: string }>);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [content, setContent] = useState("");
  const contentRef = useRef<string>("");
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const lastSaveTimeRef = useRef<Date | null>(null);
  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${actualParams.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        toast.error("获取文章失败", {
          description: errorData.error || "无法加载文章内容",
        });
        throw new Error(errorData.error || "获取文章失败");
      }
      const data = await response.json();
      console.log("获取文章数据:", data);
      setPost(data);
      setContent(data.content || "");
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };
  // 获取文章数据
  useEffect(() => {
    fetchPost();
  }, [actualParams.id]);

  useEffect(() => {
    if (post) {
      setContent(post.content || "");
      setTitle(post.title);
      setExcerpt(post.excerpt || "");
    }
  }, [post]);

  // 添加标题和摘要编辑状态
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingExcerpt, setEditingExcerpt] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");

  // 初始化标题和摘要
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setExcerpt(post.excerpt || "");
    }
  }, [post]);

  // 保存标题
  const saveTitle = async () => {
    if (!post || title === post.title) {
      setEditingTitle(false);
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          published: post.published,
          tags: post.tags ? post.tags.map(tag => tag.id) : []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error("保存标题失败", {
          description: errorData.error || "请稍后重试",
        });
        throw new Error(errorData.error || "保存标题失败");
      }
      
      const updatedPost = await response.json();
      setPost(updatedPost);
      setEditingTitle(false);
      toast.success("标题已更新");
    } catch (error) {
      console.error("Error saving title:", error);
    } finally {
      setSaving(false);
    }
  };

  // 保存摘要
  const saveExcerpt = async () => {
    if (!post || excerpt === post.excerpt) {
      setEditingExcerpt(false);
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt,
          published: post.published,
          tags: post.tags ? post.tags.map(tag => tag.id) : []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error("保存摘要失败", {
          description: errorData.error || "请稍后重试",
        });
        throw new Error(errorData.error || "保存摘要失败");
      }
      
      const updatedPost = await response.json();
      setPost(updatedPost);
      setEditingExcerpt(false);
      toast.success("摘要已更新");
    } catch (error) {
      console.error("Error saving excerpt:", error);
    } finally {
      setSaving(false);
    }
  };

  // 定义防抖保存函数
  const debouncedSavePost = useCallback(
    debounce((contentToSave: string) => {
      if (post) savePost(contentToSave);
    }, 2000),
    [post]
  );
  
  // 处理内容变更
  const handleContentChange = (newContent: string) => {
    contentRef.current = newContent;
    debouncedSavePost(newContent);
  };

  // 保存文章
  const savePost = async (contentToSave: string) => {
    if (!post) return;
    console.log("保存文章:", contentToSave);
    setSaving(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: post.title,
          slug: post.slug,
          content: contentToSave,
          excerpt: post.excerpt,
          published: post.published,
          tags: post.tags ? post.tags.map(tag => tag.id) : []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error("保存内容失败", {
          description: errorData.error || "请稍后重试",
        });
        throw new Error(errorData.error || "保存内容失败");
      }
      
      const updatedPost = await response.json();
      setPost(updatedPost);
      lastSaveTimeRef.current = new Date();
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setSaving(false);
    }
  };

  // 手动保存
  const handleManualSave = () => {
    if (!post) return;
    
    // 使用当前最新内容保存
    savePost(contentRef.current);
    toast.success("文章已保存", {
      description: `保存时间: ${new Date().toLocaleTimeString()}`
    });
  };

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (editorContainerRef.current) {
        const { scrollTop } = editorContainerRef.current;
        setShowScrollTop(scrollTop > 300);
      }
    };

    const container = editorContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // 滚动到顶部
  const scrollToTop = () => {
    if (editorContainerRef.current) {
      editorContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  // 处理取消标题编辑
  const cancelTitleEdit = () => {
    setTitle(post?.title || "");
    setEditingTitle(false);
  };

  // 处理取消摘要编辑
  const cancelExcerptEdit = () => {
    setExcerpt(post?.excerpt || "");
    setEditingExcerpt(false);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-white">
        <div className="flex items-center justify-center h-full">
          <LoaderCircle className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full h-screen bg-white">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-lg text-gray-600 mb-4">文章不存在或已被删除</div>
          <button 
            onClick={() => router.push("/admin/posts")}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            返回文章列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* 头部工具栏 */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={() => router.push(`/admin/posts/edit/${post.id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            返回
          </button>
          
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md w-60 text-base font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') cancelTitleEdit();
                }}
              />
              <button onClick={saveTitle} className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">
                保存
              </button>
              <button onClick={cancelTitleEdit} className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                取消
              </button>
            </div>
          ) : (
            <h1 
              className="font-semibold text-lg cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors" 
              onClick={() => setEditingTitle(true)}
              title="点击编辑标题"
            >
              {post.title}
            </h1>
          )}
          
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            编辑模式
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm text-gray-500">
            <div className={`h-2 w-2 rounded-full mr-2 ${saving ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            {saving ? "保存中..." : lastSaveTimeRef.current 
              ? `上次保存: ${new Date(lastSaveTimeRef.current).toLocaleTimeString()}` 
              : "未保存"}
          </div>
          
          <button 
            className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleManualSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-1.5" />
            保存
          </button>
        </div>
      </header>
      
      {/* 编辑器容器 */}
      <div className="flex-1 overflow-auto relative" ref={editorContainerRef}>
        {/* 摘要编辑区域 */}
        <div className="px-4 pt-2 pb-4 border-b border-gray-200">
          {editingExcerpt ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">文章摘要</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows={2}
                placeholder="输入文章摘要..."
                autoFocus
                onBlur={saveExcerpt}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') cancelExcerptEdit();
                }}
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={cancelExcerptEdit} 
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={saveExcerpt} 
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                >
                  保存摘要
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="text-sm text-gray-500 p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setEditingExcerpt(true)}
              title="点击编辑摘要"
            >
              <span className="font-medium">摘要：</span>
              {post.excerpt ? post.excerpt : <span className="italic">添加文章摘要...</span>}
            </div>
          )}
        </div>
        
        {/* 编辑器内容区域 */}
        <div className="px-4 pt-2">
          <LexicalEditor 
            initialContent={content} 
            onChange={handleContentChange}
            placeholder="开始写作..."
          />
        </div>
      </div>
      
      {/* 滚动到顶部按钮 */}
      <button 
        className={`fixed right-8 bottom-8 p-2 bg-gray-800 text-white rounded-full shadow-lg transition-opacity hover:bg-gray-700 ${showScrollTop ? 'opacity-70' : 'opacity-0 pointer-events-none'}`}
        onClick={scrollToTop}
        aria-label="滚动到顶部"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
} 