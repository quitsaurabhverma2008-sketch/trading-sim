export type OrderSide = "buy" | "sell"
export type OrderType = "market" | "limit" | "stop_loss"
export type OrderStatus = "pending" | "open" | "filled" | "partial" | "cancelled" | "rejected"

export interface Order {
  id: string
  assetSymbol: string
  side: OrderSide
  type: OrderType
  quantity: number
  price: number
  stopPrice?: number
  status: OrderStatus
  filledQuantity: number
  avgFillPrice: number
  createdAt: number
  updatedAt: number
}

export interface Position {
  assetSymbol: string
  assetType: "crypto" | "stock"
  quantity: number
  avgEntryPrice: number
  currentPrice: number
  unrealizedPnl: number
  unrealizedPnlPercent: number
  realizedPnl: number
}

export interface Trade {
  id: string
  assetSymbol: string
  assetName: string
  side: OrderSide
  type: OrderType
  quantity: number
  price: number
  total: number
  fee: number
  pnl: number
  pnlPercent: number
  timestamp: number
}

export interface PortfolioSummary {
  totalBalance: number
  cashBalance: number
  positionsValue: number
  totalPnl: number
  totalPnlPercent: number
  winRate: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
}
