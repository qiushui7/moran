import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    slug: string;
  };
}

// 获取单个标签及其关联的已发布文章
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const slug = params.slug;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!slug) {
      return NextResponse.json(
        { error: "缺少标签别名" },
        { status: 400 }
      );
    }
    
    // 构建查询条件
    const where = {
      slug,
      ...(userId ? { userId } : {})
    };
    
    // 查找标签及其关联的已发布文章
    const tag = await prisma.tag.findFirst({
      where,
      include: {
        posts: {
          where: { 
            published: true,
            ...(userId ? { userId } : {})
          },
          orderBy: { createdAt: "desc" },
          include: { tags: true }
        },
        _count: {
          select: {
            posts: {
              where: { 
                published: true,
                ...(userId ? { userId } : {})
              }
            }
          }
        }
      }
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: "标签不存在" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(tag);
  } catch (error) {
    console.error("获取公共标签详情失败:", error);
    return NextResponse.json(
      { error: "获取标签详情失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 