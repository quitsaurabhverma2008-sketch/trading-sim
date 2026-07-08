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

interface PriceInfo {
  price: number
  changePercent: number
}

export function SymbolSearch() {
  const { activeSymbol, setActiveSymbol, realtimePrices, tickers, activeAssetType } = useMarketStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [allItems, setAllItems] = useState<SymbolResult[]>([])
  const [prices, setPrices] = useState<Record<string, PriceInfo>>({})
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
        const all = [...crypto, ...stocks]
        setAllItems(all)

        fetch("https://api.binance.com/api/v3/ticker/24hr")
          .then((r) => r.json())
          .then((data: unknown[]) => {
            const p: Record<string, PriceInfo> = {}
            for (const t of data) {
              const tkr = t as Record<string, unknown>
              const sym = tkr.symbol as string
              p[sym] = { price: parseFloat(tkr.lastPrice as string), changePercent: parseFloat(tkr.priceChangePercent as string) }
            }
            setPrices((prev) => ({ ...prev, ...p }))
          })
          .catch(() => {})

        const stockSymbols = stocks.map((s) => s.symbol).join(",")
        if (stockSymbols) {
          fetch(`/api/market/stocks/batch?symbols=${encodeURIComponent(stockSymbols)}`)
            .then((r) => r.json())
            .then((data: { quotes: Record<string, PriceInfo> }) => {
              if (data.quotes) setPrices((prev) => ({ ...prev, ...data.quotes }))
            })
            .catch(() => {})
        }
      } catch {}
    }
    load()
  }, [])

  const filtered = query
    ? allItems.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      )
    : allItems

  const cryptoItems = filtered.filter((s) => s.type === "crypto")
  const stockItems = filtered.filter((s) => s.type === "stock")

  const selectSymbol = useCallback(
    (symbol: string, type: "crypto" | "stock") => {
      setActiveSymbol(symbol, type)
      setOpen(false)
      setQuery("")
    },
    [setActiveSymbol]
  )

  function renderRow(s: SymbolResult) {
    const storePrice = realtimePrices[s.symbol]
    const storeTicker = tickers[s.symbol]
    const localPrice = prices[s.symbol]
    const displayPrice = storePrice ?? localPrice?.price
    const displayChange = storeTicker?.priceChangePercent ?? localPrice?.changePercent
    const isSelected = s.symbol === activeSymbol
    return (
      <button
        key={s.symbol}
        onClick={() => selectSymbol(s.symbol, s.type)}
        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-all duration-150 ${
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
          {displayPrice ? (
            <>
              <div className="text-sm font-mono font-medium">
                {formatPrice(displayPrice)}
              </div>
              {displayChange != null && (
                <div className={`text-xs font-mono ${displayChange >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {displayChange >= 0 ? "+" : ""}{displayChange.toFixed(2)}%
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-muted-foreground">—</div>
          )}
        </div>
      </button>
    )
  }

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
            className="w-44 sm:w-56 h-8 pl-7 pr-2 text-xs bg-background/50 transition-all duration-200 focus:w-56 sm:focus:w-64"
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
            <span className={`text-xs font-mono transition-colors duration-300 ${isUp ? "text-emerald-500" : "text-red-500"}`}>
              {isUp ? "+" : ""}{currentTicker.priceChangePercent.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-popover/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-2xl z-50 max-h-[70vh] overflow-y-auto scrollbar-thin animate-slide-down">
          {loading ? (
            <div className="p-3 text-xs text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground">No results</div>
          ) : (
            <>
              {cryptoItems.length > 0 && (
                <>
                  <div className="sticky top-0 bg-popover/95 backdrop-blur-xl px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                    Crypto
                  </div>
                  {cryptoItems.map((s) => renderRow(s))}
                </>
              )}
              {stockItems.length > 0 && (
                <>
                  <div className="sticky top-0 bg-popover/95 backdrop-blur-xl px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                    Stocks
                  </div>
                  {stockItems.map((s) => renderRow(s))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
