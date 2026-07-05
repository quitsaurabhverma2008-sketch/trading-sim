"use client"

import { useState } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { CRYPTO_SYMBOLS } from "@/lib/constants"
import { fetchKlines, timeframeToBinanceInterval } from "@/lib/market/binance"
import { calcRSI, calcMACD, calcBollingerBands, calcSMA } from "@/lib/market/indicators"
import { formatPrice, formatPercent } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2 } from "lucide-react"

interface ScreenerResult {
  symbol: string
  name: string
  price: number
  rsi: number | null
  rsiSignal: string
  macdSignal: string
  bbSignal: string
  maSignal: string
}

type FilterType = "all" | "oversold" | "overbought" | "golden_cross" | "death_cross" | "bb_breakout"

export function TechnicalScreener() {
  const [results, setResults] = useState<ScreenerResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")
  const { setActiveSymbol } = useMarketStore()

  async function runScreen() {
    setLoading(true)
    const allResults: ScreenerResult[] = []

    for (const asset of CRYPTO_SYMBOLS) {
      try {
        const interval = timeframeToBinanceInterval("1h")
        const candles = await fetchKlines(asset.symbol, interval, 100)
        if (candles.length < 50) continue

        const closes = candles.map((c) => c.close)
        const price = closes[closes.length - 1]

        const rsi = calcRSI(closes)
        const macd = calcMACD(closes)
        const bb = calcBollingerBands(closes)
        const sma50 = calcSMA(closes, 50)
        const sma200 = calcSMA(closes, 200)

        const lastSma50 = sma50[sma50.length - 1]
        const lastSma200 = sma200[sma200.length - 1]
        const prevSma50 = sma50[sma50.length - 2]
        const prevSma200 = sma200[sma200.length - 2]

        let maSignal = "neutral"
        if (prevSma50 <= prevSma200 && lastSma50 > lastSma200) maSignal = "golden_cross"
        else if (prevSma50 >= prevSma200 && lastSma50 < lastSma200) maSignal = "death_cross"

        let bbSignal = "neutral"
        if (bb) {
          if (price <= bb.lower) bbSignal = "below_lower"
          else if (price >= bb.upper) bbSignal = "above_upper"
        }

        allResults.push({
          symbol: asset.symbol,
          name: asset.name,
          price,
          rsi: rsi?.value ?? null,
          rsiSignal: rsi ? (rsi.overbought ? "overbought" : rsi.oversold ? "oversold" : "neutral") : "N/A",
          macdSignal: macd
            ? macd.histogram > 0
              ? "bullish"
              : "bearish"
            : "N/A",
          bbSignal,
          maSignal,
        })
      } catch {
        continue
      }
    }

    setResults(allResults)
    setLoading(false)
  }

  const filtered = results.filter((r) => {
    if (filter === "all") return true
    if (filter === "oversold") return rsiSignal(r) === "oversold"
    if (filter === "overbought") return rsiSignal(r) === "overbought"
    if (filter === "golden_cross") return r.maSignal === "golden_cross"
    if (filter === "death_cross") return r.maSignal === "death_cross"
    if (filter === "bb_breakout") return r.bbSignal !== "neutral"
    return true
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" className="h-8 text-xs gap-1" onClick={runScreen} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          {loading ? "Scanning..." : "Scan All"}
        </Button>
        <div className="flex gap-1 flex-wrap">
          {(["all", "oversold", "overbought", "golden_cross", "death_cross", "bb_breakout"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-md transition-colors",
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f === "all" ? "All" : f === "bb_breakout" ? "BB Break" : f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {filtered.length} of {results.length} symbols match
        </div>
      )}

      <div className="space-y-1">
        {filtered.length === 0 && !loading && (
          <div className="text-center text-muted-foreground text-xs py-8">
            Click "Scan All" to screen assets
          </div>
        )}

        {filtered.map((item) => (
          <button
            key={item.symbol}
            onClick={() => setActiveSymbol(item.symbol)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted/50 rounded-md transition-colors"
          >
            <div>
              <div className="font-medium">{item.symbol.replace("USDT", "")}</div>
              <div className="flex gap-1 mt-0.5">
                {item.rsiSignal !== "neutral" && item.rsiSignal !== "N/A" && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[8px] px-1 py-0",
                      item.rsiSignal === "overbought" ? "border-red-500 text-red-500" : "border-emerald-500 text-emerald-500"
                    )}
                  >
                    RSI {item.rsiSignal}
                  </Badge>
                )}
                {item.maSignal !== "neutral" && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[8px] px-1 py-0",
                      item.maSignal === "golden_cross" ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500"
                    )}
                  >
                    {item.maSignal}
                  </Badge>
                )}
                {item.bbSignal !== "neutral" && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 border-blue-500 text-blue-500">
                    BB {item.bbSignal === "above_upper" ? "Upper" : "Lower"}
                  </Badge>
                )}
                {item.macdSignal !== "N/A" && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[8px] px-1 py-0",
                      item.macdSignal === "bullish" ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500"
                    )}
                  >
                    MACD {item.macdSignal}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono">{formatPrice(item.price)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function rsiSignal(r: ScreenerResult): string {
  if (r.rsi == null) return "N/A"
  if (r.rsi > 70) return "overbought"
  if (r.rsi < 30) return "oversold"
  return "neutral"
}
