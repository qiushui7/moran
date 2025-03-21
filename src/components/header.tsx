
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { TypeWriter } from "./type-writer";
import UserNavLink from "./user-navLink";

const NAV_ITEMS = [
  { label: "首页", href: `` },
  { label: "文章", href: `/posts` },
  { label: "标签", href: `/tags` },
  { label: "关于", href: `/about` },
];

export default async function Header(
  {bio}: {bio: string[]}
) {
  return (
    <header className="py-6 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tight flex items-center">
        <div className="inline-block min-w-24">
          <TypeWriter 
            texts={bio} 
            typingSpeed={120}
            deletingSpeed={80}
            delayBetweenTexts={2000}
            className="text-primary"
          />
        </div>
      </Link>
      <nav className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {          
            return (
              <UserNavLink key={item.href} href={item.href} label={item.label} />
            );
          })}
        </div>
        <ThemeToggle />
      </nav>
    </header>
  );
} 