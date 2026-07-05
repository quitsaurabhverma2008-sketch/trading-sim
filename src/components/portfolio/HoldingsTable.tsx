"use client"

import { usePortfolioStore } from "@/stores/portfolioStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatPrice, formatCurrency, formatPercent } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export function HoldingsTable() {
  const { positions, cashBalance } = usePortfolioStore()

  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Holdings</CardTitle>
        <Badge variant="outline" className="text-xs">
          {positions.length} positions
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          {positions.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-8">
              No open positions
            </div>
          ) : (
            <div className="divide-y">
              {positions.map((pos) => (
                <div key={pos.assetSymbol} className="px-4 py-3 flex items-center justify-between text-sm hover:bg-muted/30">
                  <div>
                    <div className="font-medium">{pos.assetSymbol.replace("USDT", "")}</div>
                    <div className="text-xs text-muted-foreground">
                      {pos.quantity.toFixed(4)} @ {formatPrice(pos.avgEntryPrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{formatCurrency(pos.currentPrice * pos.quantity)}</div>
                    <div
                      className={cn(
                        "text-xs font-mono",
                        pos.unrealizedPnl >= 0 ? "text-emerald-500" : "text-red-500"
                      )}
                    >
                      {pos.unrealizedPnl >= 0 ? "+" : ""}
                      {formatCurrency(pos.unrealizedPnl)} ({formatPercent(pos.unrealizedPnlPercent)})
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
