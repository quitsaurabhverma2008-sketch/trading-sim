import { fetchKlines, fetchTicker24h, timeframeToBinanceInterval } from "@/lib/market/binance"
import { calcAllIndicators, findSupportResistance } from "@/lib/market/indicators"

export interface ToolDefinition {
  name: string
  description: string
  execute: (args: Record<string, string>) => Promise<string>
}

export const marketTools: ToolDefinition[] = [
  {
    name: "get_historical_data",
    description: "Get historical OHLCV candle data for a symbol",
    execute: async (args) => {
      const symbol = (args.symbol ?? "BTCUSDT").toUpperCase()
      const interval = args.interval ?? "1h"
      const limit = parseInt(args.limit ?? "100")
      try {
        const candles = await fetchKlines(symbol, interval, Math.min(limit, 500))
        if (candles.length === 0) return `No data found for ${symbol}`
        const latest = candles[candles.length - 1]
        const indicators = calcAllIndicators(candles)
        const sr = findSupportResistance(candles)
        const first = candles[0]
        const change = ((latest.close - first.open) / first.open * 100).toFixed(2)

        return JSON.stringify({
          symbol,
          interval,
          period: `${new Date(first.time * 1000).toISOString().split("T")[0]} to ${new Date(latest.time * 1000).toISOString().split("T")[0]}`,
          currentPrice: latest.close,
          high: latest.high,
          low: latest.low,
          open: first.open,
          close: latest.close,
          changePercent: `${change}%`,
          volume: latest.volume,
          candlesCount: candles.length,
          support: sr.support,
          resistance: sr.resistance,
          rsi: indicators.rsi?.value?.toFixed(2),
          rsiSignal: indicators.rsi ? (indicators.rsi.overbought ? "overbought" : indicators.rsi.oversold ? "oversold" : "neutral") : "N/A",
          macd: indicators.macd?.macd?.toFixed(4),
          macdSignal: indicators.macd?.signal?.toFixed(4),
          macdHistogram: indicators.macd?.histogram?.toFixed(4),
          bbUpper: indicators.bb?.upper?.toFixed(2),
          bbMiddle: indicators.bb?.middle?.toFixed(2),
          bbLower: indicators.bb?.lower?.toFixed(2),
          volumeSMA: indicators.volumeSMA?.toFixed(2),
        })
      } catch (err) {
        return `Error fetching data for ${symbol}: ${err instanceof Error ? err.message : "Unknown error"}`
      }
    },
  },
  {
    name: "get_realtime_quote",
    description: "Get current real-time price and 24h stats for a symbol",
    execute: async (args) => {
      const symbol = (args.symbol ?? "BTCUSDT").toUpperCase()
      try {
        const ticker = await fetchTicker24h(symbol)
        return JSON.stringify({
          symbol: ticker.symbol,
          price: ticker.lastPrice,
          change24h: ticker.priceChange,
          changePercent24h: `${ticker.priceChangePercent}%`,
          high24h: ticker.high,
          low24h: ticker.low,
          volume24h: ticker.volume,
          quoteVolume24h: ticker.quoteVolume,
        })
      } catch (err) {
        return `Error fetching quote for ${symbol}: ${err instanceof Error ? err.message : "Unknown error"}`
      }
    },
  },
  {
    name: "get_technical_analysis",
    description: "Compute technical indicators for a symbol",
    execute: async (args) => {
      const symbol = (args.symbol ?? "BTCUSDT").toUpperCase()
      const interval = args.interval ?? "1h"
      const limit = parseInt(args.limit ?? "200")
      try {
        const candles = await fetchKlines(symbol, interval, Math.min(limit, 500))
        if (candles.length === 0) return `No data found for ${symbol}`
        const indicators = calcAllIndicators(candles)
        const sr = findSupportResistance(candles)
        const latest = candles[candles.length - 1]

        let trend = "sideways"
        const sma20 = indicators.sma?.[indicators.sma.length - 1] ?? 0
        const ema20 = indicators.ema?.[indicators.ema.length - 1] ?? 0
        if (latest.close > sma20 && latest.close > ema20) trend = "uptrend"
        else if (latest.close < sma20 && latest.close < ema20) trend = "downtrend"

        return JSON.stringify({
          symbol,
          interval,
          trend,
          currentPrice: latest.close,
          sma20: sma20.toFixed(2),
          ema20: ema20.toFixed(2),
          rsi: indicators.rsi,
          macd: indicators.macd,
          bollingerBands: indicators.bb,
          supportResistance: sr,
          volumeSMA: indicators.volumeSMA?.toFixed(2),
          currentVolume: latest.volume,
          candleCount: candles.length,
        })
      } catch (err) {
        return `Error analyzing ${symbol}: ${err instanceof Error ? err.message : "Unknown error"}`
      }
    },
  },
]

export async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  const tool = marketTools.find((t) => t.name === name)
  if (!tool) return `Unknown tool: ${name}`
  return tool.execute(args)
}
