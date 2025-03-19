import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取单个文章
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        tags: true
      }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error("获取文章失败:", error);
    return NextResponse.json(
      { error: "获取文章失败" },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { title, slug, content, excerpt, published, tags } = await request.json();
    
    // 验证必填字段
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "标题、URL别名和内容为必填项" },
        { status: 400 }
      );
    }
    
    // 检查文章是否存在
    const post = await prisma.post.findUnique({
      where: { id: params.id }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }
    
    // 检查别名是否被其他文章使用
    if (slug !== post.slug) {
      const existingPost = await prisma.post.findUnique({
        where: { slug }
      });
      
      if (existingPost) {
        return NextResponse.json(
          { error: "URL别名已被使用" },
          { status: 409 }
        );
      }
    }
    
    // 处理标签关系
    // 先断开所有现有标签
    await prisma.post.update({
      where: { id: params.id },
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
      where: { id: params.id },
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
      { error: "更新文章失败" },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 检查文章是否存在
    const post = await prisma.post.findUnique({
      where: { id: params.id }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }
    
    // 删除文章
    await prisma.post.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json(
      { message: "文章已成功删除" }
    );
  } catch (error) {
    console.error("删除文章失败:", error);
    return NextResponse.json(
      { error: "删除文章失败" },
      { status: 500 }
    );
  }
} 