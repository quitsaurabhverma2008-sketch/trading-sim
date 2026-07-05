export type AssetType = "crypto" | "stock"

export interface Asset {
  symbol: string
  name: string
  type: AssetType
  exchange: string
  precision: number
  baseAsset?: string
  quoteAsset?: string
}

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w"

export interface Ticker24h {
  symbol: string
  priceChange: number
  priceChangePercent: number
  lastPrice: number
  volume: number
  quoteVolume: number
  high: number
  low: number
  open: number
  close: number
  count: number
}

export interface OrderBookLevel {
  price: number
  quantity: number
}

export interface OrderBook {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  lastUpdateId: number
}

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error"
