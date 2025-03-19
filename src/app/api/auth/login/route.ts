import { NextResponse } from "next/server";

// 简单的用户认证API
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // 验证用户凭据
    // 注意：这是一个非常简单的实现，生产环境应使用安全的身份验证方法
    if (username === "admin" && password === "password") {
      // 创建响应
      const response = NextResponse.json({ success: true });
      
      // 设置会话Cookie
      response.cookies.set({
        name: "admin_token",
        value: "admin_session_token",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1周
        path: "/",
      });
      
      return response;
    }
    
    return NextResponse.json(
      { success: false, error: "用户名或密码错误" },
      { status: 401 }
    );
  } catch (error) {
    console.error("登录失败:", error);
    return NextResponse.json(
      { success: false, error: "登录失败" },
      { status: 500 }
    );
  }
} 