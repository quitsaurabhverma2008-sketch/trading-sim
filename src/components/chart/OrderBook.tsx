"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { fetchOrderBook } from "@/lib/market/binance"
import { formatPrice, formatQuantity } from "@/lib/utils"

const LEVELS = 15

export function OrderBook() {
  const { activeSymbol, activeAssetType } = useMarketStore()
  const [bids, setBids] = useState<{ price: number; qty: number; total: number }[]>([])
  const [asks, setAsks] = useState<{ price: number; qty: number; total: number }[]>([])
  const [maxBidTotal, setMaxBidTotal] = useState(0)
  const [maxAskTotal, setMaxAskTotal] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const fetchData = useCallback(async () => {
    if (activeAssetType !== "crypto") return
    try {
      const book = await fetchOrderBook(activeSymbol, LEVELS)
      if (!book) return

      let bidTotal = 0
      const b = book.bids.slice(0, LEVELS).map((l) => {
        bidTotal += l.price * l.quantity
        return { price: l.price, qty: l.quantity, total: bidTotal }
      })
      setBids(b)
      setMaxBidTotal(bidTotal)

      let askTotal = 0
      const a = book.asks.slice(0, LEVELS).map((l) => {
        askTotal += l.price * l.quantity
        return { price: l.price, qty: l.quantity, total: askTotal }
      })
      setAsks(a)
      setMaxAskTotal(askTotal)
    } catch {}
  }, [activeSymbol, activeAssetType])

  useEffect(() => {
    fetchData()
    timerRef.current = setInterval(fetchData, 3000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchData])

  if (activeAssetType !== "crypto") {
    return (
      <div className="p-4 text-xs text-muted-foreground text-center">
        Order book only available for crypto
      </div>
    )
  }

  const maxTotal = Math.max(maxBidTotal, maxAskTotal)

  return (
    <div className="text-xs font-mono">
      <div className="text-[10px] uppercase text-muted-foreground font-sans font-medium px-2 py-1.5 border-b flex justify-between">
        <span>Price (USDT)</span>
        <span>Amount</span>
        <span>Total</span>
      </div>

      <div className="space-y-[1px] px-2 py-1">
        {asks.slice().reverse().map((a, i) => (
          <div key={i} className="flex justify-between relative py-[1px]">
            <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${(a.total / maxTotal) * 100}%` }} />
            <span className="relative text-red-500 w-[40%]">{formatPrice(a.price)}</span>
            <span className="relative text-right w-[30%]">{formatQuantity(a.qty)}</span>
            <span className="relative text-right w-[30%] text-muted-foreground">{a.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="text-center text-[10px] py-1 border-y text-muted-foreground font-sans">
        Spread: {asks.length > 0 && bids.length > 0 ? formatPrice(asks[0].price - bids[0].price) : "—"}
      </div>

      <div className="space-y-[1px] px-2 py-1">
        {bids.map((b, i) => (
          <div key={i} className="flex justify-between relative py-[1px]">
            <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10" style={{ width: `${(b.total / maxTotal) * 100}%` }} />
            <span className="relative text-emerald-500 w-[40%]">{formatPrice(b.price)}</span>
            <span className="relative text-right w-[30%]">{formatQuantity(b.qty)}</span>
            <span className="relative text-right w-[30%] text-muted-foreground">{b.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
