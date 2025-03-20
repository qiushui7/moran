'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'


export default function UserNavLink({ href, label }: { href: string, label: string }) {
    const pathname = usePathname();
  
    // 从路径名中获取userId
    const pathParts = pathname.split('/');
    // 路径格式为 /[userId]/...，第一个有效部分应该是userId
    const userId = pathParts[1];
    
    // 如果未找到userId，则不显示导航
    if (!userId) {
      return null;
    }
    const userHref = `/${userId}/${href}`
    const isActive = pathname === userHref

    return (
        <Link href={userHref} className={cn(
            'text-sm hover:text-foreground transition-colors',
            isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
        )}>
            {label}
        </Link>
    )
}