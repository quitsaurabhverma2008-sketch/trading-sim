"use client"

import { useEffect, useState } from "react"
import { useWatchlistStore } from "@/stores/watchlistStore"
import { useAlertsStore } from "@/stores/alertsStore"
import { useAlertChecker } from "@/hooks/useAlertChecker"
import { useMarketStore } from "@/stores/marketStore"
import { CRYPTO_SYMBOLS, STOCK_SYMBOLS } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertModal } from "@/components/watchlist/AlertModal"
import { formatPrice, formatPercent } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Star, Trash2, Search, Bell, BellOff } from "lucide-react"
import { toast } from "sonner"
import { fetchAllTickers } from "@/lib/market/binance"

export default function WatchlistPage() {
  useAlertChecker()
  const watchlist = useWatchlistStore()
  const alerts = useAlertsStore()
  const { setActiveSymbol, realtimePrices, tickers } = useMarketStore()
  const [search, setSearch] = useState("")
  const [allTickers, setAllTickers] = useState<Record<string, { price: number; change: number; changePercent: number }>>({})
  const [view, setView] = useState<"all" | "watched">("all")

  const allSymbols = [
    ...CRYPTO_SYMBOLS.map((s) => ({ ...s, type: "crypto" as const })),
    ...STOCK_SYMBOLS.map((s) => ({ ...s, type: "stock" as const })),
  ]

  useEffect(() => {
    fetchAllTickers().then((tickers) => {
      const map: Record<string, { price: number; change: number; changePercent: number }> = {}
      for (const t of tickers) {
        map[t.symbol] = { price: t.lastPrice, change: t.priceChange, changePercent: t.priceChangePercent }
      }
      setAllTickers(map)
    })
  }, [])

  const filtered = allSymbols.filter((s) => {
    if (view === "watched" && !watchlist.items.some((w) => w.symbol === s.symbol)) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.symbol.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const activeAlerts = alerts.items.filter((a) => !a.triggered)

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Watchlist</h1>
          <p className="text-sm text-muted-foreground">
            {watchlist.items.length} watched · {activeAlerts.length} active alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "all" ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setView("all")}
          >
            All
          </Button>
          <Button
            variant={view === "watched" ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setView("watched")}
          >
            Watched
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search symbols..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 text-sm"
        />
      </div>

      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium flex items-center gap-1">
              <Bell className="h-3.5 w-3.5" />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {activeAlerts.map((alert) => (
                <Badge key={alert.id} variant="outline" className="text-[10px] gap-1">
                  {alert.symbol.replace("USDT", "")} {alert.direction === "above" ? "↑" : "↓"} {formatPrice(alert.price)}
                  <button onClick={() => alerts.remove(alert.id)} className="hover:text-destructive">
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-1">
        {filtered.map((s) => {
          const isWatched = watchlist.items.some((w) => w.symbol === s.symbol)
          const ticker = allTickers[s.symbol]
          const price = realtimePrices[s.symbol] ?? ticker?.price ?? 0
          const change = ticker?.changePercent ?? 0
          const isUp = change >= 0

          return (
            <div
              key={s.symbol}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setActiveSymbol(s.symbol)}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    watchlist.toggle(s.symbol, s.name, s.type)
                    toast(isWatched ? "Removed from watchlist" : "Added to watchlist")
                  }}
                  className="text-muted-foreground hover:text-yellow-500 transition-colors"
                >
                  <Star className={cn("h-4 w-4", isWatched && "fill-yellow-500 text-yellow-500")} />
                </button>
                <div>
                  <div className="font-medium text-sm">{s.symbol.replace("USDT", "")}</div>
                  <div className="text-xs text-muted-foreground">{s.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono text-sm">{price > 0 ? formatPrice(price) : "—"}</div>
                  {price > 0 && (
                    <div className={cn("text-xs font-mono", isUp ? "text-emerald-500" : "text-red-500")}>
                      {formatPercent(change)}
                    </div>
                  )}
                </div>
                {price > 0 && (
                  <AlertModal symbol={s.symbol} currentPrice={price} type={s.type} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
