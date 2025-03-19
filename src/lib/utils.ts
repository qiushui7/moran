import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
}

export function getStatusStyle(published: boolean) {
  return published
    ? "bg-green-100 text-green-700"
    : "bg-amber-100 text-amber-700"
}

export function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export function truncateText(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}
