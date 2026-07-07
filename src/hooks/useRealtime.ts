"use client"

import { useEffect, useRef, useCallback } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { usePortfolioStore } from "@/stores/portfolioStore"
import { createBinanceWS, parseBinanceTicker, fetchAllTickers } from "@/lib/market/binance"
import type { Ticker24h } from "@/types"

export function useRealtime(symbols: string[]) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const mountedRef = useRef(true)

  const { setConnectionStatus, addRealtimePrice, setTickers } = useMarketStore()
  const updatePositionPrices = usePortfolioStore((s) => s.updatePositionPrices)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setConnectionStatus("connecting")

    try {
      const ws = createBinanceWS(symbols, (data) => {
        if (!mountedRef.current) return

        try {
          const parsed = parseBinanceTicker(data as Parameters<typeof parseBinanceTicker>[0])
          addRealtimePrice(parsed.symbol, parsed.price)

          setTickers({
            [parsed.symbol]: {
              symbol: parsed.symbol,
              priceChange: parsed.change,
              priceChangePercent: parsed.changePercent,
              lastPrice: parsed.price,
              volume: 0,
              quoteVolume: 0,
              high: 0,
              low: 0,
              open: 0,
              close: 0,
              count: 0,
            },
          })

          updatePositionPrices({ [parsed.symbol]: parsed.price })
        } catch {
        }
      })

      wsRef.current = ws

      ws.onopen = () => {
        if (mountedRef.current) setConnectionStatus("connected")
      }

      ws.onclose = () => {
        if (mountedRef.current) {
          setConnectionStatus("disconnected")
          reconnectRef.current = setTimeout(connect, 5000)
        }
      }

      ws.onerror = () => {
        ws.close()
      }
    } catch {
      setConnectionStatus("error")
      reconnectRef.current = setTimeout(connect, 10000)
    }
  }, [symbols, setConnectionStatus, addRealtimePrice, setTickers, updatePositionPrices])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])
}

export function useTicker24h(symbols: string[]) {
  const { setTickers } = useMarketStore()

  useEffect(() => {
    let mounted = true

    async function fetchTickers() {
      try {
        const data = await fetchAllTickers()
        if (!mounted) return

        const filtered: Record<string, unknown> = {}
        for (const t of data) {
          if (symbols.includes(t.symbol)) {
            filtered[t.symbol] = t
          }
        }
        if (Object.keys(filtered).length > 0) {
          setTickers(filtered as Record<string, Ticker24h>)
        }
      } catch {
      }
    }

    fetchTickers()
    const interval = setInterval(fetchTickers, 60000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [symbols, setTickers])
}
