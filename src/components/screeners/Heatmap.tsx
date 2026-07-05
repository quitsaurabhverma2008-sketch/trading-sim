"use client"

import { useEffect, useState } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { CRYPTO_SYMBOLS } from "@/lib/constants"
import { formatPrice, formatPercent, formatVolume } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { fetchAllTickers } from "@/lib/market/binance"

interface HeatmapItem {
  symbol: string
  name: string
  price: number
  changePercent: number
  volume: number
  marketCap: number
}

export function CryptoHeatmap() {
  const [items, setItems] = useState<HeatmapItem[]>([])
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

        const filtered = tickers
          .filter((t) => cryptoSet.has(t.symbol))
          .map((t) => ({
            symbol: t.symbol,
            name: symbolMap.get(t.symbol) ?? t.symbol,
            price: t.lastPrice,
            changePercent: t.priceChangePercent,
            volume: t.volume,
            marketCap: t.quoteVolume,
          }))
          .sort((a, b) => b.marketCap - a.marketCap)

        setItems(filtered)
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

  if (loading) {
    return <div className="text-center text-muted-foreground text-xs py-8">Loading heatmap...</div>
  }

  const maxMarketCap = Math.max(...items.map((i) => i.marketCap))

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
      {items.map((item) => {
        const intensity = Math.min(Math.abs(item.changePercent) / 15, 1)
        const isUp = item.changePercent >= 0
        const size = Math.max(0.3, Math.min(item.marketCap / maxMarketCap, 1))

        return (
          <button
            key={item.symbol}
            onClick={() => setActiveSymbol(item.symbol)}
            className={cn(
              "rounded-lg p-2 text-left transition-transform hover:scale-105 text-xs",
              isUp ? "bg-emerald-500/20 hover:bg-emerald-500/30" : "bg-red-500/20 hover:bg-red-500/30"
            )}
            style={{
              opacity: 0.5 + size * 0.5,
            }}
          >
            <div className="font-medium text-xs truncate">{item.symbol.replace("USDT", "")}</div>
            <div className="font-mono text-[10px]">{formatPrice(item.price)}</div>
            <div className={cn("font-mono text-[10px]", isUp ? "text-emerald-500" : "text-red-500")}>
              {formatPercent(item.changePercent)}
            </div>
            <div className="text-[8px] text-muted-foreground">Vol: {formatVolume(item.volume)}</div>
          </button>
        )
      })}
    </div>
  )
}
