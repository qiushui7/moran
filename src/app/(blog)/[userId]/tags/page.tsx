import Link from "next/link";
import type { Tag } from "@prisma/client";

type TagWithCount = Tag & { _count: { posts: number } };

export const metadata = {
  title: "标签 - 墨韵",
  description: "浏览博客中的所有标签",
};

// 获取所有标签
async function getAllTags(userId: string): Promise<TagWithCount[]> {
  // 构建API URL，使用userId过滤
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/public/tags?userId=${userId}`;
  
  const response = await fetch(apiUrl, { 
    next: { revalidate: 60 } // 每60秒重新验证数据
  });
  
  if (!response.ok) {
    console.error('Failed to fetch tags');
    return [];
  }
  
  return response.json();
}

export default async function TagsPage({
  params
}: {
  params: { userId: string }
}) {
  const userId = params.userId;
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