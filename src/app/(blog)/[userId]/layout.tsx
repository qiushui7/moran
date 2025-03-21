import Header from "@/components/header";
import { prisma } from "@/lib/prisma";
import type { User, Profile } from "@prisma/client";

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

export default async function BlogLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ userId: string }>
}>) {
  const actualParams = await params;
  const userId = actualParams.userId;
  const user = await getUserById(userId);
  const profile = user?.profile;
  const bio = profile?.bio ? profile.bio.split('\n') : [];
  return (
      <div className="flex flex-col min-h-screen max-w-3xl mx-auto px-4">
        <Header bio={bio} />
        <main className="flex-1 py-6">{children}</main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} 保留所有权利.
        </footer>
      </div>

  );
} 