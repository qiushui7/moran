import { NextRequest, NextResponse } from "next/server";

// 检查请求中的cookies，判断用户是否已登录
export function middleware(request: NextRequest) {
  // 获取当前路径
  const { pathname } = request.nextUrl;
  
  // 当前访问的是否是登录页
  const isLoginPage = pathname === "/admin" || pathname === "/admin/";
  
  // 检查认证cookie是否存在
  const authCookie = request.cookies.get("authjs.session-token") || 
                    request.cookies.get("__Secure-authjs.session-token");
  
  const isLoggedIn = Boolean(authCookie?.value);
  
  // 访问管理后台页面
  if (pathname.startsWith("/admin")) {
    // 如果未登录且不在登录页，重定向到登录页
    if (!isLoggedIn && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    
    // 如果已登录但在登录页，重定向到文章管理页
    if (isLoggedIn && isLoginPage) {
      return NextResponse.redirect(new URL("/admin/posts", request.url));
    }
  }
  
  return NextResponse.next();
}

// 配置中间件只针对admin路径运行
export const config = {
  matcher: ["/admin/:path*"]
}; 