import { fetchKlines, fetchTicker24h, timeframeToBinanceInterval } from "@/lib/market/binance"
import {
  calcAllIndicators, findSupportResistance,
  detectCandlestickPatterns, detectChartPatterns, detectMarketRegime, calcATR,
  type RegimeInfo,
} from "@/lib/market/indicators"

export interface ToolDefinition {
  name: string
  description: string
  execute: (args: Record<string, string>) => Promise<string>
}

async function fetchCandles(symbol: string, interval: string, limit: number) {
  const [crypto, stock] = await Promise.all([
    fetchKlines(symbol, interval, limit).catch(() => null),
    import("@/lib/market/stocks").then(m => m.fetchStockCandles(symbol, interval)).catch(() => null),
  ])
  return crypto ?? stock ?? []
}

export const marketTools: ToolDefinition[] = [
  {
    name: "get_historical_data",
    description: "Get historical OHLCV candle data for a symbol. Args: symbol (default BTCUSDT), interval (1m/5m/15m/1h/4h/1d/1w), limit (max 500)",
    execute: async (args) => {
      const symbol = (args.symbol ?? "BTCUSDT").toUpperCase()
      const interval = args.interval ?? "1h"
      const limit = parseInt(args.limit ?? "100")
      try {
        const candles = await fetchCandles(symbol, interval, Math.min(limit, 500))
        if (candles.length === 0) return `No data found for ${symbol}`
        const latest = candles[candles.length - 1]
        const indicators = calcAllIndicators(candles)
        const sr = findSupportResistance(candles)
        const first = candles[0]
        const change = ((latest.close - first.open) / first.open * 100).toFixed(2)

        return `## ${symbol} — ${interval} Candle Data
- **Period:** ${new Date(first.time * 1000).toISOString().split("T")[0]} to ${new Date(latest.time * 1000).toISOString().split("T")[0]}
- **Candles:** ${candles.length}
- **Current Price:** ${latest.close}
- **Range:** ${latest.low} — ${latest.high}
- **Change (Period):** ${change}%
- **Volume:** ${latest.volume}
- **Support:** ${sr.support?.toFixed(2) ?? "N/A"} | **Resistance:** ${sr.resistance?.toFixed(2) ?? "N/A"}
- **RSI:** ${indicators.rsi?.value?.toFixed(2) ?? "N/A"} (${indicators.rsi ? (indicators.rsi.overbought ? "overbought" : indicators.rsi.oversold ? "oversold" : "neutral") : "N/A"})
- **MACD:** ${indicators.macd?.macd?.toFixed(4) ?? "N/A"} | Signal: ${indicators.macd?.signal?.toFixed(4) ?? "N/A"} | Hist: ${indicators.macd?.histogram?.toFixed(4) ?? "N/A"}
- **Bollinger Bands:** ${indicators.bb?.lower?.toFixed(2) ?? "N/A"} ← ${indicators.bb?.middle?.toFixed(2) ?? "N/A"} → ${indicators.bb?.upper?.toFixed(2) ?? "N/A"}
- **Volume (20 SMA):** ${indicators.volumeSMA?.toFixed(2) ?? "N/A"}`
      } catch (err) {
        return `Error fetching data for ${symbol}: ${err instanceof Error ? err.message : "Unknown error"}`
      }
    },
  },
  {
    name: "get_realtime_quote",
    description: "Get current real-time price and 24h stats for a symbol. Args: symbol (default BTCUSDT)",
    execute: async (args) => {
      const symbol = (args.symbol ?? "BTCUSDT").toUpperCase()
      try {
        const ticker = await fetchTicker24h(symbol)
        return `## ${ticker.symbol} — Real-Time Quote
- **Price:** ${ticker.lastPrice}
- **24h Change:** ${ticker.priceChange} (${ticker.priceChangePercent}%)
- **24h High:** ${ticker.high} | **24h Low:** ${ticker.low}
- **24h Volume:** ${ticker.volume} | **Quote Volume:** ${ticker.quoteVolume}`
      } catch (err) {
        return `Error fetching quote for ${symbol}: ${err instanceof Error ? err.message : "Unknown error"}`
      }
    },
  },
  {
    name: "get_technical_analysis",
    description: "Compute technical indicators for a symbol. Args: symbol (default BTCUSDT), interval (1m/5m/15m/1h/4h/1d/1w), limit (max 500)",
    execute: async (args) => {
      const symbol = (args.symbol ?? "BTCUSDT").toUpperCase()
      const interval = args.interval ?? "1h"
      const limit = parseInt(args.limit ?? "200")
      try {
        const candles = await fetchCandles(symbol, interval, Math.min(limit, 500))
        if (candles.length === 0) return `No data found for ${symbol}`
        const indicators = calcAllIndicators(candles)
        const sr = findSupportResistance(candles)
        const latest = candles[candles.length - 1]

        let trend = "sideways"
        const sma20 = indicators.sma?.[indicators.sma.length - 1] ?? 0
        const ema20 = indicators.ema?.[indicators.ema.length - 1] ?? 0
        if (latest.close > sma20 && latest.close > ema20) trend = "uptrend"
        else if (latest.close < sma20 && latest.close < ema20) trend = "downtrend"

        const regime = detectMarketRegime(candles)
        const candlePatterns = detectCandlestickPatterns(candles)
        const chartPatterns = detectChartPatterns(candles)

        let output = `## ${symbol} — Technical Analysis (${interval})
- **Current Price:** ${latest.close}
- **Trend:** ${trend}
- **Market Regime:** ${regime.regime} (${regime.strength})
- **ADX:** ${regime.adx?.toFixed(1) ?? "N/A"}
- **ATR:** ${regime.atr?.toFixed(4) ?? "N/A"} (${regime.atrPercent?.toFixed(2) ?? "N/A"}% of price)
- **RSI (14):** ${indicators.rsi?.value?.toFixed(2) ?? "N/A"} — ${indicators.rsi ? (indicators.rsi.overbought ? "Overbought" : indicators.rsi.oversold ? "Oversold" : "Neutral") : "N/A"}
- **MACD:** ${indicators.macd?.macd?.toFixed(4) ?? "N/A"} | Signal: ${indicators.macd?.signal?.toFixed(4) ?? "N/A"} | Histogram: ${indicators.macd?.histogram?.toFixed(4) ?? "N/A"}
- **Bollinger Bands (20,2):** ${indicators.bb?.lower?.toFixed(2) ?? "N/A"} ← ${indicators.bb?.middle?.toFixed(2) ?? "N/A"} → ${indicators.bb?.upper?.toFixed(2) ?? "N/A"}
- **SMA (20):** ${sma20.toFixed(2)} | **EMA (20):** ${ema20.toFixed(2)}
- **Support:** ${sr.support?.toFixed(2) ?? "N/A"} | **Resistance:** ${sr.resistance?.toFixed(2) ?? "N/A"}
- **Volume (20 SMA):** ${indicators.volumeSMA?.toFixed(2) ?? "N/A"} | **Current Volume:** ${latest.volume}
- **Regime:** ${regime.description}`

        if (candlePatterns.length > 0) {
          output += `\n- **Candlestick Patterns:** ${candlePatterns.map(p => `${p.name} (${p.direction}, strength ${p.strength}/5)`).join(", ")}`
        }
        if (chartPatterns.length > 0) {
          output += `\n- **Chart Patterns:** ${chartPatterns.map(p => `${p.name} (${p.direction}, strength ${p.strength}/5)`).join(", ")}`
        }

        return output
      } catch (err) {
        return `Error analyzing ${symbol}: ${err instanceof Error ? err.message : "Unknown error"}`
      }
    },
  },
  {
    name: "detect_patterns",
    description: "Detect candlestick + chart patterns for a symbol. Args: symbol, interval (default 1h), limit (default 100)",
    execute: async (args) => {
      const symbol = (args.symbol ?? "BTCUSDT").toUpperCase()
      const interval = args.interval ?? "1h"
      const limit = parseInt(args.limit ?? "100")
      try {
        const candles = await fetchCandles(symbol, interval, Math.min(limit, 200))
        if (candles.length === 0) return `No data found for ${symbol}`
        const candlePats = detectCandlestickPatterns(candles)
        const chartPats = detectChartPatterns(candles)
        const all = [...candlePats, ...chartPats]
        if (all.length === 0) return `## ${symbol} — No significant patterns detected on ${interval} timeframe`
        let output = `## ${symbol} — Pattern Detection (${interval})\n`
        for (const p of all) {
          output += `- **${p.name}** (${p.direction}, strength ${p.strength}/5): ${p.description}\n`
        }
        return output
      } catch (err) {
        return `Error detecting patterns for ${symbol}: ${err instanceof Error ? err.message : "Unknown error"}`
      }
    },
  },
  {
    name: "detect_regime",
    description: "Classify market regime (trending/ranging/volatile) for a symbol. Args: symbol, interval (default 1h), limit (default 100)",
    execute: async (args) => {
      const symbol = (args.symbol ?? "BTCUSDT").toUpperCase()
      const interval = args.interval ?? "1h"
      const limit = parseInt(args.limit ?? "100")
      try {
        const candles = await fetchCandles(symbol, interval, Math.min(limit, 200))
        if (candles.length === 0) return `No data found for ${symbol}`
        const regime = detectMarketRegime(candles)
        return `## ${symbol} — Market Regime (${interval})
- **Regime:** ${regime.regime}
- **Strength:** ${regime.strength}
- **ADX (14):** ${regime.adx?.toFixed(1) ?? "N/A"}
- **ATR (14):** ${regime.atr?.toFixed(4) ?? "N/A"}
- **ATR % of Price:** ${regime.atrPercent?.toFixed(2) ?? "N/A"}%
- **Assessment:** ${regime.description}`
      } catch (err) {
        return `Error detecting regime for ${symbol}: ${err instanceof Error ? err.message : "Unknown error"}`
      }
    },
  },
  {
    name: "compare_symbols",
    description: "Compare multiple symbols side-by-side. Args: symbols (comma-separated, default BTCUSDT,ETHUSDT), interval (default 1h)",
    execute: async (args) => {
      const symbols = (args.symbols ?? "BTCUSDT,ETHUSDT").toUpperCase().split(",").map(s => s.trim()).filter(Boolean)
      const interval = args.interval ?? "1h"
      if (symbols.length > 5) return "Maximum 5 symbols can be compared at once"
      const results: { symbol: string; price: number; change: string; rsi: string; regime: string; patterns: string }[] = []
      for (const symbol of symbols) {
        try {
          const candles = await fetchCandles(symbol, interval, 100)
          if (candles.length === 0) { results.push({ symbol, price: 0, change: "N/A", rsi: "N/A", regime: "N/A", patterns: "N/A" }); continue }
          const ind = calcAllIndicators(candles)
          const latest = candles[candles.length - 1]
          const first = candles[0]
          const change = ((latest.close - first.open) / first.open * 100).toFixed(2) + "%"
          const regime = detectMarketRegime(candles)
          const pats = [...detectCandlestickPatterns(candles), ...detectChartPatterns(candles)]
          const patSummary = pats.length > 0 ? pats.slice(0, 2).map(p => p.name).join(", ") : "none"
          results.push({
            symbol,
            price: latest.close,
            change,
            rsi: ind.rsi?.value?.toFixed(1) ?? "N/A",
            regime: regime.regime,
            patterns: patSummary,
          })
        } catch { results.push({ symbol, price: 0, change: "ERR", rsi: "ERR", regime: "ERR", patterns: "ERR" }) }
      }

      let output = `## Symbol Comparison (${interval})\n\n`
      output += `| Symbol | Price | Change | RSI | Regime | Patterns |\n`
      output += `|--------|-------|--------|-----|--------|----------|\n`
      for (const r of results) {
        output += `| ${r.symbol} | ${r.price} | ${r.change} | ${r.rsi} | ${r.regime} | ${r.patterns} |\n`
      }
      return output
    },
  },
  {
    name: "multi_timeframe_analysis",
    description: "Analyze a symbol across multiple timeframes. Args: symbol (default BTCUSDT), timeframes (comma-separated, default 1h,4h,1d)",
    execute: async (args) => {
      const symbol = (args.symbol ?? "BTCUSDT").toUpperCase()
      const timeframes = (args.timeframes ?? "1h,4h,1d").split(",").map(s => s.trim()).filter(Boolean)
      if (timeframes.length > 4) return "Maximum 4 timeframes"
      let output = `## ${symbol} — Multi-Timeframe Analysis\n\n`
      for (const tf of timeframes) {
        try {
          const candles = await fetchCandles(symbol, tf, 100)
          if (candles.length === 0) { output += `**${tf}:** No data\n\n`; continue }
          const ind = calcAllIndicators(candles)
          const latest = candles[candles.length - 1]
          const regime = detectMarketRegime(candles)
          const pats = detectCandlestickPatterns(candles)
          const sma20 = ind.sma?.[ind.sma.length - 1] ?? 0
          const trend = latest.close > sma20 ? "Up" : latest.close < sma20 ? "Down" : "Side"
          output += `**${tf}:** Price ${latest.close} | Trend ${trend} | RSI ${ind.rsi?.value?.toFixed(1) ?? "N/A"} | Regime ${regime.regime} | ${regime.adx ? `ADX ${regime.adx.toFixed(1)}` : ""}${pats.length > 0 ? ` | Pattern: ${pats[0].name}` : ""}\n`
        } catch { output += `**${tf}:** Error\n` }
      }
      return output
    },
  },
  {
    name: "predict_next_candle",
    description: "Predict next 1-3 candles for a symbol based on technical indicators and market regime. Returns structured prediction. Args: symbol (default BTCUSDT), interval (default 1h), limit (default 200)",
    execute: async (args) => {
      const symbol = (args.symbol ?? "BTCUSDT").toUpperCase()
      const interval = args.interval ?? "1h"
      const limit = parseInt(args.limit ?? "200")
      try {
        const candles = await fetchCandles(symbol, interval, Math.min(limit, 500))
        if (candles.length < 20) return `Not enough data for ${symbol} to make a prediction`
        const latest = candles[candles.length - 1]
        const prev = candles[candles.length - 2]
        const indicators = calcAllIndicators(candles)
        const regime = detectMarketRegime(candles)
        const atr = calcATR(candles)
        const atrValue = atr ?? (latest.high - latest.low) * 1.5
        const patterns = detectCandlestickPatterns(candles)
        const chartPatterns = detectChartPatterns(candles)

        const rsi = indicators.rsi?.value ?? 50
        const macdHist = indicators.macd?.histogram ?? 0
        const direction = predictDirection(
          candles.map(c => c.close),
          rsi,
          macdHist,
          regime
        )

        const range = atrValue
        const currentPrice = latest.close
        const momentum = (latest.close - prev.close) / prev.close

        let predictedOpen = currentPrice
        let predictedClose: number
        let predictedHigh: number
        let predictedLow: number
        let confidence: number

        if (direction === "bullish") {
          const move = range * (0.5 + Math.abs(momentum) * 2)
          predictedClose = currentPrice + move * (0.6 + Math.random() * 0.4)
          predictedHigh = Math.max(currentPrice, predictedClose) + range * 0.3
          predictedLow = Math.min(currentPrice, predictedClose) - range * 0.2
          confidence = Math.min(85, 50 + (regime.adx ?? 25) * 2 + Math.abs(macdHist) * 100 + (rsi > 30 && rsi < 70 ? 10 : 0))
        } else if (direction === "bearish") {
          const move = range * (0.5 + Math.abs(momentum) * 2)
          predictedClose = currentPrice - move * (0.6 + Math.random() * 0.4)
          predictedHigh = Math.max(currentPrice, predictedClose) + range * 0.2
          predictedLow = Math.min(currentPrice, predictedClose) - range * 0.3
          confidence = Math.min(85, 50 + (regime.adx ?? 25) * 2 + Math.abs(macdHist) * 100 + (rsi > 30 && rsi < 70 ? 10 : 0))
        } else {
          const noise = range * 0.3
          predictedClose = currentPrice + (Math.random() - 0.5) * noise
          predictedHigh = Math.max(currentPrice, predictedClose) + range * 0.15
          predictedLow = Math.min(currentPrice, predictedClose) - range * 0.15
          confidence = Math.min(70, 40 + (regime.adx ?? 25) * 1.5)
        }

        confidence = Math.round(Math.max(20, Math.min(95, confidence)))

        const targetPrice = direction === "bullish" ? predictedHigh * 1.01 : direction === "bearish" ? predictedLow * 0.99 : currentPrice
        const stopLoss = direction === "bullish" ? predictedLow * 0.98 : direction === "bearish" ? predictedHigh * 1.02 : currentPrice
        const rr = direction !== "neutral" ? Math.abs((targetPrice - currentPrice) / (currentPrice - stopLoss)).toFixed(2) : "—"

        let patternInfo = ""
        if (patterns.length > 0) patternInfo = `\n- **Candlestick Pattern:** ${patterns[0].name} (${patterns[0].direction})`
        if (chartPatterns.length > 0) patternInfo += `\n- **Chart Pattern:** ${chartPatterns[0].name} (${chartPatterns[0].direction})`

        let reason = ""
        if (direction === "bullish") {
          reason = rsi > 60 ? "Bullish momentum with strong RSI" : "Price action suggests upside move"
          if (macdHist > 0) reason += ", MACD positive"
          if (regime.regime === "trending_up") reason += ", in uptrend"
        } else if (direction === "bearish") {
          reason = rsi < 40 ? "Bearish pressure with weak RSI" : "Price action suggests downside move"
          if (macdHist < 0) reason += ", MACD negative"
          if (regime.regime === "trending_down") reason += ", in downtrend"
        } else {
          reason = "Mixed signals, range-bound action expected"
        }

        return `## ${symbol} — Next Candle Prediction (${interval})

**Direction:** ${direction} | **Confidence:** ${confidence}%
**Current Price:** ${currentPrice.toFixed(2)}
**Predicted Open:** ${predictedOpen.toFixed(2)}
**Predicted High:** ${predictedHigh.toFixed(2)}
**Predicted Low:** ${predictedLow.toFixed(2)}
**Predicted Close:** ${predictedClose.toFixed(2)}
**Target:** ${targetPrice.toFixed(2)} | **Stop Loss:** ${stopLoss.toFixed(2)} | **R:R:** ${rr}

**Market Regime:** ${regime.regime} (ADX: ${regime.adx?.toFixed(1) ?? "N/A"})
**RSI (14):** ${rsi.toFixed(1)} | **MACD Histogram:** ${macdHist.toFixed(4)}${patternInfo}

**Reason:** ${reason}
**Prediction Range (next candle):** ${Math.min(predictedOpen, predictedLow).toFixed(2)} — ${Math.max(predictedOpen, predictedHigh).toFixed(2)}

[PREDICTION]
symbol=${symbol}
direction=${direction}
confidence=${confidence}
currentPrice=${currentPrice.toFixed(2)}
predictedOpen=${predictedOpen.toFixed(2)}
predictedHigh=${predictedHigh.toFixed(2)}
predictedLow=${predictedLow.toFixed(2)}
predictedClose=${predictedClose.toFixed(2)}
targetPrice=${targetPrice.toFixed(2)}
stopLoss=${stopLoss.toFixed(2)}
riskReward=${rr}
reason=${reason}
[/PREDICTION]`
      } catch (err) {
        return `Error predicting for ${symbol}: ${err instanceof Error ? err.message : "Unknown error"}`
      }
    },
  },
]

function predictDirection(closes: number[], rsi: number, macdHist: number, regime: RegimeInfo): string {
  if (regime.regime === "volatile") return "neutral"
  const trend = regime.regime === "trending_up" ? "bullish" : regime.regime === "trending_down" ? "bearish" : "neutral"
  if (rsi > 70 && trend === "bullish") return "bearish"
  if (rsi < 30 && trend === "bearish") return "bullish"
  if (macdHist > 0 && trend === "bullish") return "bullish"
  if (macdHist < 0 && trend === "bearish") return "bearish"
  return trend
}


export async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  const tool = marketTools.find((t) => t.name === name)
  if (!tool) return `Unknown tool: ${name}`
  return tool.execute(args)
}
