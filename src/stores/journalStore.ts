import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ssrStorage } from "@/lib/ssrStorage"
import { generateId } from "@/lib/utils"

export interface TradeJournalEntry {
  id: string
  symbol: string
  side: "buy" | "sell"
  entryPrice: number
  exitPrice: number | null
  quantity: number
  entryDate: number
  exitDate: number | null
  pnl: number | null
  pnlPercent: number | null
  strategy: string
  notes: string
  emotions: string
  lessons: string
  tags: string[]
  rating: 1 | 2 | 3 | 4 | 5
  aiEnriched: boolean
  aiAnalysis: string | null
}

interface JournalState {
  entries: TradeJournalEntry[]
  addEntry: (entry: Omit<TradeJournalEntry, "id" | "aiEnriched" | "aiAnalysis">) => void
  updateEntry: (id: string, partial: Partial<TradeJournalEntry>) => void
  deleteEntry: (id: string) => void
  closeTrade: (id: string, exitPrice: number, exitDate: number) => void
  enrichWithAI: (id: string, analysis: string) => void
  getStats: () => JournalStats
  clearEntries: () => void
}

export interface JournalStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnl: number
  avgPnl: number
  avgWinPnl: number
  avgLossPnl: number
  profitFactor: number
  bestTrade: number
  worstTrade: number
  avgHoldingPeriod: number
  topStrategy: string
  currentStreak: number
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) => {
        set((state) => ({
          entries: [{ ...entry, id: generateId(), aiEnriched: false, aiAnalysis: null }, ...state.entries],
        }))
      },

      updateEntry: (id, partial) => {
        set((state) => ({
          entries: state.entries.map((e) => e.id === id ? { ...e, ...partial } : e),
        }))
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }))
      },

      closeTrade: (id, exitPrice, exitDate) => {
        set((state) => {
          const entry = state.entries.find((e) => e.id === id)
          if (!entry || entry.exitPrice) return state
          const pnl = entry.side === "buy"
            ? (exitPrice - entry.entryPrice) * entry.quantity
            : (entry.entryPrice - exitPrice) * entry.quantity
          const pnlPercent = entry.side === "buy"
            ? ((exitPrice - entry.entryPrice) / entry.entryPrice) * 100
            : ((entry.entryPrice - exitPrice) / entry.entryPrice) * 100
          return {
            entries: state.entries.map((e) =>
              e.id === id ? { ...e, exitPrice, exitDate, pnl, pnlPercent } : e
            ),
          }
        })
      },

      enrichWithAI: (id, analysis) => {
        set((state) => ({
          entries: state.entries.map((e) => e.id === id ? { ...e, aiEnriched: true, aiAnalysis: analysis } : e),
        }))
      },

      getStats: () => {
        const { entries } = get()
        const closed = entries.filter((e) => e.pnl !== null)
        const winning = closed.filter((e) => e.pnl! > 0)
        const losing = closed.filter((e) => e.pnl! < 0)
        const totalPnl = closed.reduce((sum, e) => sum + (e.pnl ?? 0), 0)
        const winRate = closed.length > 0 ? (winning.length / closed.length) * 100 : 0
        const profitFactor = losing.reduce((sum, e) => sum + Math.abs(e.pnl ?? 0), 0) > 0
          ? winning.reduce((sum, e) => sum + (e.pnl ?? 0), 0) / losing.reduce((sum, e) => sum + Math.abs(e.pnl ?? 0), 0)
          : winning.length > 0 ? Infinity : 0

        const strategyCounts: Record<string, number> = {}
        closed.forEach((e) => {
          strategyCounts[e.strategy] = (strategyCounts[e.strategy] || 0) + 1
        })
        const topStrategy = Object.entries(strategyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""

        let streak = 0
        const sortedByDate = [...closed].sort((a, b) => (b.exitDate ?? 0) - (a.exitDate ?? 0))
        for (const trade of sortedByDate) {
          if ((trade.pnl ?? 0) > 0) streak++
          else break
        }

        return {
          totalTrades: closed.length,
          winningTrades: winning.length,
          losingTrades: losing.length,
          winRate,
          totalPnl,
          avgPnl: closed.length > 0 ? totalPnl / closed.length : 0,
          avgWinPnl: winning.length > 0 ? winning.reduce((s, e) => s + (e.pnl ?? 0), 0) / winning.length : 0,
          avgLossPnl: losing.length > 0 ? losing.reduce((s, e) => s + (e.pnl ?? 0), 0) / losing.length : 0,
          profitFactor,
          bestTrade: closed.length > 0 ? Math.max(...closed.map((e) => e.pnl ?? 0)) : 0,
          worstTrade: closed.length > 0 ? Math.min(...closed.map((e) => e.pnl ?? 0)) : 0,
          avgHoldingPeriod: closed.filter((e) => e.exitDate && e.entryDate).reduce((s, e) => s + ((e.exitDate! - e.entryDate) / 3600000), 0) / (closed.filter((e) => e.exitDate).length || 1),
          topStrategy,
          currentStreak: streak,
        }
      },

      clearEntries: () => {
        set({ entries: [] })
      },
    }),
    {
      name: "ts_journal",
      storage: createJSONStorage(() => ssrStorage),
      partialize: (state) => ({ entries: state.entries }),
    }
  )
)
