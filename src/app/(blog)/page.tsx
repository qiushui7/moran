import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Post, Tag } from "@prisma/client";
import { Github, Linkedin, Mail } from "lucide-react";

type PostWithTags = Post & { tags: Tag[] };

export default async function Home() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { tags: true },
  }) as PostWithTags[];

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl min-h-[3rem] sm:min-h-[3.5rem] md:min-h-[4rem]">
          欢迎来到我的博客
        </h1>
        <p className="text-muted-foreground max-w-[600px]">
        风可以吹跑一片白纸，但是不能吹跑一只蝴蝶，因为生命的力量在于不顺从，我希望你们能勇敢的打破别人给你的枷锁，因为生活中的对和错都是人为决定的。
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://github.com/qiushui7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/%E6%85%A7%E6%B6%9B-%E5%88%98-181771337/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="mailto:qiushui030716@gmail.com"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="邮箱"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">最新文章</h2>
          <Link href="/posts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            查看全部
          </Link>
        </div>
        
        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: PostWithTags) => (
              <article key={post.id} className="group space-y-2">
                <Link href={`/posts/${post.slug}`}>
                  <h3 className="text-lg font-medium leading-tight group-hover:underline">{post.title}</h3>
                </Link>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                        {post.tags.map((tag: Tag, index: number) => (
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
      </section>
    </div>
  );
}
