import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Admin-entered links are only rendered when they are absolute HTTP(S) URLs.
export function httpHref(raw: string | null): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}
