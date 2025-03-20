import Link from "next/link";
import { notFound } from "next/navigation";
import { Github, Linkedin, Mail } from "lucide-react";
import type { Post, Tag, User, Profile } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type PostWithTags = Post & { tags: Tag[] };
type UserWithProfile = User & { profile?: Profile | null };

// 获取用户信息
async function getUserById(userId: string): Promise<UserWithProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true
      }
    });
    
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

// 获取用户最新文章
async function getUserLatestPosts(userId: string): Promise<PostWithTags[]> {
  // 构建API URL
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/public/posts?limit=3&userId=${userId}`;
  
  const response = await fetch(apiUrl, { 
    next: { revalidate: 60 } // 每60秒重新验证数据
  });
  
  if (!response.ok) {
    console.error('Failed to fetch user posts');
    return [];
  }
  
  return response.json();
}

export default async function UserHomePage({
  params
}: {
  params: Promise<{ userId: string }>
}) {
  const actualParams = await params;
  const userId = actualParams.userId;
  const user = await getUserById(userId);
  
  // 如果用户不存在，返回404
  if (!user) {
    notFound();
  }
  
  const posts = await getUserLatestPosts(userId);
  const profile = user.profile || null;

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img 
              src={user.image} 
              alt={user.name || '用户头像'} 
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
              {user.name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">{profile?.title || ''}</h1>
          </div>
        </div>
        
        <p className="text-muted-foreground max-w-[600px]">
          {profile?.signature || ""}
        </p>
        
        <div className="flex flex-wrap gap-4">
          {profile?.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          
          {profile?.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          
          {profile?.contactEmail && (
            <a
              href={`mailto:${profile.contactEmail}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="邮箱"
            >
              <Mail className="h-5 w-5" />
            </a>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">最新文章</h2>
          <Link href={`/${userId}/posts`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            查看全部
          </Link>
        </div>
        
        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: PostWithTags) => (
              <article key={post.id} className="group space-y-2">
                <Link href={`/${userId}/posts/${post.slug}`}>
                  <h3 className="text-lg font-medium leading-tight group-hover:underline">{post.title}</h3>
                </Link>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                        {post.tags.map((tag: Tag, index: number) => (
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
      </section>
    </div>
  );
}
