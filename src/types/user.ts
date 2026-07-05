export interface UserSettings {
  displayName: string
  currency: "USD" | "INR" | "EUR" | "GBP"
  theme: "light" | "dark" | "system"
  demoBalance: number
  riskPerTrade: number
  preferredTimeframe: string
}

export interface WatchlistItem {
  symbol: string
  name: string
  type: "crypto" | "stock"
  addedAt: number
}

export interface PriceAlert {
  id: string
  symbol: string
  type: "crypto" | "stock"
  direction: "above" | "below"
  price: number
  triggered: boolean
  createdAt: number
}

export interface UserSession {
  token: string
  email: string
  displayName: string
  createdAt: number
  expiresAt: number
}
