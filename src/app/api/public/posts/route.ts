import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取所有已发布的文章
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("tagId");
    const userId = searchParams.get("userId");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : undefined;
    
    // 基本查询条件：只返回已发布的文章
    const where = {
      published: true,
      ...(tagId ? { 
        tags: {
          some: { id: tagId }
        } 
      } : {}),
      ...(userId ? { userId } : {})
    };
    
    // 获取文章列表
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        tags: true
      }
    });
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error("获取公共文章列表失败:", error);
    return NextResponse.json(
      { error: "获取文章列表失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 