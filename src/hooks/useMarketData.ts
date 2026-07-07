"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { timeframeToBinanceInterval, fetchKlinesDirect, createBinanceKlineWS } from "@/lib/market/binance"
import { calcAllIndicators, type IndicatorResult } from "@/lib/market/indicators"
import type { Candle, Timeframe, AssetType } from "@/types"

const KNOWN_CRYPTO = new Set([
  "BTC","ETH","SOL","BNB","XRP","ADA","DOGE","AVAX","DOT","LINK",
  "MATIC","ATOM","UNI","ARB","OP","NEAR","APT","LTC","BCH","FIL",
  "AAVE","ALGO","AXS","SAND","MANA","GALA","FTM","CRV","EOS","TRX",
  "ICP","FET","RUNE","INJ","TIA","SEI","STRK","PEPE","WIF","BONK",
  "FLOKI","SHIB","NOT","ENA","W","TAO","SUI","BEAM","ONDO","JUP",
  "JTO","PYTH","STX","MKR","COMP","SNX","YFI","BAL","1INCH",
])

function normalizeSymbol(symbol: string, type: AssetType): string {
  if (type !== "crypto") return symbol.toUpperCase()
  const s = symbol.toUpperCase()
  if (s.endsWith("USDT")) return s
  if (KNOWN_CRYPTO.has(s)) return `${s}USDT`
  return s
}

interface MarketDataResult {
  candles: Candle[]
  indicators: IndicatorResult | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMarketData(
  symbol: string,
  type: AssetType,
  timeframe: Timeframe,
  limit = 200
): MarketDataResult {
  const { candles: candleMap, setCandles, updateLastCandle } = useMarketStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indicators, setIndicators] = useState<IndicatorResult | null>(null)

  const normalSymbol = normalizeSymbol(symbol, type)
  const candleKey = `${normalSymbol}:${timeframe}`
  const candles = candleMap[candleKey] ?? []
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!normalSymbol || type !== "crypto") return
    const interval = timeframeToBinanceInterval(timeframe)
    const ws = createBinanceKlineWS(normalSymbol, interval, (candle) => {
      updateLastCandle(normalSymbol, candle, timeframe)
    })
    wsRef.current = ws
    return () => { ws.close(); wsRef.current = null }
  }, [normalSymbol, type, timeframe])

  const fetchData = useCallback(async () => {
    if (!normalSymbol) return

    setLoading(true)
    setError(null)

    try {
      let data: Candle[] = []

      if (type === "crypto") {
        const interval = timeframeToBinanceInterval(timeframe)
        data = await fetchKlinesDirect(normalSymbol, interval, limit)
      } else {
        const res = await fetch(
          `/api/market/stocks/${normalSymbol}?type=klines&timeframe=${timeframe}`
        )

        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const json = await res.json()
        data = json.candles ?? []
      }

      if (data.length > 0) {
        setCandles(normalSymbol, data, timeframe)
        const ind = calcAllIndicators(data)
        setIndicators(ind)
        setError(null)
      } else if (candles.length === 0) {
        const src = type === "crypto" ? "Binance" : "Yahoo Finance"
        setError(`No data for ${symbol} (${normalSymbol}) on ${src}. Try a different asset.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch market data")
    } finally {
      setLoading(false)
    }
  }, [normalSymbol, type, timeframe, limit, setCandles])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  return { candles, indicators, loading, error, refetch: fetchData }
}
