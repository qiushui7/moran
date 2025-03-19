import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Post, Tag } from "@prisma/client";

type PostWithTags = Post & { tags: Tag[] };

interface PostPageParams {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PostPageParams) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    return {
      title: "文章不存在 - 墨韵",
      description: "找不到请求的文章",
    };
  }

  return {
    title: `${post.title} - 墨韵`,
    description: post.excerpt || "阅读文章详情",
  };
}

export default async function PostPage({ params }: PostPageParams) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { tags: true },
  }) as PostWithTags | null;

  if (!post || !post.published) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
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
      </div>

      <div className="prose dark:prose-invert max-w-none">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Link 
          href="/posts" 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 返回文章列表
        </Link>
      </div>
    </article>
  );
}
 