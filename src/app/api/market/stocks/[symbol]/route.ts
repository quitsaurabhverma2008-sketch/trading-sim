import { NextRequest, NextResponse } from "next/server"
import { fetchStockCandlesMultiSource, fetchYahooQuote } from "@/lib/market/stocks"

export async function GET(request: NextRequest, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") ?? "klines"
  const range = (searchParams.get("range") ?? "1mo") as "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y"
  const interval = (searchParams.get("interval") ?? "1h") as "1m" | "5m" | "15m" | "30m" | "1h" | "1d"

  try {
    switch (type) {
      case "klines": {
        const candles = await fetchStockCandlesMultiSource(symbol.toUpperCase(), range, interval)
        return NextResponse.json({ symbol, range, interval, candles })
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
