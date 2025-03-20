import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取所有标签（仅包含有已发布文章的标签）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    // 构建查询条件
    const where = {
      posts: {
        some: {
          published: true,
          ...(userId ? { userId } : {})
        }
      },
      ...(userId ? { userId } : {})
    };
    
    // 查找所有标签，并包含已发布文章的计数
    const tags = await prisma.tag.findMany({
      where,
      include: {
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
    
    // 按文章数量排序（降序）
    tags.sort((a, b) => b._count.posts - a._count.posts);
    
    return NextResponse.json(tags);
  } catch (error) {
    console.error("获取公共标签列表失败:", error);
    return NextResponse.json(
      { error: "获取标签列表失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 