import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ssrStorage } from "@/lib/ssrStorage"
import { STORAGE_KEYS } from "@/lib/constants"
import type { WatchlistItem } from "@/types"

interface WatchlistState {
  items: WatchlistItem[]
  toggle: (symbol: string, name: string, type: "crypto" | "stock") => void
  add: (item: WatchlistItem) => void
  remove: (symbol: string) => void
  isWatched: (symbol: string) => boolean
  clear: () => void
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (symbol, name, type) => {
        const existing = get().items.find((i) => i.symbol === symbol)
        if (existing) {
          set((state) => ({
            items: state.items.filter((i) => i.symbol !== symbol),
          }))
        } else {
          set((state) => ({
            items: [...state.items, { symbol, name, type, addedAt: Date.now() }],
          }))
        }
      },

      add: (item) => {
        set((state) => ({
          items: state.items.some((i) => i.symbol === item.symbol)
            ? state.items
            : [...state.items, item],
        }))
      },

      remove: (symbol) => {
        set((state) => ({
          items: state.items.filter((i) => i.symbol !== symbol),
        }))
      },

      isWatched: (symbol) => {
        return get().items.some((i) => i.symbol === symbol)
      },

      clear: () => {
        set({ items: [] })
      },
    }),
    {
      name: STORAGE_KEYS.WATCHLIST,
      storage: createJSONStorage(() => ssrStorage),
    }
  )
)
