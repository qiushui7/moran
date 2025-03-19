import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// 获取所有文章
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("tagId");

    let posts;
    if (tagId) {
      // 如果提供了tagId，获取该用户下包含此标签的文章
      posts = await prisma.post.findMany({
        where: {
          userId: userId,
          tags: {
            some: {
              id: tagId,
            },
          },
        },
        include: {
          tags: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // 获取该用户的所有文章
      posts = await prisma.post.findMany({
        where: {
          userId: userId,
        },
        include: {
          tags: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("获取文章列表失败:", error);
    return NextResponse.json(
      { error: "获取文章列表失败" },
      { status: 500 }
    );
  }
}

// 创建新文章
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();

    // 验证必要字段
    if (!data.title || !data.slug || !data.content) {
      return NextResponse.json(
        { error: "标题、别名和内容不能为空" },
        { status: 400 }
      );
    }

    // 检查别名是否已存在
    const existingPost = await prisma.post.findUnique({
      where: { slug: data.slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: "该文章别名已被使用" },
        { status: 400 }
      );
    }

    // 提取标签ID，确保它们都存在
    const tagIds = data.tagIds || [];
    
    if (tagIds.length > 0) {
      // 确保用户只能关联自己的标签
      const userTags = await prisma.tag.findMany({
        where: {
          id: {
            in: tagIds
          },
          posts: {
            some: {
              userId: userId
            }
          }
        }
      });
      
      // 如果有标签不属于该用户，返回错误
      if (userTags.length !== tagIds.length) {
        return NextResponse.json(
          { error: "部分标签不存在或不属于您" },
          { status: 400 }
        );
      }
    }

    // 创建文章，包括关联标签
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        published: data.published || false,
        userId: userId,
        tags: {
          connect: tagIds.map((id: string) => ({ id })),
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("创建文章失败:", error);
    return NextResponse.json(
      { error: "创建文章失败" },
      { status: 500 }
    );
  }
} 