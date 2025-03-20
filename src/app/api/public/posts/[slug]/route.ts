import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    slug: string;
  };
}

// 获取单个已发布的文章
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const slug = params.slug;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!slug) {
      return NextResponse.json(
        { error: "缺少文章别名" },
        { status: 400 }
      );
    }
    
    // 构建查询条件
    const where = {
      slug,
      published: true, // 只返回已发布的文章
      ...(userId ? { userId } : {})
    };
    
    // 查找已发布的文章
    const post = await prisma.post.findFirst({
      where,
      include: {
        tags: true
      }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "文章不存在或未发布" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error("获取公共文章详情失败:", error);
    return NextResponse.json(
      { error: "获取文章详情失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 