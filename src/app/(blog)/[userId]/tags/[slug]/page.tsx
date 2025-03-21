import Link from "next/link";
import { notFound } from "next/navigation";
import type { Post, Tag } from "@prisma/client";

type PostWithTags = Post & { tags: Tag[] };
type TagWithPosts = Tag & { 
  posts: PostWithTags[];
  _count: { posts: number };
};


// 获取单个标签及其文章
async function getTag(userId: string, slug: string): Promise<TagWithPosts | null> {
  // 构建API URL，使用userId过滤
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/public/tags/${slug}?userId=${userId}`;
  
  const response = await fetch(apiUrl, { 
    next: { revalidate: 60 } // 每60秒重新验证数据
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    console.error(`Failed to fetch tag: ${slug}`);
    return null;
  }
  
  return response.json();
}

export async function generateMetadata({ params }: {params: Promise<{
  userId: string;
  slug: string;
}>}) {
  const {userId, slug} = await params
  const tag = await getTag(userId, slug);

  if (!tag) {
    return {
      title: "标签不存在 - 墨染",
      description: "找不到请求的标签",
    };
  }

  return {
    title: `${tag.name} - 标签 - 墨染`,
    description: `浏览与"${tag.name}"相关的所有文章`,
  };
}

export default async function TagPage({ params }: {params: Promise<{
  userId: string;
  slug: string;
}>}) {
  const { userId, slug } = await params;
  const tag = await getTag(userId, slug);

  if (!tag) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">#{tag.name}</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          与&quot;{tag.name}&quot;相关的文章 ({tag.posts.length}篇)
        </p>
      </div>

      {tag.posts.length > 0 ? (
        <div className="space-y-10">
          {tag.posts.map((post: PostWithTags) => (
            <article key={post.id} className="space-y-2">
              <Link href={`/${userId}/posts/${post.slug}`}>
                <h2 className="text-xl font-semibold leading-tight hover:underline">{post.title}</h2>
              </Link>
              {post.excerpt && (
                <p className="text-muted-foreground">{post.excerpt}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={new Date(post.createdAt).toISOString()}>
                  {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                {post.tags.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {post.tags.map((tag, index) => (
                        <span key={tag.id}>
                          <Link
                            href={`/${userId}/tags/${tag.slug}`}
                            className="hover:text-foreground transition-colors"
                          >
                            {tag.name}
                          </Link>
                          {index < post.tags.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">此标签下暂无文章。</p>
      )}

      <div className="flex justify-between pt-4 border-t">
        <Link 
          href={`/${userId}/tags`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 返回标签列表
        </Link>
      </div>
    </div>
  );
} 