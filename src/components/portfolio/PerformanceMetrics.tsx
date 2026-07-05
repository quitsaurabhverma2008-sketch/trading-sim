"use client"

import { useMemo } from "react"
import { usePortfolioStore } from "@/stores/portfolioStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DEFAULT_DEMO_BALANCE } from "@/lib/constants"

export function PerformanceMetrics() {
  const cashBalance = usePortfolioStore((s) => s.cashBalance)
  const positions = usePortfolioStore((s) => s.positions)
  const trades = usePortfolioStore((s) => s.trades)

  const summary = useMemo(() => {
    const winning = trades.filter((t) => t.pnl > 0).length
    const losing = trades.filter((t) => t.pnl < 0).length
    const positionsValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0)
    const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl + (p.realizedPnl ?? 0), 0)
    const totalPnlPercent = DEFAULT_DEMO_BALANCE > 0
      ? ((cashBalance + positionsValue - DEFAULT_DEMO_BALANCE) / DEFAULT_DEMO_BALANCE) * 100
      : 0

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

  const metrics = [
    { label: "Win Rate", value: `${summary.winRate.toFixed(1)}%` },
    { label: "Total Trades", value: String(summary.totalTrades) },
    { label: "Winning", value: String(summary.winningTrades) },
    { label: "Losing", value: String(summary.losingTrades) },
  ]

  if (summary.totalTrades === 0) return null

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium">Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-lg font-bold font-mono">{m.value}</div>
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
