import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Post, Tag } from "@prisma/client";

type PostWithTags = Post & { tags: Tag[] };

export const metadata = {
  title: "文章列表 - 墨韵",
  description: "浏览所有博客文章",
};

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { tags: true },
  }) as PostWithTags[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">文章列表</h1>
        <p className="text-muted-foreground mt-2">浏览所有博客文章</p>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-10">
          {posts.map((post) => (
            <article key={post.id} className="space-y-2">
              <Link href={`/posts/${post.slug}`}>
                <h2 className="text-xl font-semibold leading-tight hover:underline">{post.title}</h2>
              </Link>
              {post.excerpt && (
                <p className="text-muted-foreground">{post.excerpt}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={post.createdAt.toISOString()}>
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
                            href={`/tags/${tag.slug}`}
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
        <p className="text-muted-foreground">暂无文章发布。</p>
      )}
    </div>
  );
} 