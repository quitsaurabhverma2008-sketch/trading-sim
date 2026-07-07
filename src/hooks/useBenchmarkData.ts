import { useState, useEffect } from "react"

const BENCHMARKS = [
  { symbol: "BTCUSDT", name: "Bitcoin", color: "#f7931a" },
  { symbol: "ETHUSDT", name: "Ethereum", color: "#627eea" },
  { symbol: "SPY", name: "S&P 500", color: "#00b300" },
]

export interface BenchmarkPoint {
  time: number
  value: number
}

export function useBenchmarkData() {
  const [data, setData] = useState<Record<string, BenchmarkPoint[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      setError(null)
      const result: Record<string, BenchmarkPoint[]> = {}

      try {
        for (const b of BENCHMARKS) {
          if (cancelled) return

          let points: BenchmarkPoint[] = []

          if (b.symbol === "SPY") {
            const res = await fetch(`/api/market/stocks/SPY?interval=1d&limit=90`)
            if (!res.ok) continue
            const json = await res.json()
            if (json.candles) {
              const firstPrice = json.candles[0]?.close ?? 1
              points = json.candles.map((c: { time: number; close: number }) => ({
                time: c.time,
                value: ((c.close - firstPrice) / firstPrice) * 100,
              }))
            }
          } else {
            const symbol = b.symbol
            const res = await fetch(`/api/market/crypto/${symbol}?interval=1d&limit=90`)
            if (!res.ok) continue
            const json = await res.json()
            if (json.candles) {
              const firstPrice = json.candles[0]?.close ?? 1
              points = json.candles.map((c: { time: number; close: number }) => ({
                time: c.time,
                value: ((c.close - firstPrice) / firstPrice) * 100,
              }))
            }
          }

          if (!cancelled) result[b.symbol] = points
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load benchmarks")
      }

      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [])

  return { data, loading, error, benchmarks: BENCHMARKS }
}
