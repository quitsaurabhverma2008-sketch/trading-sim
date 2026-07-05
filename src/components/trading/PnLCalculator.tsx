"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PnLCalculator() {
  const [entryPrice, setEntryPrice] = useState("")
  const [exitPrice, setExitPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [side, setSide] = useState<"long" | "short">("long")

  const entry = parseFloat(entryPrice) || 0
  const exit = parseFloat(exitPrice) || 0
  const qty = parseFloat(quantity) || 0

  const isLong = side === "long"
  const priceDiff = isLong ? exit - entry : entry - exit
  const pnl = priceDiff * qty
  const roi = entry > 0 ? (priceDiff / entry) * 100 : 0
  const isProfit = pnl >= 0

  return (
    <div className="space-y-3 p-3">
      <div className="flex gap-2">
        <button
          onClick={() => setSide("long")}
          className={`flex-1 py-1.5 text-xs font-medium rounded ${side === "long" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
        >
          Long
        </button>
        <button
          onClick={() => setSide("short")}
          className={`flex-1 py-1.5 text-xs font-medium rounded ${side === "short" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"}`}
        >
          Short
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <Label className="text-xs">Entry Price</Label>
          <Input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="0.00" className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-xs">Exit Price</Label>
          <Input type="number" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} placeholder="0.00" className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-xs">Quantity</Label>
          <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0.00" className="h-8 text-xs" />
        </div>
      </div>

      {(entry > 0 && qty > 0) && (
        <div className="space-y-1 pt-2 border-t">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">PnL</span>
            <span className={`font-mono font-medium ${isProfit ? "text-emerald-500" : "text-red-500"}`}>
              {isProfit ? "+" : ""}{pnl.toFixed(2)} USDT
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">ROI</span>
            <span className={`font-mono font-medium ${isProfit ? "text-emerald-500" : "text-red-500"}`}>
              {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%
            </span>
          </div>
          {exit > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Exit Value</span>
              <span className="font-mono">{(exit * qty).toFixed(2)} USDT</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
