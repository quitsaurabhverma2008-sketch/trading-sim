"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useUIStore } from "@/stores/uiStore"
import { usePortfolioStore } from "@/stores/portfolioStore"
import { useMarketStore } from "@/stores/marketStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { APP_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  LayoutGrid,
  Wallet,
  Brain,
  Menu,
  TrendingUp,
  Bell,
  Settings,
  Star,
  LogOut,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Star },
  { href: "/dashboard/screeners", label: "Screeners", icon: LayoutGrid },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Header() {
  const pathname = usePathname()
  const { toggleSidebar, toggleAIPanel } = useUIStore()
  const { cashBalance, getSummary } = usePortfolioStore()
  const { connectionStatus } = useMarketStore()
  const summary = getSummary()

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

      <div className="ml-auto flex items-center gap-3">
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
