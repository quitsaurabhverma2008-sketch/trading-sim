import { NextRequest, NextResponse } from "next/server"
import { fetchKlines, fetchTicker24h, fetchOrderBook } from "@/lib/market/binance"

export async function GET(request: NextRequest, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") ?? "klines"
  const interval = searchParams.get("interval") ?? "1h"
  const limit = parseInt(searchParams.get("limit") ?? "200")

  try {
    switch (type) {
      case "klines": {
        const candles = await fetchKlines(symbol.toUpperCase(), interval, Math.min(limit, 1000))
        return NextResponse.json({ symbol, interval, candles })
      }
      case "ticker": {
        const ticker = await fetchTicker24h(symbol.toUpperCase())
        return NextResponse.json(ticker)
      }
      case "depth": {
        const depthLimit = Math.min(parseInt(searchParams.get("depth") ?? "20"), 100)
        const book = await fetchOrderBook(symbol.toUpperCase(), depthLimit)
        return NextResponse.json(book)
      }
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch market data"
    console.error("Crypto API error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
