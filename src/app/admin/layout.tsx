"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 当前访问的是否是登录页
  const isLoginPage = pathname === "/admin";

  // 检查用户是否已登录
  useEffect(() => {
    const checkLoginStatus = () => {
      const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
      
      // 如果未登录且不在登录页，则重定向到登录页
      if (!isLoggedIn && !isLoginPage) {
        router.push("/admin");
      }
      
      // 如果已登录且在登录页，则重定向到文章管理页
      if (isLoggedIn && isLoginPage) {
        router.push("/admin/posts");
      }
      
      setIsLoading(false);
    };

    checkLoginStatus();
    
    // 监听存储变更事件，以便在其他标签页登出时响应
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "admin_logged_in") {
        checkLoginStatus();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isLoginPage, router]);

  // 显示加载状态或子组件
  return isLoading ? (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-primary">加载中...</div>
    </div>
  ) : (
    children
  );
} 