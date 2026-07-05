"use client"

import { useUIStore } from "@/stores/uiStore"
import { usePortfolioStore } from "@/stores/portfolioStore"
import { useWatchlistStore } from "@/stores/watchlistStore"
import { useMarketStore } from "@/stores/marketStore"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { formatPrice, formatPercent, formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Star, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { CRYPTO_SYMBOLS, STOCK_SYMBOLS } from "@/lib/constants"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Sidebar() {
  const { sidebarOpen, sidebarView, setSidebarView } = useUIStore()
  const { positions, getSummary } = usePortfolioStore()
  const watchlist = useWatchlistStore()
  const summary = getSummary()

  if (!sidebarOpen) return null

  return (
    <aside className="w-72 border-r flex flex-col bg-background shrink-0 overflow-hidden">
      <div className="p-3">
        <Tabs
          value={sidebarView}
          onValueChange={(v) => setSidebarView(v as "watchlist" | "portfolio")}
        >
          <TabsList className="w-full">
            <TabsTrigger value="watchlist" className="flex-1 text-xs">
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex-1 text-xs">
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="mt-3">
            <WatchlistContent />
          </TabsContent>

          <TabsContent value="portfolio" className="mt-3">
            <PortfolioContent />
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  )
}

function WatchlistContent() {
  const watchlist = useWatchlistStore()
  const { realtimePrices, tickers, setActiveSymbol } = useMarketStore()

  const allSymbols = [...CRYPTO_SYMBOLS.map((s) => ({ ...s, type: "crypto" as const })), ...STOCK_SYMBOLS.map((s) => ({ ...s, type: "stock" as const }))]

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium">Symbols</span>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {allSymbols.slice(0, 20).map((s) => {
        const isWatched = watchlist.items.some((i) => i.symbol === s.symbol)
        const price = realtimePrices[s.symbol] ?? 0
        const ticker = tickers[s.symbol]
        const change = ticker?.priceChangePercent ?? 0
        const isUp = change >= 0

        return (
          <div
            key={s.symbol}
            onClick={() => setActiveSymbol(s.symbol)}
            className={cn(
              "flex items-center justify-between px-2 py-1.5 rounded-md text-sm cursor-pointer",
              "hover:bg-accent/50 transition-colors"
            )}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); watchlist.toggle(s.symbol, s.name, s.type) }}
                className="text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                <Star className={cn("h-3.5 w-3.5", isWatched && "fill-yellow-500 text-yellow-500")} />
              </button>
              <div>
                <div className="font-medium text-sm leading-tight">{s.symbol.replace("USDT", "")}</div>
                <div className="text-xs text-muted-foreground leading-tight">{s.name.slice(0, 16)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono">
                {price > 0 ? formatPrice(price, 2) : "—"}
              </div>
              {ticker && (
                <div className={cn("text-xs font-mono", isUp ? "text-emerald-500" : "text-red-500")}>
                  {isUp ? "+" : ""}{change.toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PortfolioContent() {
  const { positions, getSummary, cashBalance } = usePortfolioStore()
  const summary = getSummary()

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Balance</div>
          <div className="text-lg font-bold font-mono">{formatCurrency(cashBalance)}</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Positions</div>
          <div className="text-lg font-bold font-mono">{formatCurrency(summary.positionsValue)}</div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-3">
        <div className="text-xs text-muted-foreground">P&L</div>
        <div
          className={cn(
            "text-lg font-bold font-mono",
            summary.totalPnl >= 0 ? "text-emerald-500" : "text-red-500"
          )}
        >
          {summary.totalPnl >= 0 ? "+" : ""}
          {formatCurrency(summary.totalPnl)}
          <span className="text-sm ml-1">
            ({summary.totalPnlPercent >= 0 ? "+" : ""}
            {summary.totalPnlPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <Separator />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Positions</span>
          <span className="text-xs text-muted-foreground">{positions.length} held</span>
        </div>

        {positions.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-4">
            No open positions
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-420px)]">
          {positions.map((pos) => (
            <div
              key={pos.assetSymbol}
              className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-accent/50 transition-colors"
            >
              <div>
                <div className="text-sm font-medium">{pos.assetSymbol.replace("USDT", "")}</div>
                <div className="text-xs text-muted-foreground">
                  {pos.quantity.toFixed(4)} @ {formatPrice(pos.avgEntryPrice)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono">{formatPrice(pos.currentPrice * pos.quantity)}</div>
                <div
                  className={cn(
                    "text-xs font-mono",
                    pos.unrealizedPnl >= 0 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {pos.unrealizedPnl >= 0 ? "+" : ""}
                  {formatPercent(pos.unrealizedPnlPercent)}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  )
}
