import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";

type Sec = {
  params: Promise<{id: string}>
}

// 获取单个标签
export async function GET(request: NextRequest, { params }: Sec) {
  try {
    // 验证用户会话并获取userId
    const session = await verifySession();
    
    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }
    
    const { userId } = session;
    const actualParams = await params
    const id = actualParams.id;

    // 查找该用户的指定标签
    const tag = await prisma.tag.findFirst({
      where: {
        id,
        userId: userId
      },
      include: {
        posts: {
          where: {
            userId: userId
          },
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            createdAt: true
          }
        }
      }
    });

    if (!tag) {
      return NextResponse.json({ error: "标签不存在" }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error("获取标签详情失败:", error);
    return NextResponse.json(
      { error: "获取标签详情失败" },
      { status: 500 }
    );
  }
}

// 更新标签
export async function PUT(request: NextRequest, { params }: Sec) {
  try {
    // 验证用户会话并获取userId
    const session = await verifySession();
    
    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }
    
    const { userId } = session;
    const actualParams = await params;
    const id = actualParams.id
    const { name, slug } = await request.json();

    // 验证数据
    if (!name || !slug) {
      return NextResponse.json(
        { error: "标签名称和别名不能为空" },
        { status: 400 }
      );
    }

    // 检查标签是否存在且属于当前用户
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        userId: userId
      }
    });

    if (!existingTag) {
      return NextResponse.json({ error: "标签不存在或无权修改" }, { status: 404 });
    }

    // 检查新的名称或别名是否与其他标签冲突
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        id: { not: id },
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

    if (duplicateTag) {
      return NextResponse.json(
        { error: "标签名称或别名已被使用" },
        { status: 400 }
      );
    }

    // 更新标签
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: { name, slug }
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("更新标签失败:", error);
    return NextResponse.json(
      { error: "更新标签失败" },
      { status: 500 }
    );
  }
}

// 删除标签
export async function DELETE(request: NextRequest, { params }: Sec) {
  try {
    // 验证用户会话并获取userId
    const session = await verifySession();
    
    if (!session) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }
    
    const { userId } = session;
    const actualParams = await params;
    const id = actualParams.id

    // 检查标签是否存在且属于当前用户
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        userId: userId
      }
    });

    if (!existingTag) {
      return NextResponse.json({ error: "标签不存在或无权删除" }, { status: 404 });
    }

    // 删除标签
    await prisma.tag.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除标签失败:", error);
    return NextResponse.json(
      { error: "删除标签失败" },
      { status: 500 }
    );
  }
} 