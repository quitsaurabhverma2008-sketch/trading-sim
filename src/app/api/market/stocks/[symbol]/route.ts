import { NextRequest, NextResponse } from "next/server"
import { fetchStockCandles, fetchYahooQuote } from "@/lib/market/stocks"

export async function GET(request: NextRequest, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") ?? "klines"
  const timeframe = searchParams.get("timeframe") ?? "1h"

  try {
    switch (type) {
      case "klines": {
        const candles = await fetchStockCandles(symbol.toUpperCase(), timeframe)
        return NextResponse.json({ symbol, timeframe, candles })
      }
      case "quote": {
        const quote = await fetchYahooQuote(symbol.toUpperCase())
        if (!quote) {
          return NextResponse.json({ error: "Quote not available" }, { status: 404 })
        }
        return NextResponse.json({ symbol: symbol.toUpperCase(), ...quote })
      }
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Stock API error:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}
