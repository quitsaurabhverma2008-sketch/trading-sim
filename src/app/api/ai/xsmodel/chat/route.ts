import { NextRequest } from "next/server"
import { executeTool } from "@/lib/ai/tools"
import { fetchKlinesDirect } from "@/lib/market/binance"
import { calcAllIndicators, findSupportResistance } from "@/lib/market/indicators"

const SYMBOL_RE = /\b([A-Z]{2,5})\b/g
const CRYPTO_SYMBOLS = new Set([
  "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "DOT", "LINK",
  "MATIC", "ATOM", "UNI", "ARB", "OP", "NEAR", "APT", "LTC", "BCH", "FIL",
  "AAVE", "ALGO", "AXS", "SAND", "MANA", "GALA", "FTM", "CRV", "EOS", "TRX",
])

const SAMPLE_RESPONSES: Record<string, string> = {
  trend: `## Trend Analysis

The current trend shows {trend} across the analyzed timeframe. Price is currently at ${"${"}price} with the 20-period SMA at ${"${"}sma20} and EMA at ${"${"}ema20}.

**Key Observations:**
- SMA/EMA cross: {smaEmaSignal}
- Price action relative to moving averages: {priceVsMA}
- Volume analysis: Volume is at ${"${"}volume} vs SMA of ${"${"}volSma}, suggesting {volumeSignal}

**Confidence:** {confidence}`,

  rsi: `## RSI Analysis

The Relative Strength Index (RSI) is currently at ${"${"}rsi}.

- RSI > 70: Overbought territory — potential reversal or pullback
- RSI < 30: Oversold territory — potential bounce or recovery
- RSI 30-70: Neutral zone — no extreme signals

**Signal:** {rsiSignal}
**Confidence:** {confidence}`,

  macd: `## MACD Analysis

**MACD Line:** ${"${"}macd}
**Signal Line:** ${"${"}macdSignal}
**Histogram:** ${"${"}macdHistogram}

{MACDCross}

**Confidence:** {confidence}`,

  bb: `## Bollinger Bands Analysis

**Upper Band:** ${"${"}bbUpper}
**Middle Band (SMA):** ${"${"}bbMiddle}
**Lower Band:** ${"${"}bbLower}

{bbSignal}

**Confidence:** {confidence}`,

  summary: `## Summary & Outlook

Based on the technical analysis of ${"${"}symbol} on the ${"${"}interval} timeframe:

**Overall Trend:** {trend}
**Key Levels:** Support at ${"${"}support}, Resistance at ${"${"}resistance}
**RSI:** ${"${"}rsi} ({rsiSignal})
**MACD:** {MACDSummary}

**Trading View:** {outlook}

> This is an educational simulation only — not financial advice.`,
}

function formatTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? k)
}

