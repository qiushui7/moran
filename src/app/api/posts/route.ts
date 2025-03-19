import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取所有文章
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tagId = searchParams.get('tagId') || undefined;
    const published = searchParams.get('published');
    
    // 构建查询条件
    let whereCondition: any = {};
    
    // 搜索条件
    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // 标签过滤
    if (tagId) {
      whereCondition.tags = {
        some: {
          id: tagId
        }
      };
    }
    
    // 发布状态过滤
    if (published === 'true') {
      whereCondition.published = true;
    } else if (published === 'false') {
      whereCondition.published = false;
    }
    
    // 查询文章
    const posts = await prisma.post.findMany({
      where: whereCondition,
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error("获取文章失败:", error);
    return NextResponse.json(
      { error: "获取文章失败" },
      { status: 500 }
    );
  }
}

// 创建新文章
export async function POST(request: Request) {
  try {
    const { title, slug, content, excerpt, published, tags } = await request.json();
    
    // 验证必填字段
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "标题、URL别名和内容为必填项" },
        { status: 400 }
      );
    }
    
    // 检查别名是否已存在
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    });
    
    if (existingPost) {
      return NextResponse.json(
        { error: "URL别名已被使用" },
        { status: 409 }
      );
    }
    
    // 处理标签关联
    let tagsConnect = undefined;
    if (tags && tags.length > 0) {
      tagsConnect = {
        connect: tags.map((tagId: string) => ({ id: tagId }))
      };
    }
    
    // 创建文章
    const newPost = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || undefined,
        published: published || false,
        tags: tagsConnect
      },
      include: {
        tags: true
      }
    });
    
    return NextResponse.json(newPost);
  } catch (error) {
    console.error("创建文章失败:", error);
    return NextResponse.json(
      { error: "创建文章失败" },
      { status: 500 }
    );
  }
} 