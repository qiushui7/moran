"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { LogOut, Tag, User } from "lucide-react"
import Link from "next/link"

interface BottomToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  onTagManage?: () => void
  onLogout?: () => void
  activeItem?: string
}

export function BottomToolbar({
  className,
  onTagManage,
  onLogout,
  activeItem,
  ...props
}: BottomToolbarProps) {
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null)

  return (
    <div className={cn("relative", className)} {...props}>
      {activeTooltip && (
        <div
          className="absolute left-0 right-0 -top-[31px] pointer-events-none z-50"
        >
          <div
            className={cn(
              "h-7 px-3 rounded-lg inline-flex justify-center items-center overflow-hidden",
              "bg-background/95 backdrop-blur",
              "border border-border/50",
              "shadow-[0_0_0_1px_rgba(0,0,0,0.08)]",
              "dark:border-border/50 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            )}
            style={{ 
              position: "absolute", 
              left: activeTooltip === "tags" ? "5px" : (activeTooltip === "profile" ? "calc(50% - 45px)" : "auto"),
              right: activeTooltip === "logout" ? "5px" : "auto",
              width: "auto" 
            }}
          >
            <p className="text-[13px] font-medium leading-tight whitespace-nowrap">
              {activeTooltip === "tags" ? "标签管理" : (activeTooltip === "profile" ? "个人资料" : "退出登录")}
            </p>
          </div>
        </div>
      )}
      
      <div 
        className={cn(
          "h-8 px-1.5 inline-flex justify-center items-center gap-[2px] overflow-hidden z-10",
          "rounded-full bg-background/95 backdrop-blur",
          "border border-border/50",
          "shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_16px_-4px_rgba(0,0,0,0.1)]",
          "dark:border-border/50 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_16px_-4px_rgba(0,0,0,0.2)]"
        )}
      >
        <Link 
          href="/admin/tags"
          data-tooltip="tags"
          className={cn(
            "w-8 h-8 rounded-full flex justify-center items-center",
            "hover:bg-muted/80 transition-colors",
            activeItem === "tags" ? "bg-primary/10 text-primary" : ""
          )}
          onMouseEnter={() => setActiveTooltip("tags")}
          onMouseLeave={() => setActiveTooltip(null)}
          onClick={onTagManage}
        >
          <div className="flex justify-center items-center">
            <div className="w-[16px] h-[16px] flex justify-center items-center overflow-hidden">
              <Tag className="w-full h-full" />
            </div>
          </div>
          <span className="sr-only">标签管理</span>
        </Link>
        
        <Link 
          href="/admin/profile"
          data-tooltip="profile"
          className={cn(
            "w-8 h-8 rounded-full flex justify-center items-center",
            "hover:bg-muted/80 transition-colors",
            activeItem === "profile" ? "bg-primary/10 text-primary" : ""
          )}
          onMouseEnter={() => setActiveTooltip("profile")}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex justify-center items-center">
            <div className="w-[16px] h-[16px] flex justify-center items-center overflow-hidden">
              <User className="w-full h-full" />
            </div>
          </div>
          <span className="sr-only">个人资料</span>
        </Link>
        
        <button 
          data-tooltip="logout"
          className="w-8 h-8 rounded-full flex justify-center items-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          onMouseEnter={() => setActiveTooltip("logout")}
          onMouseLeave={() => setActiveTooltip(null)}
          onClick={onLogout}
        >
          <div className="flex justify-center items-center">
            <div className="w-[16px] h-[16px] flex justify-center items-center overflow-hidden">
              <LogOut className="w-full h-full" />
            </div>
          </div>
          <span className="sr-only">退出登录</span>
        </button>
      </div>
    </div>
  )
} 