function generateAnalysis(data: Record<string, string>, symbol: string): string[] {
  const price = parseFloat(data.price || "0")
  const sma20 = parseFloat(data.sma20 || "0")
  const ema20 = parseFloat(data.ema20 || "0")
  const rsiVal = parseFloat(data.rsi || "50")
  const macd = parseFloat(data.macd || "0")
  const macdSig = parseFloat(data.macdSignal || "0")
  const macdHist = parseFloat(data.macdHistogram || "0")

  let trend = "sideways"
  if (price > sma20 && price > ema20) trend = "uptrend"
  else if (price < sma20 && price < ema20) trend = "downtrend"

  const smaEmaSignal = sma20 > ema20 ? "SMA above EMA — bullish alignment" : "SMA below EMA — bearish alignment"
  const priceVsMA = price > sma20 && price > ema20 ? "Price trading above both MAs — bullish" : price < sma20 && price < ema20 ? "Price trading below both MAs — bearish" : "Price mixed relative to MAs"
  const vol = parseFloat(data.volume || "0")
  const volSma = parseFloat(data.volSma || "1")
  const volumeSignal = vol > volSma * 1.5 ? "above average volume, confirming conviction" : vol < volSma * 0.5 ? "below average volume, weak participation" : "normal volume levels"

  const rsiSignal = rsiVal > 70 ? "Overbought — caution for longs" : rsiVal < 30 ? "Oversold — watch for bounce" : "Neutral"
  const rsiConfidence = rsiVal > 80 || rsiVal < 20 ? "High" : rsiVal > 70 || rsiVal < 30 ? "Medium" : "Low"

  const macdCross = macd > macdSig ? "MACD above signal line — bullish momentum" : macd < macdSig ? "MACD below signal line — bearish momentum" : "MACD crossing signal line — watch for trend change"
  const MACDSummary = macd > macdSig ? "Bullish (MACD above signal)" : "Bearish (MACD below signal)"

  const bbUpper = parseFloat(data.bbUpper || "0")
  const bbLower = parseFloat(data.bbLower || "0")
  const bbMiddle = (bbUpper + bbLower) / 2
  let bbSignal = "Price within bands — normal conditions"
  if (price >= bbUpper) bbSignal = "Price touching upper band — overextended"
  else if (price <= bbLower) bbSignal = "Price touching lower band — potential bounce zone"

  let outlook: string
  const bullSignals = (trend === "uptrend" ? 1 : 0) + (rsiVal > 50 && rsiVal < 70 ? 1 : 0) + (macd > macdSig ? 1 : 0) + (price >= bbMiddle ? 1 : 0)
  if (bullSignals >= 3) outlook = "Bullish bias — multiple indicators align positively"
  else if (bullSignals <= 1) outlook = "Bearish bias — multiple indicators suggest weakness"
  else outlook = "Neutral — mixed signals, wait for confirmation"

  const vars: Record<string, string> = {
    symbol, price: price.toFixed(2),
    sma20: sma20.toFixed(2), ema20: ema20.toFixed(2),
    rsi: rsiVal.toFixed(1), rsiSignal,
    macd: macd.toFixed(4), macdSignal: macdSig.toFixed(4), macdHistogram: macdHist.toFixed(4),
    bbUpper: bbUpper.toFixed(2), bbMiddle: bbMiddle.toFixed(2), bbLower: bbLower.toFixed(2),
    volume: vol.toFixed(2), volSma: volSma.toFixed(2),
    support: data.support || "N/A", resistance: data.resistance || "N/A",
    interval: data.interval || "1h",
    trend, smaEmaSignal, priceVsMA, volumeSignal,
    MACDCross: macdCross, MACDSummary,
    bbSignal, outlook,
    confidence: rsiConfidence,
  }

  return [
    formatTemplate(SAMPLE_RESPONSES.trend, vars),
    "",
    formatTemplate(SAMPLE_RESPONSES.rsi, vars),
    "",
    formatTemplate(SAMPLE_RESPONSES.macd, vars),
    "",
    formatTemplate(SAMPLE_RESPONSES.bb, vars),
    "",
    formatTemplate(SAMPLE_RESPONSES.summary, vars),
  ]
}

async function fetchCryptoDataDirect(symbol: string): Promise<Record<string, string> | null> {
  try {
    const candles = await fetchKlinesDirect(`${symbol}USDT`, "1h", 200)
    if (!candles || candles.length === 0) return null
    const indicators = calcAllIndicators(candles)
    const sr = findSupportResistance(candles)
    const latest = candles[candles.length - 1]
    const macd = indicators.macd
    const bb = indicators.bb

    return {
      symbol: `${symbol}USDT`,
      price: latest.close.toString(),
      interval: "1h",
      trend: latest.close > (indicators.sma?.[indicators.sma.length - 1] ?? 0) ? "uptrend" : "downtrend",
      sma20: (indicators.sma?.[indicators.sma.length - 1] ?? 0).toString(),
      ema20: (indicators.ema?.[indicators.ema.length - 1] ?? 0).toString(),
      rsi: (indicators.rsi?.value ?? 50).toString(),
      macd: (macd?.macd ?? 0).toString(),
      macdSignal: (macd?.signal ?? 0).toString(),
      macdHistogram: (macd?.histogram ?? 0).toString(),
      bbUpper: (bb?.upper ?? 0).toString(),
      bbLower: (bb?.lower ?? 0).toString(),
      volume: latest.volume.toString(),
      volSma: (indicators.volumeSMA ?? 0).toString(),
      support: sr.support.toString(),
      resistance: sr.resistance.toString(),
    }
  } catch {
    return null
  }
}

