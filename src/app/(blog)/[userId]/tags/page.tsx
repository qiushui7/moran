import Link from "next/link";
import type { Tag } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type TagWithCount = Tag & { _count: { posts: number } };

export const metadata = {
  title: "标签 - 墨染",
  description: "浏览博客中的所有标签",
};

// 获取所有标签
async function getAllTags(userId: string): Promise<TagWithCount[]> {
  try {
    // 使用Prisma直接查询数据库
    const tags = await prisma.tag.findMany({
      where: {
        userId: userId,
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                published: true, // 只计算已发布的文章
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc', // 按标签名称字母顺序排序
      },
    });
    
    return tags;
  } catch (error) {
    console.error('获取标签失败:', error);
    return [];
  }
}

export default async function TagsPage({
  params
}: {
  params: Promise<{ userId: string }>
}) {

  const { userId } = await params;
  const tags = await getAllTags(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">标签</h1>
        <p className="text-muted-foreground mt-2">按标签浏览文章</p>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/${userId}/tags/${tag.slug}`}
              className="px-3 py-1 text-sm rounded-md border bg-background hover:bg-accent transition-colors"
            >
              {tag.name} ({tag._count.posts})
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">暂无标签。</p>
      )}
    </div>
  );
} 