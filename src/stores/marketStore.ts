import { create } from "zustand"
import type { Candle, Ticker24h, ConnectionStatus, Timeframe, OrderBook } from "@/types"

interface MarketState {
  candles: Record<string, Candle[]>
  realtimePrices: Record<string, number>
  tickers: Record<string, Ticker24h>
  orderBooks: Record<string, OrderBook>
  connectionStatus: ConnectionStatus
  activeSymbol: string
  activeTimeframe: Timeframe

  setCandles: (symbol: string, candles: Candle[], timeframe: Timeframe) => void
  updateLastCandle: (symbol: string, candle: Candle, timeframe: Timeframe) => void
  addRealtimePrice: (symbol: string, price: number) => void
  setTickers: (tickers: Record<string, Ticker24h>) => void
  setOrderBook: (symbol: string, book: OrderBook) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setActiveSymbol: (symbol: string) => void
  setActiveTimeframe: (tf: Timeframe) => void
}

function getCandleKey(symbol: string, timeframe: Timeframe): string {
  return `${symbol}:${timeframe}`
}

export const useMarketStore = create<MarketState>()((set) => ({
  candles: {},
  realtimePrices: {},
  tickers: {},
  orderBooks: {},
  connectionStatus: "disconnected",
  activeSymbol: "BTCUSDT",
  activeTimeframe: "1h",

  setCandles: (symbol, newCandles, timeframe) => {
    const key = getCandleKey(symbol, timeframe)
    set((state) => ({
      candles: { ...state.candles, [key]: newCandles },
    }))
  },

  updateLastCandle: (symbol, candle, timeframe) => {
    const key = getCandleKey(symbol, timeframe)
    set((state) => {
      const existing = state.candles[key] ?? []
      const idx = existing.findIndex((c) => c.time === candle.time)
      if (idx >= 0) {
        const updated = [...existing]
        updated[idx] = candle
        return { candles: { ...state.candles, [key]: updated } }
      }
      return { candles: { ...state.candles, [key]: [...existing, candle] } }
    })
  },

  addRealtimePrice: (symbol, price) => {
    set((state) => ({
      realtimePrices: { ...state.realtimePrices, [symbol]: price },
    }))
  },

  setTickers: (tickers) => {
    set((state) => ({
      tickers: { ...state.tickers, ...tickers },
    }))
  },

  setOrderBook: (symbol, book) => {
    set((state) => ({
      orderBooks: { ...state.orderBooks, [symbol]: book },
    }))
  },

  setConnectionStatus: (status) => {
    set({ connectionStatus: status })
  },

  setActiveSymbol: (symbol) => {
    set({ activeSymbol: symbol })
  },

  setActiveTimeframe: (tf) => {
    set({ activeTimeframe: tf })
  },
}))
