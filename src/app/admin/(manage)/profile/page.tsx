"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// 个人资料类型定义
type Profile = {
  id: string;
  signature?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  contactEmail?: string;
  bio: string[];
  title: string;
  userId: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newBioItem, setNewBioItem] = useState("");
  
  // 表单数据
  const [formData, setFormData] = useState({
    signature: "",
    title: "Welcome to my blog!",
    bio: [] as string[],
    githubUrl: "",
    linkedinUrl: "",
    contactEmail: "",
  });

  // 加载个人资料数据
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          throw new Error("获取个人资料失败");
        }
        const data = await res.json();
        setProfile(data);
        
        // 设置表单初始值
        setFormData({
          signature: data.signature || "",
          title: data.title || "Welcome to my blog!",
          bio: Array.isArray(data.bio) ? data.bio : [],
          githubUrl: data.githubUrl || "",
          linkedinUrl: data.linkedinUrl || "",
          contactEmail: data.contactEmail || "",
        });
      } catch (error) {
        console.error("获取个人资料失败:", error);
        toast.error("无法加载个人资料数据");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, []);
  
  // 处理表单变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 添加个人简介项
  const addBioItem = () => {
    if (newBioItem.trim() && formData.bio.length < 3) {
      setFormData(prev => ({
        ...prev,
        bio: [...prev.bio, newBioItem.trim()]
      }));
      setNewBioItem("");
    } else if (formData.bio.length >= 3) {
      toast.error("最多只能添加三条个人简介");
    }
  };
  
  // 删除个人简介项
  const removeBioItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bio: prev.bio.filter((_, i) => i !== index)
    }));
  };
  
  // 保存个人资料
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        throw new Error("保存个人资料失败");
      }
      
      toast.success("个人资料已更新");
      // 刷新数据
      router.refresh();
    } catch (error) {
      console.error("保存个人资料失败:", error);
      toast.error("保存个人资料时出错");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">个人资料设置</h1>
        <p className="text-muted-foreground mt-2">
          自定义博客显示的个人信息和链接
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          
          <div className="grid gap-2">
            <Label htmlFor="title">博客标语</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="欢迎访问我的博客"
            />
          </div>
          
          <div className="grid gap-2">
            <Label>几句话简单介绍自己（这将会展示在博客左上方）<span className="text-xs text-muted-foreground ml-2">最多3条</span></Label>
            <div className="rounded-md border p-3">
              {formData.bio.length > 0 ? (
                <ul className="space-y-2 mb-3">
                  {formData.bio.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="flex-1 text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeBioItem(index)}
                        className="h-5 w-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground mb-3">添加一些关于你的简短介绍</p>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="添加新的简介项"
                  value={newBioItem}
                  onChange={(e) => setNewBioItem(e.target.value)}
                  disabled={formData.bio.length >= 3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && formData.bio.length < 3) {
                      e.preventDefault();
                      addBioItem();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addBioItem}
                  disabled={formData.bio.length >= 3}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.bio.length >= 3 && (
                <p className="text-xs text-amber-600 mt-2">已达到最大限制（3条）</p>
              )}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="signature">个性签名</Label>
            <Textarea
              id="signature"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              placeholder="写点你想说的"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="githubUrl">GitHub 链接</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/yourusername"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="linkedinUrl">LinkedIn 链接</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourusername"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="contactEmail">联系邮箱</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="public@example.com"
              type="email"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "保存设置"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 