import { NextRequest, NextResponse } from "next/server"
import { fetchStockCandles, fetchYahooQuote } from "@/lib/market/stocks"

export async function GET(request: NextRequest, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") ?? "klines"
  const timeframe = searchParams.get("timeframe") ?? "1h"
  const limit = searchParams.get("limit")

  try {
    const sym = symbol.toUpperCase()

    switch (type) {
      case "klines": {
        let candles = await fetchStockCandles(sym, timeframe)
        if (candles.length === 0 && sym.includes(".")) {
          candles = await fetchStockCandles(sym.replace(".", "-"), timeframe)
        }
        if (candles.length === 0 && sym.includes("-")) {
          candles = await fetchStockCandles(sym.replace("-", "."), timeframe)
        }
        if (limit) {
          const n = parseInt(limit)
          if (n > 0) candles = candles.slice(-n)
        }
        return NextResponse.json({ symbol: sym, timeframe, candles })
      }
      case "quote": {
        let quote = await fetchYahooQuote(sym)
        if (!quote && sym.includes(".")) {
          quote = await fetchYahooQuote(sym.replace(".", "-"))
        }
        if (!quote && sym.includes("-")) {
          quote = await fetchYahooQuote(sym.replace("-", "."))
        }
        if (!quote) {
          return NextResponse.json({ error: "Quote not available" }, { status: 404 })
        }
        return NextResponse.json({ symbol: sym, ...quote })
      }
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Stock API error:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}
