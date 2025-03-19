import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { APP_CONSTANTS } from "@/lib/utils";
import { auth } from "@/auth";

// 获取所有标签
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // 获取该用户的所有标签
    const tags = await prisma.tag.findMany({
      where: {
        posts: {
          some: {
            userId: userId
          }
        }
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json(
      { error: "获取标签失败" },
      { status: 500 }
    );
  }
}

// 创建新标签
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const userId = session.user.id;
    const { name, slug } = await request.json();

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json(
        { error: "标签名称和别名为必填项" },
        { status: 400 }
      );
    }

    // 检查用户拥有的标签数量是否达到上限
    const userTagsCount = await prisma.tag.count({
      where: {
        posts: {
          some: {
            userId: userId
          }
        }
      }
    });

    if (userTagsCount >= APP_CONSTANTS.MAX_TAGS_LIMIT) {
      return NextResponse.json(
        { error: `每个用户最多只能创建 ${APP_CONSTANTS.MAX_TAGS_LIMIT} 个标签` },
        { status: 403 }
      );
    }

    // 检查该用户是否已有相同名称或别名的标签
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ],
        posts: {
          some: {
            userId: userId
          }
        }
      }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "标签名称或别名已存在" },
        { status: 400 }
      );
    }

    // 创建新标签，并关联到一个空白文章
    const dummyPost = await prisma.post.create({
      data: {
        title: `${name} 标签初始化`,
        slug: `${slug}-init`,
        content: `这是为 ${name} 标签创建的初始化文章`,
        excerpt: `${name} 标签初始化文章`,
        published: false,
        userId: userId
      }
    });

    // 创建标签并关联到空白文章
    const newTag = await prisma.tag.create({
      data: {
        name,
        slug,
        posts: {
          connect: {
            id: dummyPost.id
          }
        }
      },
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