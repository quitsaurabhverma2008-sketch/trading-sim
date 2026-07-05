"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { Search, TrendingUp, BarChart3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"

interface SymbolResult {
  symbol: string
  name: string
  baseAsset?: string
  exchange?: string
  type: "crypto" | "stock"
}

export function SymbolSearch() {
  const { activeSymbol, setActiveSymbol, realtimePrices, tickers } = useMarketStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SymbolResult[]>([])
  const [loading, setLoading] = useState(false)
  const [allItems, setAllItems] = useState<SymbolResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const [cryptoRes, stockRes] = await Promise.all([
          fetch("/api/market/symbols?type=crypto&limit=2000"),
          fetch("/api/market/symbols?type=stocks&limit=2000"),
        ])
        if (!cryptoRes.ok || !stockRes.ok) return
        const cryptoData = await cryptoRes.json()
        const stockData = await stockRes.json()
        const crypto: SymbolResult[] = (cryptoData.items ?? []).map((s: { symbol: string; baseAsset: string; name: string }) => ({
          symbol: s.symbol,
          name: s.name ?? s.baseAsset,
          baseAsset: s.baseAsset,
          type: "crypto" as const,
        }))
        const stocks: SymbolResult[] = (stockData.items ?? []).map((s: { symbol: string; name: string; exchange: string }) => ({
          symbol: s.symbol,
          name: s.name,
          exchange: s.exchange,
          type: "stock" as const,
        }))
        setAllItems([...crypto, ...stocks])
      } catch {}
    }
    load()
  }, [])

  const filtered = query
    ? allItems.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 50)
    : allItems.slice(0, 50)

  const selectSymbol = useCallback(
    (symbol: string) => {
      setActiveSymbol(symbol)
      setOpen(false)
      setQuery("")
    },
    [setActiveSymbol]
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const currentPrice = realtimePrices[activeSymbol]
  const currentTicker = tickers[activeSymbol]
  const isUp = (currentTicker?.priceChangePercent ?? 0) >= 0

  return (
    <div ref={containerRef} className="relative shrink-0">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search 2000+ symbols..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            className="w-44 sm:w-56 h-8 pl-7 pr-2 text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-medium text-muted-foreground">
            {activeSymbol.replace("USDT", "")}
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono tabular-nums leading-none">
            {currentPrice ? formatPrice(currentPrice) : "—"}
          </span>
          {currentTicker && (
            <span className={`text-xs font-mono ${isUp ? "text-emerald-500" : "text-red-500"}`}>
              {isUp ? "+" : ""}{currentTicker.priceChangePercent.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-xs text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground">No results</div>
          ) : (
            filtered.map((s) => {
              const price = realtimePrices[s.symbol]
              const ticker = tickers[s.symbol]
              const isSelected = s.symbol === activeSymbol
              return (
                <button
                  key={s.symbol}
                  onClick={() => selectSymbol(s.symbol)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors ${
                    isSelected ? "bg-accent" : ""
                  }`}
                >
                  <div className="shrink-0">
                    {s.type === "crypto" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {s.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {price ? (
                      <>
                        <div className="text-sm font-mono font-medium">
                          {formatPrice(price)}
                        </div>
                        {ticker && (
                          <div className={`text-xs font-mono ${ticker.priceChangePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {ticker.priceChangePercent >= 0 ? "+" : ""}{ticker.priceChangePercent.toFixed(2)}%
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground">—</div>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
