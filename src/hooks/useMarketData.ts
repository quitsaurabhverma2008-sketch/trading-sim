"use client"

import { useEffect, useState, useCallback } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { timeframeToBinanceInterval, fetchKlinesDirect } from "@/lib/market/binance"
import { calcAllIndicators, type IndicatorResult } from "@/lib/market/indicators"
import type { Candle, Timeframe, AssetType } from "@/types"

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
  const { candles: candleMap, setCandles } = useMarketStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indicators, setIndicators] = useState<IndicatorResult | null>(null)

  const candleKey = `${symbol}:${timeframe}`
  const candles = candleMap[candleKey] ?? []

  const fetchData = useCallback(async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)

    try {
      let data: Candle[] = []

      if (type === "crypto") {
        const interval = timeframeToBinanceInterval(timeframe)
        try {
          const res = await fetch(
            `/api/market/crypto/${symbol}?type=klines&interval=${interval}&limit=${limit}`
          )
          if (!res.ok) throw new Error(`API error: ${res.status}`)
          const json = await res.json()
          data = json.candles ?? []
        } catch {
          data = await fetchKlinesDirect(symbol, interval, limit)
        }
      } else {
        const range = getRangeFromTimeframe(timeframe)
        const interval = getIntervalFromTimeframe(timeframe)
        const res = await fetch(
          `/api/market/stocks/${symbol}?type=klines&range=${range}&interval=${interval}`
        )

        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const json = await res.json()
        data = json.candles ?? []
      }

      if (data.length > 0) {
        setCandles(symbol, data, timeframe)
        const ind = calcAllIndicators(data)
        setIndicators(ind)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch market data")
    } finally {
      setLoading(false)
    }
  }, [symbol, type, timeframe, limit, setCandles])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  return { candles, indicators, loading, error, refetch: fetchData }
}

function getRangeFromTimeframe(tf: Timeframe): string {
  const map: Record<Timeframe, string> = {
    "1m": "1d",
    "5m": "5d",
    "15m": "5d",
    "30m": "1mo",
    "1h": "1mo",
    "4h": "3mo",
    "1d": "6mo",
    "1w": "1y",
  }
  return map[tf] ?? "1mo"
}

function getIntervalFromTimeframe(tf: Timeframe): string {
  const map: Record<Timeframe, string> = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "4h": "1h",
    "1d": "1d",
    "1w": "1d",
  }
  return map[tf] ?? "1h"
}
