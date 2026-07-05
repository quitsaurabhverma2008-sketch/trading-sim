import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ssrStorage } from "@/lib/ssrStorage"
import { STORAGE_KEYS } from "@/lib/constants"
import { generateId } from "@/lib/utils"
import type { PriceAlert } from "@/types"

interface AlertsState {
  items: PriceAlert[]
  add: (alert: Omit<PriceAlert, "id" | "triggered" | "createdAt">) => void
  remove: (id: string) => void
  markTriggered: (id: string) => void
  clear: () => void
}

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (alert) => {
        set((state) => ({
          items: [
            ...state.items,
            {
              ...alert,
              id: generateId(),
              triggered: false,
              createdAt: Date.now(),
            },
          ],
        }))
      },

      remove: (id) => {
        set((state) => ({
          items: state.items.filter((a) => a.id !== id),
        }))
      },

      markTriggered: (id) => {
        set((state) => ({
          items: state.items.map((a) =>
            a.id === id ? { ...a, triggered: true } : a
          ),
        }))
      },

      clear: () => {
        set({ items: [] })
      },
    }),
    {
      name: STORAGE_KEYS.ALERTS,
      storage: createJSONStorage(() => ssrStorage),
    }
  )
)
