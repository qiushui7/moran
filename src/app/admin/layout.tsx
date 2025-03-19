"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // 当前访问的是否是登录页
  const isLoginPage = pathname === "/admin";

  // 检查用户是否已登录且是管理员
  useEffect(() => {
    if (status === "loading") return;
    // 如果未登录或不是管理员，且不在登录页，则重定向到登录页
    if (status === "unauthenticated" && !isLoginPage) {
      router.push("/admin");
      setIsLoading(false);
      return;
    }
    
    // 如果已登录，且在登录页，则重定向到文章管理页
    if (status === "authenticated" && isLoginPage) {
      router.push("/admin/posts");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(false);
  }, [isLoginPage, router, session, status]);

  // 显示加载状态或子组件
  return isLoading ? (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-primary">加载中...</div>
    </div>
  ) : (
    children
  );
} 