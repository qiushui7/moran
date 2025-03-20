import Link from "next/link";
import { ArrowRightIcon, UserIcon, PencilIcon, TagIcon, BookOpenIcon, PaletteIcon, HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// 为每个部署指定一个默认用户ID
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero区域 */}
      <section className="py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">墨染</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          一个简洁、现代的博客平台，让你专注于内容创作，展示你的思想和见解。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10 px-4">
          {/* 左侧特色功能 */}
          <div className="p-8 bg-card text-card-foreground border rounded-lg shadow-sm flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">特色功能</h2>
            <div className="flex-1 flex items-center justify-center">
                <ul className="space-y-4 text-left w-full">
                <li className="flex items-start">
                    <span className="bg-primary/10 text-primary p-1 rounded mr-3 mt-1">
                    <PencilIcon className="h-4 w-4" />
                    </span>
                    <div>
                    <span className="font-medium">简洁的编辑体验</span>
                    <p className="text-muted-foreground">专注于写作，支持Markdown，让创作变得轻松自然</p>
                    </div>
                </li>
                <li className="flex items-start">
                    <span className="bg-primary/10 text-primary p-1 rounded mr-3 mt-1">
                    <TagIcon className="h-4 w-4" />
                    </span>
                    <div>
                    <span className="font-medium">标签管理</span>
                    <p className="text-muted-foreground">为文章添加标签，让内容更有条理，方便读者浏览</p>
                    </div>
                </li>
                <li className="flex items-start">
                    <span className="bg-primary/10 text-primary p-1 rounded mr-3 mt-1">
                    <UserIcon className="h-4 w-4" />
                    </span>
                    <div>
                    <span className="font-medium">个性化博客</span>
                    <p className="text-muted-foreground">每个用户拥有独立的博客空间，展示自己的个性和专业</p>
                    </div>
                </li>
                </ul>
            </div>
          </div>
          
          {/* 右侧展示区域 */}
          <div className="p-8 bg-card text-card-foreground border rounded-lg shadow-sm flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">适合各类创作者</h2>
            <div className="grid grid-cols-2 gap-4 flex-grow">
              <div className="p-4 bg-primary/5 rounded-lg flex flex-col items-center text-center">
                <BookOpenIcon className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">作家</h3>
                <p className="text-sm text-muted-foreground">发表你的故事、随笔和创作灵感</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary mb-2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                <h3 className="font-medium">教育者</h3>
                <p className="text-sm text-muted-foreground">分享知识、教程和学习资源</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg flex flex-col items-center text-center">
                <PaletteIcon className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">创意工作者</h3>
                <p className="text-sm text-muted-foreground">展示你的作品集和创作过程</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg flex flex-col items-center text-center">
                <HeartIcon className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">爱好者</h3>
                <p className="text-sm text-muted-foreground">记录你的兴趣和热爱的事物</p>
              </div>
            </div>
            <div className="mt-6 text-sm text-center text-muted-foreground">
              <p>无论你是专业写作者还是业余爱好者，墨染博客都能满足你的需求</p>
            </div>
          </div>
        </div>
        
        <div className="mt-10">
          <Link href={'/admin'}>
            <Button size="lg" className="group">
              立即探索
              <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* 统计数据 */}
      <section className="py-16 bg-accent">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold mb-8">为什么选择墨染博客？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2v20"></path><path d="m17 5-5-3-5 3"></path><path d="m17 19-5 3-5-3"></path><path d="M12 10v4"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">简约设计</h3>
              <p className="text-muted-foreground">专注于内容展示，没有多余的干扰元素</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z"></path><path d="M12 12v.01"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">现代技术</h3>
              <p className="text-muted-foreground">基于Next.js构建，快速加载，响应灵敏</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">内容优先</h3>
              <p className="text-muted-foreground">专注于写作和阅读体验的优化</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 示例展示 */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">简单，直观的操作界面</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="p-4 md:p-8 relative">
              <div className="aspect-[4/3] bg-accent/30 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="w-4/5 mx-auto bg-background rounded-md p-4 shadow-lg">
                  <div className="h-4 w-1/3 mb-4 bg-primary/20 rounded"></div>
                  <div className="h-20 bg-primary/10 rounded mb-4"></div>
                  <div className="h-4 w-3/4 bg-primary/20 rounded mb-2"></div>
                  <div className="h-4 w-2/3 bg-primary/20 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-primary/20 rounded"></div>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-5 bg-background rounded-full p-2 shadow-lg border">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-10 w-10"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">集中精力于创作</h3>
              <p className="text-muted-foreground mb-6">
                现代化的写作界面帮助你专注于内容本身，而不是复杂的排版和技术问题。支持Markdown格式，让你的文章结构清晰，排版美观。
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <span>实时预览，所见即所得</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <span>自动保存，不怕内容丢失</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <span>简洁的分类与标签管理</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* 行动召唤 */}
      <section className="py-20 text-center bg-accent">
        <h2 className="text-3xl font-bold tracking-tight mb-6">开始你的写作之旅</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          加入我们的博客平台，分享你的观点和见解，与读者建立联系。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/${DEFAULT_USER_ID}`}>
            <Button size="lg" variant="outline" className="px-8">
              查看博客示例
            </Button>
          </Link>
        </div>
      </section>
      
      {/* 页脚 */}
      <footer className="py-10 border-t">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} 墨染博客平台 - 一个简约、现代的博客系统</p>
        </div>
      </footer>
    </div>
  );
}
