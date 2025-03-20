import { ReactNode } from "react";

// 认证逻辑已移至中间件，此组件现在只负责布局
export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
} 