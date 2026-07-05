"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle, X } from "lucide-react"

const DISCLAIMER_KEY = "ts_disclaimer_accepted"

export function DisclaimerBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(DISCLAIMER_KEY)
    if (!accepted) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(DISCLAIMER_KEY, "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-amber-500/10 border-t border-amber-500/30",
      "backdrop-blur-md p-3 text-xs"
    )}>
      <div className="max-w-5xl mx-auto flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1 text-muted-foreground">
          <strong className="text-amber-500">Paper Trading Simulator</strong> — This is an educational simulation tool only.
          All trades use virtual money. The data and analysis provided are for informational purposes and do not constitute
          financial advice. Past performance does not guarantee future results. Never invest money you cannot afford to lose.
        </div>
        <button onClick={dismiss} className="text-muted-foreground hover:text-foreground shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
