import { BINANCE_REST_BASE, BINANCE_WS_BASE } from "@/lib/constants"
import type { Candle, Ticker24h, OrderBook, Timeframe } from "@/types"

const BINANCE_TIME = 500

export function timeframeToBinanceInterval(tf: Timeframe): string {
  const map: Record<Timeframe, string> = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "4h": "4h",
    "1d": "1d",
    "1w": "1w",
  }
  return map[tf] ?? "1h"
}

export async function fetchKlines(
  symbol: string,
  interval: string,
  limit = 500
): Promise<Candle[]> {
  const url = `${BINANCE_REST_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  const res = await fetch(url, { next: { revalidate: 60 } })

  if (!res.ok) {
    throw new Error(`Binance API error: ${res.status} ${res.statusText}`)
  }

  const data: unknown[][] = await res.json()
  return data.map((k) => ({
    time: Math.floor((k[0] as number) / 1000),
    open: parseFloat(k[1] as string),
    high: parseFloat(k[2] as string),
    low: parseFloat(k[3] as string),
    close: parseFloat(k[4] as string),
    volume: parseFloat(k[5] as string),
  }))
}

export async function fetchTicker24h(symbol: string): Promise<Ticker24h> {
  const url = `${BINANCE_REST_BASE}/api/v3/ticker/24hr?symbol=${symbol}`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`Binance ticker error: ${res.status}`)
  const data = await res.json()

  return {
    symbol: data.symbol,
    priceChange: parseFloat(data.priceChange),
    priceChangePercent: parseFloat(data.priceChangePercent),
    lastPrice: parseFloat(data.lastPrice),
    volume: parseFloat(data.volume),
    quoteVolume: parseFloat(data.quoteVolume),
    high: parseFloat(data.highPrice),
    low: parseFloat(data.lowPrice),
    open: parseFloat(data.openPrice),
    close: parseFloat(data.prevClosePrice),
    count: data.count,
  }
}

export async function fetchAllTickers(): Promise<Ticker24h[]> {
  const url = `${BINANCE_REST_BASE}/api/v3/ticker/24hr`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`Binance all tickers error: ${res.status}`)
  const data: unknown[] = await res.json()

  return data.map((t: unknown) => {
    const ticker = t as Record<string, unknown>
    return {
      symbol: ticker.symbol as string,
      priceChange: parseFloat(ticker.priceChange as string),
      priceChangePercent: parseFloat(ticker.priceChangePercent as string),
      lastPrice: parseFloat(ticker.lastPrice as string),
      volume: parseFloat(ticker.volume as string),
      quoteVolume: parseFloat(ticker.quoteVolume as string),
      high: parseFloat(ticker.highPrice as string),
      low: parseFloat(ticker.lowPrice as string),
      open: parseFloat(ticker.openPrice as string),
      close: parseFloat(ticker.prevClosePrice as string),
      count: ticker.count as number,
    }
  })
}

export async function fetchExchangeInfo(): Promise<{ symbol: string; baseAsset: string; quoteAsset: string }[]> {
  const url = `${BINANCE_REST_BASE}/api/v3/exchangeInfo`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Binance exchangeInfo error: ${res.status}`)
  const data = await res.json()
  return data.symbols
    .filter((s: { status: string; quoteAsset: string }) => s.status === "TRADING" && s.quoteAsset === "USDT")
    .map((s: { symbol: string; baseAsset: string; quoteAsset: string }) => ({
      symbol: s.symbol,
      baseAsset: s.baseAsset,
      quoteAsset: s.quoteAsset,
    }))
    .sort((a: { symbol: string }, b: { symbol: string }) => a.symbol.localeCompare(b.symbol))
}

export async function fetchOrderBook(symbol: string, limit = 20): Promise<OrderBook> {
  const url = `${BINANCE_REST_BASE}/api/v3/depth?symbol=${symbol}&limit=${limit}`
  const res = await fetch(url)
  const data = await res.json()

  return {
    bids: data.bids.map((b: string[]) => ({
      price: parseFloat(b[0]),
      quantity: parseFloat(b[1]),
    })),
    asks: data.asks.map((a: string[]) => ({
      price: parseFloat(a[0]),
      quantity: parseFloat(a[1]),
    })),
    lastUpdateId: data.lastUpdateId,
  }
}

export function createBinanceWS(
  symbols: string[],
  onMessage: (data: { stream: string; data: unknown }) => void
): WebSocket {
  const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`)
  const isMulti = streams.length > 1
  const url = isMulti
    ? `wss://stream.binance.com:9443/stream?streams=${streams.join("/")}`
    : `${BINANCE_WS_BASE}/${streams[0]}`

  const ws = new WebSocket(url)

  ws.onopen = () => {
    console.log(`Binance WS connected: ${symbols.length} streams`)
  }

  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data)
      if (isMulti && parsed.stream) {
        onMessage(parsed)
      } else if (!isMulti && parsed.s) {
        onMessage({ stream: `${parsed.s.toLowerCase()}@ticker`, data: parsed })
      } else if (parsed.stream) {
        onMessage(parsed)
      }
    } catch {
    }
  }

  ws.onerror = (err) => {
    console.error("Binance WS error:", err)
  }

  ws.onclose = () => {
    console.log("Binance WS disconnected")
  }

  return ws
}

export function createBinanceKlineWS(
  symbol: string,
  interval: string,
  onCandle: (candle: Candle) => void
): WebSocket {
  const stream = `${symbol.toLowerCase()}@kline_${interval}`
  const url = `${BINANCE_WS_BASE}/${stream}`

  const ws = new WebSocket(url)

  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data)
      const k = parsed.k
      if (k) {
        onCandle({
          time: Math.floor(k.t / 1000),
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
        })
      }
    } catch {
    }
  }

  return ws
}

export function parseBinanceTicker(data: {
  stream: string
  data: {
    s: string
    c: string
    p: string
    P: string
    v: string
    q: string
    h: string
    l: string
    o: string
  }
}): { symbol: string; price: number; change: number; changePercent: number } {
  const d = data.data
  return {
    symbol: d.s,
    price: parseFloat(d.c),
    change: parseFloat(d.p),
    changePercent: parseFloat(d.P),
  }
}
