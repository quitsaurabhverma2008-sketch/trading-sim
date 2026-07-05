"use client"

import { useState } from "react"
import { useAlertsStore } from "@/stores/alertsStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bell, Trash2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface AlertModalProps {
  symbol: string
  currentPrice: number
  type: "crypto" | "stock"
}

export function AlertModal({ symbol, currentPrice, type }: AlertModalProps) {
  const [open, setOpen] = useState(false)
  const [direction, setDirection] = useState<"above" | "below">("above")
  const [price, setPrice] = useState(String(currentPrice))
  const { add, items, remove } = useAlertsStore()

  const existingAlerts = items.filter((a) => a.symbol === symbol && !a.triggered)

  function handleAdd() {
    const p = parseFloat(price)
    if (!p || p <= 0) return

    add({ symbol, type, direction, price: p })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Bell className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-80">
        <DialogHeader>
          <DialogTitle className="text-sm">Price Alert — {symbol.replace("USDT", "")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={direction === "above" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setDirection("above")}
            >
              Above
            </Button>
            <Button
              variant={direction === "below" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setDirection("below")}
            >
              Below
            </Button>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Price</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <Button className="w-full" size="sm" onClick={handleAdd}>
            Set Alert
          </Button>

          {existingAlerts.length > 0 && (
            <div className="space-y-1 pt-2 border-t">
              <div className="text-xs text-muted-foreground">Active alerts</div>
              {existingAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between text-xs py-1">
                  <span>
                    {alert.direction === "above" ? "↑" : "↓"} {formatPrice(alert.price)}
                  </span>
                  <button onClick={() => remove(alert.id)} className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
