import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Tag } from "@prisma/client";

export const metadata = {
  title: "标签 - 墨韵",
  description: "浏览博客中的所有标签",
};

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  // 根据文章数量排序
  tags.sort((a, b) => b._count.posts - a._count.posts);

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
              href={`/tags/${tag.slug}`}
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