"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { TypeWriter } from "./type-writer";

const NAV_ITEMS = [
  { label: "首页", href: "/" },
  { label: "文章", href: "/posts" },
  { label: "标签", href: "/tags" },
  { label: "关于", href: "/about" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="py-6 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tight flex items-center">
        <span className="mr-1">Hi, I'm</span>
        <div className="inline-block min-w-24">
          <TypeWriter 
            texts={["Benjamin", "a full-stack developer"]} 
            typingSpeed={120}
            deletingSpeed={80}
            delayBetweenTexts={2000}
            className="text-primary"
          />
        </div>
      </Link>
      <nav className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm hover:text-foreground transition-colors ${
                pathname === item.href
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <ThemeToggle />
      </nav>
    </header>
  );
} 