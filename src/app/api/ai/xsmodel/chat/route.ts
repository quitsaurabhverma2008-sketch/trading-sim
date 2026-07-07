import { NextRequest } from "next/server"
import { calcAllIndicators, findSupportResistance } from "@/lib/market/indicators"
import { fetchStockCandles } from "@/lib/market/stocks"
import type { Candle } from "@/types"

const CRYPTO_SYMBOLS = new Set([
  "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "DOT", "LINK",
  "MATIC", "ATOM", "UNI", "ARB", "OP", "NEAR", "APT", "LTC", "BCH", "FIL",
  "AAVE", "ALGO", "AXS", "SAND", "MANA", "GALA", "FTM", "CRV", "EOS", "TRX",
])

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function sseEncode(obj: Record<string, unknown>): string {
  return `data: ${JSON.stringify(obj)}\n`
}

function createSSEResponse(text: string): Response {
  const encoder = new TextEncoder()
  const ss = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(sseEncode({ choices: [{ delta: { role: "assistant" }, finish_reason: null }] })))
      const chars = text.split("")
      let i = 0
      function push() {
        if (i < chars.length) {
          const chunk = chars.slice(i, i + 5).join("")
          controller.enqueue(encoder.encode(sseEncode({ choices: [{ delta: { content: chunk }, finish_reason: null }] })))
          i += 5
          push()
        } else {
          controller.enqueue(encoder.encode(sseEncode({ choices: [{ delta: {}, finish_reason: "stop" }] })))
          controller.enqueue(encoder.encode("data: [DONE]\n"))
          controller.close()
        }
      }
      push()
    },
  })
  return new Response(ss, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" } })
}

interface ChartDataPayload {
  symbol?: string
  timeframe?: string
  candles?: { t: number; o: number; h: number; l: number; c: number; v: number }[]
  rsi?: string
  macd?: { macd: string; signal: string; hist: string } | null
  sma?: string[] | null
  ema?: string[] | null
  bb?: { upper: string; lower: string } | null
}

