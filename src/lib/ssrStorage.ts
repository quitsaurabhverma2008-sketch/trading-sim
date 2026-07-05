import type { StateStorage } from "zustand/middleware"

export const ssrStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(name, value)
    } catch {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith("ts_") && k !== "ts_enc_key") {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
      try {
        localStorage.setItem(name, value)
      } catch {
      }
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(name)
  },
}
