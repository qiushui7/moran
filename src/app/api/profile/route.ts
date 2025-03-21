import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth-utils";

// 获取当前用户的个人资料
export async function GET() {
  const session = await verifySession();
  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "未授权访问" }),
      { status: 401 }
    );
  }

  try {
    // 查找用户的个人资料，如果不存在则创建一个空的个人资料
    let profile = await prisma.profile.findUnique({
      where: { userId: session.userId }
    });

    // 如果个人资料不存在，则创建一个新的
    if (!profile) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId }
      });
      
      profile = await prisma.profile.create({
        data: {
          userId: session.userId,
          title: user?.name ? `${user.name}的博客` : "我的博客",
          signature: "",
        }
      });
    }

    // 将bio字符串转换为数组返回给前端
    return NextResponse.json({
      id: profile.id,
      userId: profile.userId,
      signature: profile.signature,
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      contactEmail: profile.contactEmail,
      title: profile.title,
      bio: profile.bio ? profile.bio.split('\n') : []
    });
  } catch (error) {
    console.error("获取个人资料失败:", error);
    return new NextResponse(
      JSON.stringify({ error: "获取个人资料失败" }),
      { status: 500 }
    );
  }
}

// 更新当前用户的个人资料
export async function PUT(request: Request) {
  const session = await verifySession();
  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "未授权访问" }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    // 将前端传来的bio数组转换为字符串
    const bioString = Array.isArray(body.bio) ? body.bio.join('\n') : body.bio || '';
    // 查找用户的个人资料
    let profile = await prisma.profile.findUnique({
      where: { userId: session.userId }
    });

    if (profile) {
      // 更新现有个人资料
      profile = await prisma.profile.update({
        where: { userId: session.userId },
        data: {
          signature: body.signature,
          githubUrl: body.githubUrl,
          linkedinUrl: body.linkedinUrl,
          contactEmail: body.contactEmail,
          title: body.title,
          bio: bioString,
        }
      });
    } else {
      // 创建新的个人资料
      const user = await prisma.user.findUnique({
        where: { id: session.userId }
      });
      
      profile = await prisma.profile.create({
        data: {
          userId: session.userId,
          title: body.title || (user?.name ? `${user.name}的博客` : "我的博客"),
          signature: body.signature || "",
          githubUrl: body.githubUrl,
          linkedinUrl: body.linkedinUrl,
          contactEmail: body.contactEmail,
          bio: bioString,
        }
      });
    }

    // 将bio转回数组返回给前端
    return NextResponse.json({
      id: profile.id,
      userId: profile.userId,
      signature: profile.signature,
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      contactEmail: profile.contactEmail,
      title: profile.title,
      bio: profile.bio ? profile.bio.split('\n') : []
    });
  } catch (error) {
    console.error("更新个人资料失败:", error);
    return new NextResponse(
      JSON.stringify({ error: "更新个人资料失败" }),
      { status: 500 }
    );
  }
} 