import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth-utils";

interface Params {
  params: {
    id: string;
  };
}

// 获取单个文章
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // 验证用户会话并获取userId
    const session = await verifySession();
    
    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }
    
    const { userId } = session;
    const id = params.id;
    
    // 查找该用户的指定文章
    const post = await prisma.post.findFirst({
      where: { 
        id,
        userId // 确保只能获取自己的文章
      },
      include: {
        tags: true
      }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "文章不存在或无权访问" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error("获取文章失败:", error);
    return NextResponse.json(
      { error: "获取文章失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    // 验证用户会话并获取userId
    const session = await verifySession();
    
    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }
    
    const { userId } = session;
    const id = params.id;
    
    // 检查文章是否存在且属于当前用户
    const post = await prisma.post.findFirst({
      where: { 
        id,
        userId // 确保只能更新自己的文章
      }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "文章不存在或无权修改" },
        { status: 404 }
      );
    }
    
    let data;
    try {
      data = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "无效的JSON数据", details: e instanceof Error ? e.message : String(e) },
        { status: 400 }
      );
    }
    
    const { title, slug, content, excerpt, published, tags } = data;
    
    // 验证必填字段
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "标题、URL别名和内容为必填项" },
        { status: 400 }
      );
    }
    
    // 检查别名是否被同一用户的其他文章使用
    if (slug !== post.slug) {
      const existingPost = await prisma.post.findFirst({
        where: { 
          slug,
          userId,
          id: { not: id } // 排除当前文章
        }
      });
      
      if (existingPost) {
        return NextResponse.json(
          { error: "URL别名已被使用" },
          { status: 409 }
        );
      }
    }
    
    // 如果提供了标签，验证标签归属
    if (tags && tags.length > 0) {
      // 确保用户只能关联自己的标签
      const userTags = await prisma.tag.findMany({
        where: {
          id: {
            in: tags
          },
          userId // 确保标签属于当前用户
        }
      });
      
      // 如果有标签不属于该用户，返回错误
      if (userTags.length !== tags.length) {
        return NextResponse.json(
          { error: "部分标签不存在或不属于您" },
          { status: 400 }
        );
      }
    }
    
    // 处理标签关系
    // 先断开所有现有标签
    await prisma.post.update({
      where: { id },
      data: {
        tags: {
          set: []
        }
      }
    });
    
    // 连接新标签
    let tagsConnect = undefined;
    if (tags && tags.length > 0) {
      tagsConnect = {
        connect: tags.map((tagId: string) => ({ id: tagId }))
      };
    }
    
    // 更新文章
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || undefined,
        published: published !== undefined ? published : post.published,
        tags: tagsConnect
      },
      include: {
        tags: true
      }
    });
    
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("更新文章失败:", error);
    return NextResponse.json(
      { error: "更新文章失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // 验证用户会话并获取userId
    const session = await verifySession();
    
    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }
    
    const { userId } = session;
    const id = params.id;
    
    // 检查文章是否存在且属于当前用户
    const post = await prisma.post.findFirst({
      where: { 
        id,
        userId // 确保只能删除自己的文章
      }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "文章不存在或无权删除" },
        { status: 404 }
      );
    }
    
    // 删除文章
    await prisma.post.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: "文章已成功删除", success: true }
    );
  } catch (error) {
    console.error("删除文章失败:", error);
    return NextResponse.json(
      { error: "删除文章失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 