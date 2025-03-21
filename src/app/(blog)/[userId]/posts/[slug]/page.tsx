import Link from "next/link";
import { notFound } from "next/navigation";
import type { Post, Tag, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";

// 动态导入LexicalViewer组件以避免SSR问题
const LexicalViewer = dynamic(
  () => import("@/components/editor/LexicalViewer"),
  { ssr: true }
);

type PostWithTags = Post & { tags: Tag[] };

// 获取用户信息
async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

// 获取单篇文章
async function getPost(userId: string, slug: string): Promise<PostWithTags | null> {
  try {
    // 使用Prisma直接查询数据库
    const post = await prisma.post.findFirst({
      where: {
        userId: userId,
        slug: slug,
        published: true, // 只获取已发布的文章
      },
      include: {
        tags: true, // 包含标签数据
      },
    });
    
    return post;
  } catch (error) {
    console.error(`获取文章失败: ${slug}`, error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{
  userId: string;
  slug: string;
}>}) {
  const { userId, slug } = await params;
  const post = await getPost(userId, slug);

  if (!post) {
    return {
      title: "文章不存在 - 墨染",
      description: "找不到请求的文章",
    };
  }

  return {
    title: `${post.title} - 墨染`,
    description: post.excerpt || "阅读文章详情",
  };
}

export default async function PostPage({ params }: { params: Promise<{
  userId: string;
  slug: string;
}>}) {
  const { userId, slug } = await params;
  
  // 获取用户信息
  const user = await getUserById(userId);
  if (!user) {
    notFound();
  }
  
  // 获取文章
  const post = await getPost(userId, slug);
  if (!post || !post.published) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
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
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <LexicalViewer content={post.content} />
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Link 
          href={`/${userId}/posts`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 返回文章列表
        </Link>
      </div>
    </article>
  );
}
 