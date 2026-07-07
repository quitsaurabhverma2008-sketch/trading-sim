"use client"

import { useMemo } from "react"
import { usePortfolioStore } from "@/stores/portfolioStore"
import { useBenchmarkData } from "@/hooks/useBenchmarkData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { DEFAULT_DEMO_BALANCE } from "@/lib/constants"

export function BenchmarkComparison() {
  const trades = usePortfolioStore((s) => s.trades)
  const positions = usePortfolioStore((s) => s.positions)
  const cashBalance = usePortfolioStore((s) => s.cashBalance)
  const { data, loading } = useBenchmarkData()

  const currentValue = cashBalance + positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0)
  const totalReturn = ((currentValue - DEFAULT_DEMO_BALANCE) / DEFAULT_DEMO_BALANCE) * 100

  const benchmarks = useMemo(() => {
    const result: { name: string; color: string; return: number; direction: "up" | "down" | "flat" }[] = []

    for (const b of [
      { symbol: "BTCUSDT", name: "Bitcoin", color: "#f7931a" },
      { symbol: "ETHUSDT", name: "Ethereum", color: "#627eea" },
      { symbol: "SPY", name: "S&P 500", color: "#00b300" },
    ]) {
      const points = data[b.symbol]
      if (points && points.length > 0) {
        const firstVal = points[0]?.value ?? 0
        const lastVal = points[points.length - 1]?.value ?? 0
        const bReturn = lastVal - firstVal
        result.push({
          name: b.name,
          color: b.color,
          return: bReturn,
          direction: bReturn > 0 ? "up" : bReturn < 0 ? "down" : "flat",
        })
      }
    }
    return result
  }, [data])

  if (loading) return null

  if (benchmarks.length === 0) return null

  return (
    <Card>
      <CardHeader className="p-3 pb-1 flex-row items-center gap-2">
        <CardTitle className="text-sm font-medium">Portfolio vs Benchmarks</CardTitle>
        <Badge variant="outline" className="text-[10px]">90d</Badge>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md bg-muted/30">
            <span className="font-semibold">Your Portfolio</span>
            <span className={cn("font-mono font-bold", totalReturn >= 0 ? "text-emerald-500" : "text-red-500")}>
              {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}%
            </span>
          </div>
          {benchmarks.map((b) => (
            <div key={b.name} className="flex items-center justify-between text-sm py-1 px-2">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                <span>{b.name}</span>
              </div>
              <span className={cn("font-mono", b.direction === "up" ? "text-emerald-500" : b.direction === "down" ? "text-red-500" : "")}>
                {b.direction === "up" ? <TrendingUp className="h-3 w-3 inline mr-1" /> : b.direction === "down" ? <TrendingDown className="h-3 w-3 inline mr-1" /> : <Minus className="h-3 w-3 inline mr-1" />}
                {b.return >= 0 ? "+" : ""}{b.return.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
