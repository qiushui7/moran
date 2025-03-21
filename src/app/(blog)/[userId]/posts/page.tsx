import Link from "next/link";
import { notFound } from "next/navigation";
import type { Post, Tag, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

// 获取用户所有文章
async function getUserPosts(userId: string): Promise<PostWithTags[]> {
  try {
    // 使用Prisma直接查询数据库
    const posts = await prisma.post.findMany({
      where: {
        userId: userId,
        published: true, // 只获取已发布的文章
      },
      include: {
        tags: true, // 包含标签数据
      },
      orderBy: {
        createdAt: 'desc', // 按创建时间降序排列
      },
    });
    
    return posts;
  } catch (error) {
    console.error('获取用户文章失败:', error);
    return [];
  }
}

export const generateMetadata = async ({ params }: { params: Promise<{ userId: string }> }) => {
  const actualParams = await params;
  const userId = actualParams.userId;
  const user = await getUserById(userId);
  
  if (!user) {
    return {
      title: "用户不存在 - 墨染",
      description: "找不到请求的用户"
    };
  }
  
  return {
    title: `${user.name || '用户'}的文章列表 - 墨染`,
    description: `浏览${user.name || '用户'}的所有博客文章`,
  };
};

export default async function UserPostsPage({
  params
}: {
  params: Promise<{ userId: string }>
}) {
  const actualParams = await params;  
  const userId = actualParams.userId;
  
  // 获取用户信息
  const user = await getUserById(userId);
  if (!user) {
    notFound();
  }
  
  // 获取用户文章
  const posts = await getUserPosts(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{user.name || '用户'}的文章列表</h1>
        <p className="text-muted-foreground mt-2">浏览所有博客文章</p>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-10">
          {posts.map((post) => (
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
        <p className="text-muted-foreground">该用户暂无文章发布。</p>
      )}
    </div>
  );
} 