function extractChartData(content: string): ChartDataPayload | null {
  try {
    const match = content.match(/\{[\s\S]*"candles"[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0]) as ChartDataPayload
    if (parsed.candles && Array.isArray(parsed.candles) && parsed.candles.length > 0) return parsed
    return null
  } catch { return null }
}

function candlesFromPayload(p: ChartDataPayload): Candle[] | null {
  if (!p.candles || p.candles.length < 10) return null
  return p.candles.map(c => ({
    time: c.t,
    open: c.o,
    high: c.h,
    low: c.l,
    close: c.c,
    volume: c.v,
  }))
}

function extractSymbol(text: string): string | null {
  const m = text.match(/\b([A-Z]{2,5})\b/g)
  if (!m) return null
  for (const s of m) {
    if (CRYPTO_SYMBOLS.has(s)) return s
    if (["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","BRK","JPM","V","JNJ","WMT","COIN","HOOD","SPY","QQQ"].includes(s)) return s
  }
  return m[0] ?? null
}

function generateFromCandles(candles: Candle[], symbol: string, timeframe: string): string {
  const indicators = calcAllIndicators(candles)
  const sr = findSupportResistance(candles)
  const last = candles[candles.length - 1]
  const prev = candles.length > 1 ? candles[candles.length - 2] : last
  const change = ((last.close - prev.close) / prev.close * 100).toFixed(2)

  const sma20 = indicators.sma?.[indicators.sma.length - 1] ?? last.close
  const ema20 = indicators.ema?.[indicators.ema.length - 1] ?? last.close
  const rsi = indicators.rsi?.value ?? 50
  const rsiSig = rsi > 70 ? "overbought" : rsi < 30 ? "oversold" : "neutral"
  const macd = indicators.macd
  const bb = indicators.bb

  let trend: string
  if (last.close > sma20 && last.close > ema20) trend = "uptrend"
  else if (last.close < sma20 && last.close < ema20) trend = "downtrend"
  else trend = "sideways"

  const vol = last.volume
  const volSma = indicators.volumeSMA ?? vol
  const volRatio = volSma > 0 ? (vol / volSma) : 1

  const macdSignal = macd ? (macd.macd > macd.signal ? "bullish" : "bearish") : "neutral"
  const bbPos = bb ? ((last.close - bb.lower) / (bb.upper - bb.lower)) : 0.5

  const descriptions: Record<string, string[]> = {
    trends: ["The market is currently in a {trend} on the {tf} chart.", "Price action suggests a {trend} across the {tf} timeframe.", "Looking at the {tf} chart, we can see a clear {trend}."],
    price: ["Trading at ${price} with a {change}% move in the last candle.", "Current price stands at ${price}, showing a {change}% change from the previous candle.", "Price is at ${price}, moving {change}% since the last period."],
    ma: ["The 20-period SMA at ${sma} and EMA at ${ema} confirm the {direction} bias.", "Moving averages show SMA (${sma}) and EMA (${ema}) — this suggests a {direction} outlook.", "Key moving averages (SMA: ${sma}, EMA: ${ema}) are aligned {direction}."],
    rsi: ["RSI at ${rsi} indicates ${signal} conditions.", "The Relative Strength Index reads ${rsi}, placing the asset in ${signal} territory.", "With RSI at ${rsi}, we're seeing ${signal} momentum."],
    macd: ["MACD shows ${signal} momentum with the histogram at ${hist}.", "The MACD indicator is ${signal} — histogram value is ${hist}.", "Momentum as measured by MACD is ${signal} (histogram: ${hist})."],
    vol: ["Volume at ${vol} is ${ratio} times the SMA — suggesting ${verdict} participation.", "Trading volume of ${vol} is ${ratio}x the average, indicating ${verdict} interest.", "Volume analysis: ${vol} vs SMA of ${vsma} (${ratio}x) — ${verdict}."],
    bb: ["Bollinger Bands show price at ${pos}% of the band range, indicating ${signal}.", "Price is positioned at ${pos}% within the Bollinger Bands — ${signal}.", "BB analysis: price at ${pos}% of band width — ${signal}."],
    support: ["Support is identified at ${sup}, with resistance at ${res}.", "Key levels: support ${sup}, resistance ${res}.", "Watch for support at ${sup} and resistance at ${res}."],
    outlook_s: [
      "Overall, the technical picture suggests a {outlook} outlook. However, always wait for confirmation before making any decisions.",
      "The technical alignment points toward a {outlook} bias. Exercise caution and manage risk accordingly.",
      "Based on the indicators, the weight of evidence favors a {outlook} scenario in the near term.",
    ],
  }

  let trendWord: string
  let direction: string
  if (trend === "uptrend") { trendWord = "strong uptrend"; direction = "bullishly" }
  else if (trend === "downtrend") { trendWord = "downtrend"; direction = "bearishly" }
  else { trendWord = "sideways consolidation"; direction = "neutrally" }

  const volVerdict = volRatio > 1.3 ? "strong" : volRatio < 0.7 ? "weak" : "normal"
  const bbSignal = bbPos < 0.2 ? "approaching oversold levels" : bbPos > 0.8 ? "approaching overbought levels" : "within normal range"
  const macdWord = macdSignal === "bullish" ? "bullish" : "bearish"

  let bullScore = 0
  if (trend === "uptrend") bullScore++
  if (rsi > 50) bullScore++
  if (macdSignal === "bullish") bullScore++
  if (bbPos > 0.5) bullScore++

  const outlook = bullScore >= 3 ? "bullish" : bullScore <= 1 ? "bearish" : "neutral"

  const template = [
    pick(descriptions.trends).replace("{trend}", trendWord),
    pick(descriptions.price).replace("{price}", last.close.toFixed(2)).replace("{change}", change),
    pick(descriptions.ma).replace("{sma}", sma20.toFixed(2)).replace("{ema}", ema20.toFixed(2)).replace("{direction}", direction),
    pick(descriptions.rsi).replace("{rsi}", rsi.toFixed(1)).replace("{signal}", rsiSig),
    pick(descriptions.macd).replace("{signal}", macdWord).replace("{hist}", (macd?.histogram ?? 0).toFixed(4)),
    pick(descriptions.bb).replace("{pos}", (bbPos * 100).toFixed(0)).replace("{signal}", bbSignal),
    pick(descriptions.vol).replace("{vol}", vol.toFixed(1)).replace("{vsma}", (volSma).toFixed(1)).replace("{ratio}", volRatio.toFixed(2)).replace("{verdict}", volVerdict),
    pick(descriptions.support).replace("{sup}", sr.support.toString()).replace("{res}", sr.resistance.toString()),
    pick(descriptions.outlook_s).replace("{outlook}", outlook),
    "",
    `> This is an educational simulation only — not financial advice.`,
  ]

  return template.join("\n\n")
}

export async function POST(request: NextRequest) {
  try {
    const { model, messages, temperature, stream } = await request.json()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const lastMsg = messages.filter((m: { role: string }) => m.role === "user").pop()?.content ?? ""
    const chartPayload = extractChartData(lastMsg)

    if (chartPayload) {
      const candles = candlesFromPayload(chartPayload)
      if (candles) {
        const sym = chartPayload.symbol ?? extractSymbol(lastMsg) ?? "Unknown"
        const tf = chartPayload.timeframe ?? "1h"
        const analysis = generateFromCandles(candles, sym, tf)
        const full = `## AI Chart Analysis — ${sym}\n\n${analysis}`
        if (stream) return createSSEResponse(full)
        return new Response(JSON.stringify({ choices: [{ message: { content: full }, finish_reason: "stop" }] }), { headers: { "Content-Type": "application/json" } })
      }
    }

    const symbol = extractSymbol(lastMsg)

    if (symbol && CRYPTO_SYMBOLS.has(symbol)) {
      const msg = `## ${symbol} Analysis\n\nI can't fetch live crypto data from this server (Binance blocks cloud IPs). Two options:\n\n1. **Use the chart** — Click the "AI" button on the TradingChart to analyze the chart directly (it sends the data from your browser).\n2. **Try a stock symbol** — Yahoo Finance works from this server (try AAPL, MSFT, TSLA, etc.).\n\n> This is an educational simulation only — not financial advice.`
      if (stream) return createSSEResponse(msg)
      return new Response(JSON.stringify({ choices: [{ message: { content: msg }, finish_reason: "stop" }] }), { headers: { "Content-Type": "application/json" } })
    }

    if (symbol) {
      const stockCandles = await fetchStockCandles(symbol, "1h").catch(() => [])
      if (stockCandles.length >= 10) {
        const analysis = generateFromCandles(stockCandles, symbol, "1h")
        const full = `## Technical Analysis — ${symbol}\n\n${analysis}`
        if (stream) return createSSEResponse(full)
        return new Response(JSON.stringify({ choices: [{ message: { content: full }, finish_reason: "stop" }] }), { headers: { "Content-Type": "application/json" } })
      }
    }

    const fallback = `Hello! I'm TradeSim's Built-in AI assistant.\n\nI can help analyze stocks (AAPL, MSFT, TSLA, etc.) using real-time Yahoo Finance data. For crypto chart analysis, use the "AI" button on the chart itself.\n\nTry asking: "Analyze AAPL" or "What's the trend for MSFT?"\n\n> This is an educational simulation only — not financial advice.`
    if (stream) return createSSEResponse(fallback)
    return new Response(JSON.stringify({ choices: [{ message: { content: fallback }, finish_reason: "stop" }] }), { headers: { "Content-Type": "application/json" } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error"
    const body = JSON.stringify({ error: msg })
    if (err instanceof SyntaxError && msg.includes("JSON")) {
      return new Response(JSON.stringify({ error: "Invalid request body", _detail: msg }), { status: 400, headers: { "Content-Type": "application/json" } })
    }
    return new Response(body, { status: 500, headers: { "Content-Type": "application/json" } })
  }
}