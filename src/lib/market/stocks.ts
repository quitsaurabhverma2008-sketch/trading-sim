import type { Candle } from "@/types"

const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query"
const ALPHA_VANTAGE_KEY = "demo"

const YAHOO_API_BASE = "https://query1.finance.yahoo.com/v8/finance/chart"

export async function fetchYahooFinanceCandles(
  symbol: string,
  range = "1mo",
  interval = "1h"
): Promise<Candle[]> {
  const url = `${YAHOO_API_BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    })

    if (!res.ok) return []

    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) return []

    const timestamps: number[] = result.timestamp ?? []
    const quote = result.indicators?.quote?.[0]
    if (!quote) return []

    const candles: Candle[] = []
    for (let i = 0; i < timestamps.length; i++) {
      const o = quote.open?.[i]
      const h = quote.high?.[i]
      const l = quote.low?.[i]
      const c = quote.close?.[i]
      const v = quote.volume?.[i]
      if (o != null && h != null && l != null && c != null) {
        candles.push({
          time: timestamps[i],
          open: o,
          high: h,
          low: l,
          close: c,
          volume: v ?? 0,
        })
      }
    }

    return candles.filter((c) => c.close > 0)
  } catch {
    return []
  }
}

export async function fetchAlphaVantageCandles(
  symbol: string,
  interval: "1min" | "5min" | "15min" | "30min" | "60min" = "60min"
): Promise<Candle[]> {
  const functionName = interval === "60min" ? "TIME_SERIES_INTRADAY" : "TIME_SERIES_INTRADAY"
  const url = `${ALPHA_VANTAGE_BASE}?function=${functionName}&symbol=${encodeURIComponent(symbol)}&interval=${interval}&apikey=${ALPHA_VANTAGE_KEY}`

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    const data = await res.json()

    const timeSeriesKey = Object.keys(data).find((k) => k.includes("Time Series"))
    if (!timeSeriesKey) return []

    const timeSeries = data[timeSeriesKey] as Record<string, Record<string, string>>
    const candles: Candle[] = Object.entries(timeSeries).map(([timeStr, values]) => ({
      time: Math.floor(new Date(timeStr).getTime() / 1000),
      open: parseFloat(values["1. open"]),
      high: parseFloat(values["2. high"]),
      low: parseFloat(values["3. low"]),
      close: parseFloat(values["4. close"]),
      volume: parseFloat(values["5. volume"]),
    }))

    return candles.reverse()
  } catch {
    return []
  }
}

export async function fetchYahooQuote(symbol: string): Promise<{
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
} | null> {
  const url = `${YAHOO_API_BASE}/${encodeURIComponent(symbol)}?range=1d&interval=1d`

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    })

    if (!res.ok) return null

    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (!meta) return null

    return {
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      volume: meta.regularMarketVolume ?? 0,
      high: meta.regularMarketDayHigh ?? meta.regularMarketPrice,
      low: meta.regularMarketDayLow ?? meta.regularMarketPrice,
      open: meta.regularMarketOpen ?? meta.regularMarketPrice,
      previousClose: meta.previousClose ?? meta.regularMarketPrice,
    }
  } catch {
    return null
  }
}

export async function fetchStockCandlesMultiSource(
  symbol: string,
  range: "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" = "1mo",
  interval: "1m" | "5m" | "15m" | "30m" | "1h" | "1d" = "1h"
): Promise<Candle[]> {
  const yahooIntervalMap: Record<string, string> = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "1d": "1d",
  }

  const candles = await fetchYahooFinanceCandles(symbol, range, yahooIntervalMap[interval] ?? "1h")
  if (candles.length > 0) return candles

  const avIntervalMap: Record<string, "1min" | "5min" | "15min" | "30min" | "60min"> = {
    "1m": "1min",
    "5m": "5min",
    "15m": "15min",
    "30m": "30min",
    "1h": "60min",
  }

  const avCandles = await fetchAlphaVantageCandles(symbol, avIntervalMap[interval] ?? "60min")
  return avCandles
}
