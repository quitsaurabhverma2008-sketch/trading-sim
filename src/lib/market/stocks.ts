import type { Candle } from "@/types"

const YAHOO_HOSTS = ["query2.finance.yahoo.com", "query1.finance.yahoo.com"]

const RANGE_INTERVAL_MAP: Record<string, string[]> = {
  "1d": ["1m", "2m", "5m", "15m", "30m", "60m"],
  "5d": ["1m", "2m", "5m", "15m", "30m", "60m", "1d"],
  "1mo": ["30m", "60m", "1d"],
  "3mo": ["60m", "1d", "5d", "1wk"],
  "6mo": ["1d", "5d", "1wk", "1mo"],
  "1y": ["1d", "5d", "1wk", "1mo"],
}

const TF_RANGE_MAP: Record<string, string> = {
  "1m": "1d", "5m": "5d", "15m": "5d", "30m": "1mo",
  "1h": "1mo", "4h": "3mo", "1d": "6mo", "1w": "1y",
}

const TF_INTERVAL_MAP: Record<string, string> = {
  "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
  "1h": "60m", "4h": "60m", "1d": "1d", "1w": "1d",
}

function parseYahooResult(result: unknown): Candle[] {
  try {
    const r = result as { timestamp?: number[]; indicators?: { quote?: { open?: number[]; high?: number[]; low?: number[]; close?: number[]; volume?: number[] }[] } }
    const timestamps: number[] = r.timestamp ?? []
    const quote = r.indicators?.quote?.[0]
    if (!quote || timestamps.length === 0) return []

    const candles: Candle[] = []
    for (let i = 0; i < timestamps.length; i++) {
      const o = quote.open?.[i]; const h = quote.high?.[i]; const l = quote.low?.[i]; const c = quote.close?.[i]; const v = quote.volume?.[i]
      if (o != null && h != null && l != null && c != null) {
        candles.push({ time: timestamps[i], open: o, high: h, low: l, close: c, volume: v ?? 0 })
      }
    }
    return candles.filter((c) => c.close > 0)
  } catch { return [] }
}

async function fetchYahooHost(symbol: string, range: string, interval: string, host: string): Promise<Candle[] | null> {
  const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 300 } })
    if (!res.ok) return null
    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) return null
    return parseYahooResult(result)
  } catch { return null }
}

async function fetchYahooWithFallback(symbol: string, range: string, interval: string): Promise<Candle[]> {
  for (const host of YAHOO_HOSTS) {
    const candles = await fetchYahooHost(symbol, range, interval, host)
    if (candles && candles.length > 0) return candles
  }
  return []
}

export async function fetchStockCandles(
  symbol: string,
  tf: string
): Promise<Candle[]> {
  const range = TF_RANGE_MAP[tf] ?? "1mo"
  const interval = TF_INTERVAL_MAP[tf] ?? "60m"

  const validIntervals = RANGE_INTERVAL_MAP[range] ?? []
  if (!validIntervals.includes(interval)) {
    const fallbackInterval = validIntervals[0]
    if (fallbackInterval) return fetchYahooWithFallback(symbol, range, fallbackInterval)
    return []
  }

  let candles = await fetchYahooWithFallback(symbol, range, interval)
  if (candles.length > 0) return candles

  if (interval !== "1d") {
    candles = await fetchYahooWithFallback(symbol, range, "1d")
  }
  if (candles.length > 0) return candles

  for (const altRange of ["5d", "1mo", "1y"]) {
    if (altRange === range) continue
    candles = await fetchYahooWithFallback(symbol, altRange, TF_INTERVAL_MAP[tf] ?? "60m")
    if (candles.length > 0) return candles
  }

  return []
}

export async function fetchYahooQuote(symbol: string): Promise<{
  price: number; change: number; changePercent: number; volume: number; high: number; low: number; open: number; previousClose: number
} | null> {
  for (const host of YAHOO_HOSTS) {
    const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 60 } })
      if (!res.ok) continue
      const data = await res.json()
      const meta = data?.chart?.result?.[0]?.meta
      if (!meta) continue
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
    } catch { continue }
  }
  return null
}

export async function fetchStockCandlesMultiSource(
  symbol: string,
  range: string,
  interval: string
): Promise<Candle[]> {
  return fetchStockCandles(symbol, interval === "1h" ? "1h" : interval === "1d" ? "1d" : interval)
}
