"use client"

import { useEffect, useState } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { CRYPTO_SYMBOLS } from "@/lib/constants"
import { formatPrice, formatPercent, formatVolume } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { fetchAllTickers } from "@/lib/market/binance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUp, ArrowDown } from "lucide-react"

interface TickerItem {
  symbol: string
  name: string
  price: number
  changePercent: number
  volume: number
}

export function GainersLosers() {
  const [all, setAll] = useState<TickerItem[]>([])
  const [loading, setLoading] = useState(true)
  const { setActiveSymbol } = useMarketStore()

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const tickers = await fetchAllTickers()
        if (!mounted) return

        const cryptoSet = new Set(CRYPTO_SYMBOLS.map((s) => s.symbol))
        const symbolMap = new Map(CRYPTO_SYMBOLS.map((s) => [s.symbol, s.name]))

        const items = tickers
          .filter((t) => cryptoSet.has(t.symbol))
          .map((t) => ({
            symbol: t.symbol,
            name: symbolMap.get(t.symbol) ?? t.symbol,
            price: t.lastPrice,
            changePercent: t.priceChangePercent,
            volume: t.volume,
          }))

        setAll(items)
      } catch {
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 60000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const gainers = [...all].sort((a, b) => b.changePercent - a.changePercent).slice(0, 10)
  const losers = [...all].sort((a, b) => a.changePercent - b.changePercent).slice(0, 10)
  const mostActive = [...all].sort((a, b) => b.volume - a.volume).slice(0, 10)

  function renderList(items: TickerItem[]) {
    return items.map((item, i) => (
      <button
        key={item.symbol}
        onClick={() => setActiveSymbol(item.symbol)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted/50 rounded-md transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
          <div className="text-left">
            <div className="font-medium text-sm">{item.symbol.replace("USDT", "")}</div>
            <div className="text-[10px] text-muted-foreground">{item.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm">{formatPrice(item.price)}</div>
          <div className={cn("text-xs font-mono", item.changePercent >= 0 ? "text-emerald-500" : "text-red-500")}>
            {formatPercent(item.changePercent)}
          </div>
        </div>
      </button>
    ))
  }

  if (loading) {
    return <div className="text-center text-muted-foreground text-xs py-8">Loading screeners...</div>
  }

  return (
    <Tabs defaultValue="gainers">
      <TabsList className="w-full">
        <TabsTrigger value="gainers" className="flex-1 text-xs">
          <ArrowUp className="h-3 w-3 mr-1 text-emerald-500" />
          Gainers
        </TabsTrigger>
        <TabsTrigger value="losers" className="flex-1 text-xs">
          <ArrowDown className="h-3 w-3 mr-1 text-red-500" />
          Losers
        </TabsTrigger>
        <TabsTrigger value="active" className="flex-1 text-xs">
          Volume
        </TabsTrigger>
      </TabsList>
      <TabsContent value="gainers" className="mt-2">{renderList(gainers)}</TabsContent>
      <TabsContent value="losers" className="mt-2">{renderList(losers)}</TabsContent>
      <TabsContent value="active" className="mt-2">{renderList(mostActive)}</TabsContent>
    </Tabs>
  )
}
