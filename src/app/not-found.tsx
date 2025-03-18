import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <h2 className="text-xl font-medium">页面不存在</h2>
      <p className="text-muted-foreground max-w-md">
        抱歉，您请求的页面不存在或已被移动到其他位置。
      </p>
      <Link
        href="/"
        className="text-sm underline underline-offset-4 hover:text-primary"
      >
        返回首页
      </Link>
    </div>
  );
} 