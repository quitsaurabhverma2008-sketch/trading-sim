"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useMarketStore } from "@/stores/marketStore"
import { useUIStore } from "@/stores/uiStore"
import { TIMEFRAMES } from "@/lib/constants"
import { toast } from "sonner"

const SHORTCUTS = [
  { keys: ["g", "d"], action: "Dashboard", route: "/dashboard" },
  { keys: ["g", "p"], action: "Portfolio", route: "/dashboard/portfolio" },
  { keys: ["g", "w"], action: "Watchlist", route: "/dashboard/watchlist" },
  { keys: ["g", "s"], action: "Screeners", route: "/dashboard/screeners" },
  { keys: ["g", "a"], action: "AI Chat", route: "/dashboard/ai" },
  { keys: ["g", "b"], action: "Backtester", route: "/dashboard/backtest" },
  { keys: ["g", "j"], action: "Journal", route: "/dashboard/journal" },
  { keys: ["g", "t"], action: "Settings", route: "/dashboard/settings" },
]

export function useKeyboardShortcuts() {
  const router = useRouter()
  const { setActiveTimeframe, activeTimeframe } = useMarketStore()
  const { toggleAIPanel, toggleOrderPanel, toggleSidebar } = useUIStore()
  const pendingG = useRef(false)
  const gTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showHelp = useCallback(() => {
    const lines = SHORTCUTS.map((s) => `${s.keys.join(" → ").toUpperCase()}: ${s.action}`)
    lines.push("G → wait for second key")
    lines.push("B: AI panel | T: Trade panel | S: Sidebar")
    lines.push("1-7: Timeframes | /: Search | ?: Help")
    toast.success(lines.join("\n"), { duration: 8000 })
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return

      if (pendingG.current) {
        const shortcut = SHORTCUTS.find((s) => s.keys[1] === e.key.toLowerCase() && s.keys[0] === "g")
        if (shortcut) {
          e.preventDefault()
          router.push(shortcut.route)
        }
        pendingG.current = false
        if (gTimeout.current) clearTimeout(gTimeout.current)
        return
      }

      switch (e.key) {
        case "/":
          e.preventDefault()
          const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"], input[type="text"]')
          searchInput?.focus()
          break
        case "Escape": {
          const activeEl = document.activeElement as HTMLElement
          if (activeEl) activeEl.blur()
          break
        }
        case "g":
        case "G":
          e.preventDefault()
          pendingG.current = true
          gTimeout.current = setTimeout(() => { pendingG.current = false }, 1000)
          break
        case "b":
        case "B":
          toggleAIPanel()
          break
        case "t":
        case "T":
          toggleOrderPanel()
          break
        case "s":
        case "S":
          toggleSidebar()
          break
        case "?":
          e.preventDefault()
          showHelp()
          break
        default:
          if (e.key >= "1" && e.key <= "8") {
            const idx = parseInt(e.key) - 1
            const tf = TIMEFRAMES[idx]
            if (tf && tf.id !== activeTimeframe) {
              setActiveTimeframe(tf.id)
            }
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (gTimeout.current) clearTimeout(gTimeout.current)
    }
  }, [activeTimeframe, setActiveTimeframe, toggleAIPanel, toggleOrderPanel, toggleSidebar, router, showHelp])
}
