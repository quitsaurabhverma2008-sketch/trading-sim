"use client"

import { usePortfolioStore } from "@/stores/portfolioStore"
import { useMarketStore } from "@/stores/marketStore"
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary"
import { HoldingsTable } from "@/components/portfolio/HoldingsTable"
import { PerformanceMetrics } from "@/components/portfolio/PerformanceMetrics"
import { TradeHistory } from "@/components/trading/TradeHistory"
import { BenchmarkComparison } from "@/components/portfolio/BenchmarkComparison"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Download } from "lucide-react"
import { toast } from "sonner"

function exportCSV() {
  const state = usePortfolioStore.getState()
  const trades = state.trades
  if (trades.length === 0) {
    toast.error("No trades to export")
    return
  }

  const headers = ["Date", "Symbol", "Side", "Type", "Quantity", "Price", "Total", "Fee", "PnL", "PnL%"]
  const rows = trades.map((t) => [
    new Date(t.timestamp).toISOString(),
    t.assetSymbol,
    t.side,
    t.type,
    t.quantity.toString(),
    t.price.toString(),
    t.total.toString(),
    t.fee.toString(),
    t.pnl.toString(),
    t.pnlPercent.toString(),
  ])
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `trades-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success("Trades exported to CSV")
}

export default function PortfolioPage() {
  const { cashBalance, positions, getSummary } = usePortfolioStore()
  const { realtimePrices } = useMarketStore()
  const summary = getSummary()

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Track your performance and holdings</p>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={exportCSV}>
          <Download className="h-3 w-3" />
          Export CSV
        </Button>
      </div>

      <PortfolioSummary />
      <PerformanceMetrics />

      <BenchmarkComparison />

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
