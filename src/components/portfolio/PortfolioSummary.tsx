"use client"

import { useMemo } from "react"
import { usePortfolioStore } from "@/stores/portfolioStore"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Wallet, TrendingUp, BarChart3, Activity } from "lucide-react"
import { DEFAULT_DEMO_BALANCE } from "@/lib/constants"

export function PortfolioSummary() {
  const cashBalance = usePortfolioStore((s) => s.cashBalance)
  const positions = usePortfolioStore((s) => s.positions)
  const trades = usePortfolioStore((s) => s.trades)

  const summary = useMemo(() => {
    const positionsValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0)
    const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl + (p.realizedPnl ?? 0), 0)
    const totalPnlPercent = DEFAULT_DEMO_BALANCE > 0
      ? ((cashBalance + positionsValue - DEFAULT_DEMO_BALANCE) / DEFAULT_DEMO_BALANCE) * 100
      : 0
    const winning = trades.filter((t) => t.pnl > 0).length
    const losing = trades.filter((t) => t.pnl < 0).length

    return {
      totalBalance: cashBalance + positionsValue,
      cashBalance,
      positionsValue,
      totalPnl,
      totalPnlPercent,
      winRate: trades.length > 0 ? (winning / trades.length) * 100 : 0,
      totalTrades: trades.length,
      winningTrades: winning,
      losingTrades: losing,
    }
  }, [cashBalance, positions, trades])

  const items = [
    {
      label: "Total Balance",
      value: formatCurrency(summary.totalBalance),
      icon: Wallet,
      color: "text-blue-500",
    },
    {
      label: "Cash",
      value: formatCurrency(summary.cashBalance),
      icon: BarChart3,
      color: "text-emerald-500",
    },
    {
      label: "Positions",
      value: formatCurrency(summary.positionsValue),
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      label: "P&L",
      value: `${summary.totalPnl >= 0 ? "+" : ""}${formatCurrency(summary.totalPnl)} (${summary.totalPnlPercent >= 0 ? "+" : ""}${summary.totalPnlPercent.toFixed(2)}%)`,
      icon: Activity,
      color: summary.totalPnl >= 0 ? "text-emerald-500" : "text-red-500",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="card-glow glass border-border/30 transition-all duration-300 hover:border-border/60">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <div className={cn("text-lg font-bold font-mono transition-colors duration-300", item.label === "P&L" ? item.color : "")}>
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
