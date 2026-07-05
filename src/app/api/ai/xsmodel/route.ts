import { NextRequest, NextResponse } from "next/server"
import { fetchKlinesDirect } from "@/lib/market/binance"
import { calcAllIndicators, findSupportResistance } from "@/lib/market/indicators"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, pred_len = 24 } = body

    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 })
    }

    const symbolUpper = symbol.toUpperCase()
    const isCrypto = symbolUpper.endsWith("USDT") || ["BTC","ETH","SOL","BNB","XRP","ADA","DOGE","AVAX","DOT","LINK"].includes(symbolUpper)
    const pair = isCrypto ? (symbolUpper.endsWith("USDT") ? symbolUpper : `${symbolUpper}USDT`) : symbolUpper

    const candles = await fetchKlinesDirect(pair, "1h", 200)
    if (!candles || candles.length < 20) {
      return NextResponse.json({ error: `Insufficient data for ${pair}` }, { status: 400 })
    }

    const indicators = calcAllIndicators(candles)
    const sr = findSupportResistance(candles)
    const latest = candles[candles.length - 1]
    const price = latest.close
    const sma20 = indicators.sma?.[indicators.sma.length - 1] ?? price
    const ema20 = indicators.ema?.[indicators.ema.length - 1] ?? price
    const rsi = indicators.rsi?.value ?? 50
    const bb = indicators.bb
    const macd = indicators.macd

    const trend = price > sma20 && price > ema20 ? 1 : price < sma20 && price < ema20 ? -1 : 0
    const momentum = (rsi - 50) / 50
    const bbPressure = bb ? (price - bb.middle) / (bb.upper - bb.lower) : 0
    const macdMomentum = macd ? macd.histogram / Math.abs(macd.signal || 0.001) : 0

    const preds: { timestamp: number; price: number; change: number }[] = []
    let curPrice = price
    const baseTs = latest.time * 1000
    const hourMs = 3600000

    for (let i = 1; i <= pred_len; i++) {
      const drift = trend * 0.001 + momentum * 0.002 + bbPressure * 0.001 + macdMomentum * 0.0005
      const noise = (Math.random() - 0.5) * 0.004
      const change = drift + noise
      curPrice *= (1 + change)
      preds.push({
        timestamp: baseTs + i * hourMs,
        price: Math.round(curPrice * 100) / 100,
        change: Math.round(change * 10000) / 10000,
      })
    }

    return NextResponse.json({
      symbol: pair,
      interval: "1h",
      current_price: price,
      pred_len,
      predictions: preds,
      technical_context: {
        trend: trend > 0 ? "bullish" : trend < 0 ? "bearish" : "neutral",
        rsi: Math.round(rsi * 100) / 100,
        macd_histogram: macd ? Math.round(macd.histogram * 100000) / 100000 : 0,
        support: sr.support,
        resistance: sr.resistance,
        volatility: bb ? Math.round(((bb.upper - bb.lower) / bb.middle) * 10000) / 10000 : 0,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}