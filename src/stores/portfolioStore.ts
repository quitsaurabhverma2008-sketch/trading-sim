import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ssrStorage } from "@/lib/ssrStorage"
import type { Position, Order, Trade, PortfolioSummary, OrderSide, OrderType } from "@/types"
import { generateId } from "@/lib/utils"
import { DEFAULT_DEMO_BALANCE, STORAGE_KEYS } from "@/lib/constants"

interface PersistedPortfolio {
  cashBalance: number
  positions: Position[]
  orders: Order[]
  trades: Trade[]
}

interface PortfolioActions {
  executeOrder: (params: {
    assetSymbol: string
    assetType: "crypto" | "stock"
    side: OrderSide
    type: OrderType
    quantity: number
    price: number
    stopPrice?: number
    currentPrice: number
  }) => { success: boolean; error?: string }
  cancelOrder: (orderId: string) => void
  updatePositionPrices: (prices: Record<string, number>) => void
  getSummary: () => PortfolioSummary
  getPosition: (symbol: string) => Position | undefined
  inPosition: (symbol: string) => boolean
  resetPortfolio: () => void
}

type PortfolioState = PersistedPortfolio & PortfolioActions

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      cashBalance: DEFAULT_DEMO_BALANCE,
      positions: [],
      orders: [],
      trades: [],

      executeOrder: ({ assetSymbol, assetType, side, type, quantity, price, stopPrice, currentPrice }) => {
        const state = get()
        const orderId = generateId()
        const totalCost = quantity * price

        if (side === "buy") {
          if (totalCost > state.cashBalance) {
            return { success: false, error: "Insufficient funds" }
          }

          const order: Order = {
            id: orderId,
            assetSymbol,
            side: "buy",
            type,
            quantity,
            price,
            stopPrice,
            status: type === "market" ? "filled" : "open",
            filledQuantity: type === "market" ? quantity : 0,
            avgFillPrice: type === "market" ? price : 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }

          if (type === "market") {
            const existingPos = state.positions.find((p) => p.assetSymbol === assetSymbol)
            const newAvgPrice = existingPos
              ? (existingPos.avgEntryPrice * existingPos.quantity + price * quantity) / (existingPos.quantity + quantity)
              : price

            const trade: Trade = {
              id: generateId(),
              assetSymbol,
              assetName: assetSymbol,
              side: "buy",
              type: "market",
              quantity,
              price,
              total: totalCost,
              fee: totalCost * 0.001,
              pnl: 0,
              pnlPercent: 0,
              timestamp: Date.now(),
            }

            set({
              cashBalance: state.cashBalance - totalCost,
              positions: state.positions
                .filter((p) => p.assetSymbol !== assetSymbol)
                .concat({
                  assetSymbol,
                  assetType,
                  quantity: existingPos ? existingPos.quantity + quantity : quantity,
                  avgEntryPrice: newAvgPrice,
                  currentPrice,
                  unrealizedPnl: 0,
                  unrealizedPnlPercent: 0,
                  realizedPnl: existingPos?.realizedPnl ?? 0,
                }),
              orders: [...state.orders, order],
              trades: [trade, ...state.trades],
            })
          } else {
            set({ orders: [...state.orders, order] })
          }
        } else {
          const pos = state.positions.find((p) => p.assetSymbol === assetSymbol)
          if (!pos || pos.quantity < quantity) {
            return { success: false, error: "Insufficient position" }
          }

          const order: Order = {
            id: orderId,
            assetSymbol,
            side: "sell",
            type,
            quantity,
            price,
            stopPrice,
            status: type === "market" ? "filled" : "open",
            filledQuantity: type === "market" ? quantity : 0,
            avgFillPrice: type === "market" ? price : 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }

          if (type === "market") {
            const pnl = (price - pos.avgEntryPrice) * quantity
            const pnlPercent = ((price - pos.avgEntryPrice) / pos.avgEntryPrice) * 100
            const remaining = pos.quantity - quantity

            const trade: Trade = {
              id: generateId(),
              assetSymbol,
              assetName: assetSymbol,
              side: "sell",
              type: "market",
              quantity,
              price,
              total: totalCost,
              fee: totalCost * 0.001,
              pnl,
              pnlPercent,
              timestamp: Date.now(),
            }

            set({
              cashBalance: state.cashBalance + totalCost,
              positions: remaining > 0
                ? state.positions.map((p) =>
                    p.assetSymbol === assetSymbol
                      ? { ...p, quantity: remaining, realizedPnl: (p.realizedPnl ?? 0) + pnl }
                      : p
                  )
                : state.positions.filter((p) => p.assetSymbol !== assetSymbol),
              orders: [...state.orders, order],
              trades: [trade, ...state.trades],
            })
          } else {
            set({ orders: [...state.orders, order] })
          }
        }

        return { success: true }
      },

      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" as const, updatedAt: Date.now() } : o
          ),
        }))
      },

      updatePositionPrices: (prices) => {
        set((state) => ({
          positions: state.positions.map((p) => {
            const cp = prices[p.assetSymbol] ?? p.currentPrice
            return {
              ...p,
              currentPrice: cp,
              unrealizedPnl: (cp - p.avgEntryPrice) * p.quantity,
              unrealizedPnlPercent: ((cp - p.avgEntryPrice) / p.avgEntryPrice) * 100,
            }
          }),
        }))
      },

      getSummary: () => {
        const state = get()
        const positionsValue = state.positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0)
        const totalPnl = state.positions.reduce((sum, p) => sum + p.unrealizedPnl + (p.realizedPnl ?? 0), 0)
        const totalPnlPercent = DEFAULT_DEMO_BALANCE > 0
          ? ((state.cashBalance + positionsValue - DEFAULT_DEMO_BALANCE) / DEFAULT_DEMO_BALANCE) * 100
          : 0
        const winning = state.trades.filter((t) => t.pnl > 0).length
        const losing = state.trades.filter((t) => t.pnl < 0).length

        return {
          totalBalance: state.cashBalance + positionsValue,
          cashBalance: state.cashBalance,
          positionsValue,
          totalPnl,
          totalPnlPercent,
          winRate: state.trades.length > 0 ? (winning / state.trades.length) * 100 : 0,
          totalTrades: state.trades.length,
          winningTrades: winning,
          losingTrades: losing,
        }
      },

      getPosition: (symbol) => {
        return get().positions.find((p) => p.assetSymbol === symbol)
      },

      inPosition: (symbol) => {
        return get().positions.some((p) => p.assetSymbol === symbol && p.quantity > 0)
      },

      resetPortfolio: () => {
        set({
          cashBalance: DEFAULT_DEMO_BALANCE,
          positions: [],
          orders: [],
          trades: [],
        })
      },
    }),
    {
      name: STORAGE_KEYS.PORTFOLIO,
      storage: createJSONStorage(() => ssrStorage),
      partialize: (state) => ({
        cashBalance: state.cashBalance,
        positions: state.positions,
        orders: state.orders,
        trades: state.trades,
      }),
    }
  )
)
