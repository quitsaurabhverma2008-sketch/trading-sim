"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useUIStore } from "@/stores/uiStore"
import { usePortfolioStore } from "@/stores/portfolioStore"
import { useMarketStore } from "@/stores/marketStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatPrice } from "@/lib/utils"
import { APP_NAME, CRYPTO_SYMBOLS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"
import {
  LayoutDashboard,
  LayoutGrid,
  Wallet,
  Brain,
  Menu,
  TrendingUp,
  Settings,
  Star,
  BarChart3,
  BookOpen,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Star },
  { href: "/dashboard/screeners", label: "Screeners", icon: LayoutGrid },
  { href: "/dashboard/backtest", label: "Backtest", icon: BarChart3 },
  { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

const TICKER_SYMBOLS = CRYPTO_SYMBOLS.slice(0, 15).map((s) => s.symbol)

export function Header() {
  const pathname = usePathname()
  const { toggleSidebar, toggleAIPanel } = useUIStore()
  const { cashBalance, getSummary } = usePortfolioStore()
  const { connectionStatus, realtimePrices, tickers } = useMarketStore()
  const summary = getSummary()

  const tickerItems = TICKER_SYMBOLS.map((sym) => {
    const price = realtimePrices[sym] ?? 0
    const ticker = tickers[sym]
    const change = ticker?.priceChangePercent ?? 0
    return { sym, price, change }
  })

  const tickerRef = useRef<HTMLDivElement>(null)
  const [tickerPaused, setTickerPaused] = useState(false)

  useEffect(() => {
    const el = tickerRef.current
    if (!el) return
    const handleMouseEnter = () => setTickerPaused(true)
    const handleMouseLeave = () => setTickerPaused(false)
    el.addEventListener("mouseenter", handleMouseEnter)
    el.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter)
      el.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <header className="h-14 border-b flex items-center px-4 gap-2 bg-background shrink-0">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0">
        <Menu className="h-5 w-5" />
      </Button>

      <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg mr-2 shrink-0">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        <span className="hidden sm:inline">{APP_NAME}</span>
      </Link>

      <div className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1"
              >
                <item.icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </div>

      <div ref={tickerRef} className={cn("flex-1 overflow-hidden mx-2", tickerPaused ? "" : "overflow-hidden")}>
        <div className={cn("flex gap-6 animate-ticker", tickerPaused && "!animate-none")}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={`${item.sym}-${i}`} className="flex items-center gap-2 whitespace-nowrap shrink-0 text-xs">
              <span className="font-medium">{item.sym.replace("USDT", "")}</span>
              <span className="font-mono">{item.price > 0 ? formatPrice(item.price, 2) : "—"}</span>
              <span className={cn("font-mono", item.change >= 0 ? "text-emerald-500" : "text-red-500")}>
                {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1">
          <div className={`h-2 w-2 rounded-full ${connectionStatus === "connected" ? "bg-emerald-500" : "bg-red-500"}`} />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {connectionStatus === "connected" ? "Live" : "Offline"}
          </span>
        </div>

        <Badge variant="outline" className="text-sm font-mono hidden sm:flex">
          <Wallet className="h-3.5 w-3.5 mr-1.5" />
          {formatCurrency(summary.totalBalance)}
        </Badge>

        <Badge
          variant="outline"
          className={`text-sm font-mono hidden md:flex ${summary.totalPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}
        >
          {summary.totalPnl >= 0 ? "+" : ""}
          {formatCurrency(summary.totalPnl)}
        </Badge>

        <Button variant="ghost" size="icon" className="h-8 w-8 relative" onClick={toggleAIPanel}>
          <Brain className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
