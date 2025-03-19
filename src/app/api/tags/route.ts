import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { APP_CONSTANTS } from "@/lib/utils";

// 获取所有标签
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    
    // 转换为前端所需的格式，包含文章计数
    const formattedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      count: tag._count.posts
    }));
    
    return NextResponse.json(formattedTags);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json(
      { error: "获取标签失败" },
      { status: 500 }
    );
  }
}

// 创建新标签
export async function POST(request: Request) {
  try {
    const { name, slug } = await request.json();
    
    // 验证数据
    if (!name || !slug) {
      return NextResponse.json(
        { error: "标签名称和别名不能为空" },
        { status: 400 }
      );
    }
    
    // 检查是否已存在
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });
    
    if (existingTag) {
      return NextResponse.json(
        { error: "标签名称或别名已存在" },
        { status: 409 }
      );
    }
    
    // 检查标签总数是否达到上限
    const MAX_TAGS_LIMIT = APP_CONSTANTS.MAX_TAGS_LIMIT;
    const totalTags = await prisma.tag.count();
    
    if (totalTags >= MAX_TAGS_LIMIT) {
      return NextResponse.json(
        { error: `已达到最大标签数限制 (${MAX_TAGS_LIMIT}个)` },
        { status: 403 }
      );
    }
    
    // 创建标签
    const newTag = await prisma.tag.create({
      data: {
        name,
        slug
      }
    });
    
    return NextResponse.json(newTag);
  } catch (error) {
    console.error("创建标签失败:", error);
    return NextResponse.json(
      { error: "创建标签失败" },
      { status: 500 }
    );
  }
} 