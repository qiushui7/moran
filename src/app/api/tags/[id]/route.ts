import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取单个标签
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: "标签不存在" },
        { status: 404 }
      );
    }
    
    const formattedTag = {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      count: tag._count.posts
    };
    
    return NextResponse.json(formattedTag);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json(
      { error: "获取标签失败" },
      { status: 500 }
    );
  }
}

// 更新标签
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, slug } = await request.json();
    
    // 验证数据
    if (!name || !slug) {
      return NextResponse.json(
        { error: "标签名称和别名不能为空" },
        { status: 400 }
      );
    }
    
    // 检查标签是否存在
    const tag = await prisma.tag.findUnique({
      where: { id: params.id }
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: "标签不存在" },
        { status: 404 }
      );
    }
    
    // 检查名称和别名是否已被其他标签使用
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ],
        NOT: {
          id: params.id
        }
      }
    });
    
    if (existingTag) {
      return NextResponse.json(
        { error: "标签名称或别名已被使用" },
        { status: 409 }
      );
    }
    
    // 更新标签
    const updatedTag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name,
        slug
      }
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
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 检查标签是否存在
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: "标签不存在" },
        { status: 404 }
      );
    }
    
    // 删除标签
    await prisma.tag.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json(
      { message: "标签已成功删除" }
    );
  } catch (error) {
    console.error("删除标签失败:", error);
    return NextResponse.json(
      { error: "删除标签失败" },
      { status: 500 }
    );
  }
} 