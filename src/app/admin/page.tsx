import { LoginButton } from "@/components/auth/login-button";

export default function AdminLogin() {
  return (
    <div className="flex h-[calc(100vh-180px)] items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold">墨韵</h2>
          <p className="text-sm text-muted-foreground">登录以管理您的博客内容</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <LoginButton provider="google" className="w-full" />
          <LoginButton provider="github" className="w-full" />
          <div className="text-center text-xs text-muted-foreground">
            <p>登录后可以创建和管理您自己的文章和标签</p>
          </div>
        </div>
      </div>
    </div>
  );
} 