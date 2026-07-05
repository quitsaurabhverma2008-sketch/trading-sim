"use client"

import { useState } from "react"
import { usePortfolioStore } from "@/stores/portfolioStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatPrice, formatCurrency, formatPercent, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

export function TradeHistory() {
  const { trades } = usePortfolioStore()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all")

  const filtered = trades.filter((t) => {
    if (filter !== "all" && t.side !== filter) return false
    if (search && !t.assetSymbol.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Trade History</CardTitle>
          <Badge variant="outline" className="text-xs">
            {trades.length} trades
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 text-xs pl-7"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "buy", "sell"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-xs px-2 py-1 rounded-md transition-colors",
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {f === "all" ? "All" : f === "buy" ? "Buys" : "Sells"}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {filtered.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-8">
              No trades yet
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((trade) => (
                <div key={trade.id} className="px-4 py-2.5 flex items-center justify-between text-sm hover:bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        trade.side === "buy"
                          ? "border-emerald-500 text-emerald-500"
                          : "border-red-500 text-red-500"
                      )}
                    >
                      {trade.side.toUpperCase()}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium">
                        {trade.assetSymbol.replace("USDT", "")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {trade.quantity.toFixed(4)} @ {formatPrice(trade.price)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{formatCurrency(trade.total)}</div>
                    {trade.pnl !== 0 && (
                      <div
                        className={cn(
                          "text-[10px] font-mono",
                          trade.pnl >= 0 ? "text-emerald-500" : "text-red-500"
                        )}
                      >
                        {trade.pnl >= 0 ? "+" : ""}
                        {formatCurrency(trade.pnl)} ({formatPercent(trade.pnlPercent)})
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground">
                      {formatDate(trade.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