function extractSymbols(text: string): string[] {
  const found = new Set<string>()
  for (const m of text.matchAll(SYMBOL_RE)) {
    const s = m[1]
    if (CRYPTO_SYMBOLS.has(s)) found.add(s)
    if (["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","BRK","JPM","V","JNJ","WMT"].includes(s)) found.add(s)
  }
  return [...found]
}

function nonStreamingResponse(data: Record<string, string>, symbol: string): string {
  return generateAnalysis(data, symbol).join("\n")
}

export async function POST(request: NextRequest) {
  try {
    const { model, messages, temperature, stream } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const lastMsg = messages.filter((m: { role: string }) => m.role === "user").pop()?.content ?? ""
    const symbols = extractSymbols(lastMsg)
    const symbol = symbols[0] || "BTC"

    let data: Record<string, string> | null = null

    if (CRYPTO_SYMBOLS.has(symbol)) {
      data = await fetchCryptoDataDirect(symbol)
    } else {
      try {
        const result = await executeTool("get_realtime_quote", { symbol: `${symbol}USDT` })
        if (result && !result.startsWith("Error")) {
          const parsed = JSON.parse(result) as Record<string, string | number>
          data = {}
          for (const [k, v] of Object.entries(parsed)) data[k] = String(v)
          if (data) data.interval = "1h"
        }
      } catch {}
      if (!data) {
        try {
          const result = await executeTool("get_historical_data", { symbol, interval: "1h", limit: "200" })
          if (result && !result.startsWith("Error")) {
            const parsed = JSON.parse(result) as Record<string, string | number>
            data = {}
            for (const [k, v] of Object.entries(parsed)) data[k] = String(v)
          }
        } catch {}
      }
    }

    if (!data) {
      const fallback = `I'm sorry, I couldn't fetch live market data for ${symbol} right now. This might be due to API limitations on the free tier. Please try again later or check a different symbol.\n\n> This is an educational simulation only — not financial advice.`

      if (stream) {
        const encoder = new TextEncoder()
        const ss = new ReadableStream({
          start(controller) {
            const words = fallback.split(" ")
            let i = 0
            function push() {
              if (i < words.length) {
                const chunk = (i === 0 ? "" : " ") + words[i]
                controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"${chunk}"},"finish_reason":null}]}\n`))
                i++
                setTimeout(push, 30)
              } else {
                controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n`))
                controller.enqueue(encoder.encode("data: [DONE]\n"))
                controller.close()
              }
            }
            push()
          },
        })
        return new Response(ss, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } })
      }

      return new Response(JSON.stringify({ choices: [{ message: { content: fallback }, finish_reason: "stop" }] }), { headers: { "Content-Type": "application/json" } })
    }

    const analysis = nonStreamingResponse(data, symbol)

    const preamble = `# Technical Analysis for ${symbol}\n\n`
    const fullResponse = preamble + analysis + `\n\n*Analysis generated by TradeSim Built-in AI using real-time market data.*`

    if (stream) {
      const encoder = new TextEncoder()
      const ss = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"role":"assistant"},"finish_reason":null}]}\n`))
          const lines = fullResponse.split("\n")
          for (const line of lines) {
            const chunk = line + "\n"
            controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"${chunk.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"},"finish_reason":null}]}\n`))
          }
          controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n`))
          controller.enqueue(encoder.encode("data: [DONE]\n"))
          controller.close()
        },
      })
      return new Response(ss, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } })
    }

    return new Response(JSON.stringify({ choices: [{ message: { content: fullResponse }, finish_reason: "stop" }] }), { headers: { "Content-Type": "application/json" } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error"
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
}