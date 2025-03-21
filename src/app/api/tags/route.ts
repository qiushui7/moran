import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { APP_CONSTANTS } from "@/lib/utils";
import { verifySession } from "@/lib/auth-utils";

// 获取所有标签
export async function GET() {
  try {
    // 验证用户会话并获取userId
    const session = await verifySession();
    
    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }
    
    const { userId } = session;
    
    // 获取当前用户的所有标签
    const tags = await prisma.tag.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    // 格式化返回数据，添加文章计数
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
      { error: "获取标签失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 创建新标签
export async function POST(request: NextRequest) {
  try {
    // 验证用户会话并获取userId
    const session = await verifySession();
    
    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }
    
    const { userId } = session;
    
    let requestData;
    try {
      requestData = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "无效的JSON数据", details: e instanceof Error ? e.message : String(e) },
        { status: 400 }
      );
    }
    
    const { name, slug } = requestData;

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
        userId: userId
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
          {
            name,
            userId
          },
          {
            slug,
            userId
          }
        ]
      }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "标签名称或别名已存在" },
        { status: 400 }
      );
    }

    // 创建新标签
    const newTag = await prisma.tag.create({
      data: {
        name,
        slug,
        userId
      }
    });

    return NextResponse.json(newTag);
  } catch (error) {
    console.error("创建标签失败:", error);
    return NextResponse.json(
      { 
        error: "创建标签失败，请确保已登录并检查标签数据是否有效", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 