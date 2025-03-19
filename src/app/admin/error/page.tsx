"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "认证过程中出现错误";
  if (error === "AccessDenied") {
    errorMessage = "您没有访问权限，只有管理员可以访问此页面";
  } else if (error === "Verification") {
    errorMessage = "无法验证您的身份";
  } else if (error === "Configuration") {
    errorMessage = "认证系统配置错误，请联系管理员";
  }

  return (
    <div className="flex h-[calc(100vh-180px)] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8 shadow-md">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangleIcon className="h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold">认证失败</h2>
        </div>

        <div className="rounded-md bg-amber-50 p-4 text-amber-700">
          <p>{errorMessage}</p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/admin"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            返回登录页
          </Link>
        </div>
      </div>
    </div>
  );
} 