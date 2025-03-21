import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { redirect } from "next/navigation";

/**
 * 通过accessToken查找用户
 */
export async function getUserByAccessToken(accessToken: string) {
  if (!accessToken) return null;
  
  try {
    // 通过accessToken在账户表中查找对应用户
    const account = await prisma.account.findFirst({
      where: {
        access_token: accessToken
      },
      include: {
        user: true
      }
    });
    
    return account?.user || null;
  } catch (error) {
    console.error("通过accessToken查找用户失败:", error);
    return null;
  }
}

/**
 * 使用缓存验证会话并获取用户ID
 * 如果会话无效或用户ID缺失，返回null
 */
export const verifySession = cache(async () => {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return null;
    }

    // 尝试从session中获取userId
    let userId = session.user.id;
    
    // 如果userId不存在，尝试使用accessToken
    if (!userId && session.user.accessToken) {
      const user = await getUserByAccessToken(session.user.accessToken);
      
      if (user) {
        userId = user.id;
      }
    }
    
    if (!userId) {
      return null;
    }
    
    return { isAuth: true, userId };
  } catch (error) {
    console.error("验证会话失败:", error);
    return null;
  }
});

/**
 * 强制验证用户会话，如果未认证则自动重定向到登录页面
 */
export const requireAuth = cache(async () => {
  const session = await verifySession();
  
  if (!session) {
    redirect("/admin"); // 重定向到登录页
  }
  
  return session;
});

/**
 * 获取当前用户完整信息
 */
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true
      }
    });
    
    return user;
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return null;
  }
}); 