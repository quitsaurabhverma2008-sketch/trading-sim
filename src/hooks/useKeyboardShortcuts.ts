"use client"

import { useEffect } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { useUIStore } from "@/stores/uiStore"
import { TIMEFRAMES } from "@/lib/constants"

export function useKeyboardShortcuts() {
  const { setActiveTimeframe, activeTimeframe } = useMarketStore()
  const { toggleAIPanel, toggleOrderPanel, toggleSidebar } = useUIStore()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return

      switch (e.key) {
        case "/":
          e.preventDefault()
          const searchInput = document.querySelector<HTMLInputElement>('input[type="text"], input[placeholder*="Search"]')
          searchInput?.focus()
          break
        case "Escape":
          {
            const activeEl = document.activeElement as HTMLElement
            if (activeEl) activeEl.blur()
          }
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
        default:
          if (e.key >= "1" && e.key <= "7") {
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
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTimeframe, setActiveTimeframe, toggleAIPanel, toggleOrderPanel, toggleSidebar])
}
