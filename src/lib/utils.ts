import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function formatCurrency(value: number, currency = "USD"): string {
  const symbols: Record<string, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£" }
  const sym = symbols[currency] || "$"
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${sym}${(value / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sym}${(value / 1_000).toFixed(2)}K`
  return `${sym}${value.toFixed(2)}`
}

export function formatPrice(value: number, precision = 2): string {
  if (value >= 1000) return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: precision })
  if (value >= 1) return value.toFixed(precision)
  return value.toFixed(Math.max(precision, 4))
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`
  return value.toFixed(2)
}

export function formatTime(timestamp: number, format: "short" | "long" = "short"): string {
  const d = new Date(timestamp)
  if (format === "short") {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  }
  return d.toLocaleString()
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let last = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - last >= ms) {
      last = now
      fn(...args)
    }
  }
}
