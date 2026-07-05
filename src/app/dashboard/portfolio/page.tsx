"use client"

import { usePortfolioStore } from "@/stores/portfolioStore"
import { useMarketStore } from "@/stores/marketStore"
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary"
import { HoldingsTable } from "@/components/portfolio/HoldingsTable"
import { PerformanceMetrics } from "@/components/portfolio/PerformanceMetrics"
import { TradeHistory } from "@/components/trading/TradeHistory"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatPercent, formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function PortfolioPage() {
  const { cashBalance, positions, getSummary } = usePortfolioStore()
  const { realtimePrices } = useMarketStore()
  const summary = getSummary()

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Track your performance and holdings</p>
      </div>

      <PortfolioSummary />
      <PerformanceMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HoldingsTable />

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Account Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {[
              { label: "Total Balance", value: formatCurrency(summary.totalBalance) },
              { label: "Cash Available", value: formatCurrency(summary.cashBalance) },
              { label: "Positions Value", value: formatCurrency(summary.positionsValue) },
              { label: "Unrealized P&L", value: `${summary.totalPnl >= 0 ? "+" : ""}${formatCurrency(summary.totalPnl)}`, color: summary.totalPnl >= 0 ? "text-emerald-500" : "text-red-500" },
              { label: "Win Rate", value: `${summary.winRate.toFixed(1)}%` },
              { label: "Total Trades", value: String(summary.totalTrades) },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={cn("font-mono font-medium", row.color ?? "")}>{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <TradeHistory />
    </div>
  )
}
