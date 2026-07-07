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

        // Volume analysis
        const recentCandles = candles.slice(-20)
        const buyerVol = recentCandles.filter(c => c.close >= c.open).reduce((s, c) => s + c.volume, 0)
        const sellerVol = recentCandles.filter(c => c.close < c.open).reduce((s, c) => s + c.volume, 0)
        const totalVol = buyerVol + sellerVol
        const buyerDominance = totalVol > 0 ? ((buyerVol / totalVol) * 100).toFixed(1) : "50.0"
        const sellerDominance = totalVol > 0 ? ((sellerVol / totalVol) * 100).toFixed(1) : "50.0"
        const volAboveSMA = indicators.volumeSMA && indicators.volumeSMA > 0 ? (latest.volume / indicators.volumeSMA * 100).toFixed(0) : "N/A"

        // Probability calculation based on indicator consensus
        const probFactors: { label: string; bullish: boolean; bearish: boolean }[] = []
        if (indicators.rsi) {
          if (indicators.rsi.value < 30) { probFactors.push({ label: "RSI Oversold", bullish: true, bearish: false }) }
          else if (indicators.rsi.value > 70) { probFactors.push({ label: "RSI Overbought", bullish: false, bearish: true }) }
          else if (indicators.rsi.value > 50) { probFactors.push({ label: "RSI Above 50", bullish: true, bearish: false }) }
          else { probFactors.push({ label: "RSI Below 50", bullish: false, bearish: true }) }
        }
        if (indicators.macd) {
          probFactors.push({ label: "MACD Histogram", bullish: indicators.macd.histogram > 0, bearish: indicators.macd.histogram <= 0 })
        }
        probFactors.push({ label: "Price vs SMA(20)", bullish: latest.close > sma20, bearish: latest.close < sma20 })
        if (regime.regime === "trending_up") { probFactors.push({ label: "Market Regime", bullish: true, bearish: false }) }
        else if (regime.regime === "trending_down") { probFactors.push({ label: "Market Regime", bullish: false, bearish: true }) }
        if (buyerDominance > "55") { probFactors.push({ label: "Volume Flow", bullish: true, bearish: false }) }
        else if (sellerDominance > "55") { probFactors.push({ label: "Volume Flow", bullish: false, bearish: true }) }
        else { probFactors.push({ label: "Volume Flow", bullish: false, bearish: false }) }

        const bullishScore = probFactors.filter(f => f.bullish).length
        const bearishScore = probFactors.filter(f => f.bearish).length
        const totalFactors = probFactors.length
        const bullishPct = totalFactors > 0 ? ((bullishScore / totalFactors) * 100).toFixed(0) : "50"
        const bearishPct = totalFactors > 0 ? ((bearishScore / totalFactors) * 100).toFixed(0) : "50"

        // Risk score based on ATR % and volatility
        let riskLevel = "Medium"
        let riskColor = "🟡"
        if (regime.atrPercent && regime.atrPercent > 4) { riskLevel = "High"; riskColor = "🔴" }
        else if (regime.atrPercent && regime.atrPercent < 1.5) { riskLevel = "Low"; riskColor = "🟢" }
        if (regime.regime === "volatile") { riskLevel = "High"; riskColor = "🔴" }

        let output = `## ${symbol} — Technical Analysis (${interval})
- **Current Price:** ${latest.close}
- **Trend:** ${trend}
- **Market Regime:** ${regime.regime} (${regime.strength})
- **ADX:** ${regime.adx?.toFixed(1) ?? "N/A"}
- **ATR:** ${regime.atr?.toFixed(2) ?? "N/A"} (${regime.atrPercent?.toFixed(2) ?? "N/A"}% of price)
- **Risk Score:** ${riskColor} ${riskLevel}
- **RSI (14):** ${indicators.rsi?.value?.toFixed(2) ?? "N/A"} — ${indicators.rsi ? (indicators.rsi.overbought ? "Overbought" : indicators.rsi.oversold ? "Oversold" : "Neutral") : "N/A"}
- **MACD:** ${indicators.macd?.macd?.toFixed(4) ?? "N/A"} | Signal: ${indicators.macd?.signal?.toFixed(4) ?? "N/A"} | Histogram: ${indicators.macd?.histogram?.toFixed(4) ?? "N/A"}
- **Bollinger Bands (20,2):** ${indicators.bb?.lower?.toFixed(2) ?? "N/A"} ← ${indicators.bb?.middle?.toFixed(2) ?? "N/A"} → ${indicators.bb?.upper?.toFixed(2) ?? "N/A"}
- **SMA (20):** ${sma20.toFixed(2)} | **EMA (20):** ${ema20.toFixed(2)}
- **Support:** ${sr.support?.toFixed(2) ?? "N/A"} | **Resistance:** ${sr.resistance?.toFixed(2) ?? "N/A"}
- **Volume Analysis:** Current ${latest.volume >= (indicators.volumeSMA ?? 0) ? "Above" : "Below"} SMA (${volAboveSMA}% of SMA) | Buyers ${buyerDominance}% | Sellers ${sellerDominance}%
- **Bullish Probability:** ${bullishPct}% | **Bearish Probability:** ${bearishPct}%
- **Decision Factors:** ${probFactors.map(f => `${f.label}=${f.bullish ? "Bullish" : f.bearish ? "Bearish" : "Neutral"}`).join(", ")}
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
]

export async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  const tool = marketTools.find((t) => t.name === name)
  if (!tool) return `Unknown tool: ${name}`
  return tool.execute(args)
}
