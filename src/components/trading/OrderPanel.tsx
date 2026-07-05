"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { usePortfolioStore } from "@/stores/portfolioStore"
import { useMarketStore } from "@/stores/marketStore"
import { useUIStore } from "@/stores/uiStore"
import { formatPrice, formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import type { OrderSide, OrderType } from "@/types"

export function OrderPanel() {
  const [side, setSide] = useState<OrderSide>("buy")
  const [orderType, setOrderType] = useState<OrderType>("market")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [stopPrice, setStopPrice] = useState("")

  const { activeSymbol, realtimePrices } = useMarketStore()
  const { cashBalance, executeOrder, getPosition } = usePortfolioStore()
  const { orderPanelOpen, toggleOrderPanel } = useUIStore()

  const currentPrice = realtimePrices[activeSymbol] ?? 0
  const position = getPosition(activeSymbol)

  const totalCost = parseFloat(quantity) * (orderType === "market" ? currentPrice : parseFloat(price || "0"))
  const canAfford = side === "buy" ? totalCost <= cashBalance : (position?.quantity ?? 0) >= parseFloat(quantity || "0")

  function handleSubmit() {
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) {
      toast.error("Enter a valid quantity")
      return
    }

    if (orderType === "market" && !currentPrice) {
      toast.error("No market price available")
      return
    }

    const orderPrice = orderType === "market" ? currentPrice : parseFloat(price)
    if (!orderPrice || orderPrice <= 0) {
      toast.error("Enter a valid price")
      return
    }

    const result = executeOrder({
      assetSymbol: activeSymbol,
      assetType: "crypto",
      side,
      type: orderType,
      quantity: qty,
      price: orderPrice,
      stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
      currentPrice,
    })

    if (result.success) {
      toast.success(`${side === "buy" ? "Bought" : "Sold"} ${qty} ${activeSymbol.replace("USDT", "")}`)
      setQuantity("")
      setPrice("")
      setStopPrice("")
    } else {
      toast.error(result.error ?? "Order failed")
    }
  }

  function setPercent(percent: number) {
    if (side === "buy") {
      const maxQty = (cashBalance * (percent / 100)) / (orderType === "market" ? currentPrice : parseFloat(price || String(currentPrice)))
      setQuantity(maxQty.toFixed(6))
    } else {
      const pos = getPosition(activeSymbol)
      if (pos) {
        setQuantity((pos.quantity * (percent / 100)).toFixed(6))
      }
    }
  }

  if (!orderPanelOpen) return null

  return (
    <Card className="shrink-0">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Order Panel</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleOrderPanel}>
          ×
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold font-mono">
            {formatPrice(currentPrice)}
          </div>
          <div className="text-xs text-muted-foreground">
            Balance: {formatCurrency(cashBalance)}
          </div>
        </div>

        <Tabs value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
          <TabsList className="w-full">
            <TabsTrigger value="market" className="flex-1 text-xs">Market</TabsTrigger>
            <TabsTrigger value="limit" className="flex-1 text-xs">Limit</TabsTrigger>
            <TabsTrigger value="stop_loss" className="flex-1 text-xs">Stop</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="mt-2 space-y-2">
            {orderType === "limit" || orderType === "stop_loss" ? null : null}
          </TabsContent>

          <TabsContent value="limit" className="mt-2 space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Limit Price</Label>
              <Input
                type="number"
                placeholder={String(currentPrice)}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="stop_loss" className="mt-2 space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Stop Price</Label>
              <Input
                type="number"
                placeholder={String(currentPrice * (side === "buy" ? 1.02 : 0.98))}
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-1">
          <Button variant="outline" size="xs" className="flex-1 h-6 text-xs" onClick={() => setPercent(25)}>
            25%
          </Button>
          <Button variant="outline" size="xs" className="flex-1 h-6 text-xs" onClick={() => setPercent(50)}>
            50%
          </Button>
          <Button variant="outline" size="xs" className="flex-1 h-6 text-xs" onClick={() => setPercent(75)}>
            75%
          </Button>
          <Button variant="outline" size="xs" className="flex-1 h-6 text-xs" onClick={() => setPercent(100)}>
            100%
          </Button>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Quantity</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        {totalCost > 0 && (
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Total</span>
            <span className="font-mono">{formatCurrency(totalCost)}</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 ${side === "buy" ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : ""}`}
            onClick={() => setSide("buy")}
          >
            Buy
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 ${side === "sell" ? "bg-red-500/10 border-red-500 text-red-500" : ""}`}
            onClick={() => setSide("sell")}
          >
            Sell
          </Button>
        </div>

        <Button
          className="w-full"
          size="sm"
          variant={side === "buy" ? "default" : "destructive"}
          disabled={!canAfford || !quantity}
          onClick={handleSubmit}
        >
          {side === "buy" ? "Buy" : "Sell"} {activeSymbol.replace("USDT", "")}
        </Button>
      </CardContent>
    </Card>
  )
}
