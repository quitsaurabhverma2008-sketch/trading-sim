"use client"

import { useState } from "react"
import { usePortfolioStore } from "@/stores/portfolioStore"
import { useUIStore } from "@/stores/uiStore"
import { useAIStore } from "@/stores/aiStore"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AISettings } from "@/components/ai/AISettings"
import { DEFAULT_DEMO_BALANCE, DEFAULT_CURRENCY } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { RotateCcw, Palette, DollarSign, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const { cashBalance, resetPortfolio, getSummary } = usePortfolioStore()
  const { theme, setTheme } = useUIStore()
  const { setTheme: setNextTheme } = useTheme()
  const summary = getSummary()
  const [confirmReset, setConfirmReset] = useState(false)

  function handleReset() {
    resetPortfolio()
    setConfirmReset(false)
    toast.success("Portfolio reset to default balance")
  }

  return (
    <div className="h-full overflow-y-auto p-4 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your trading simulator preferences</p>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Current Balance</Label>
              <div className="text-lg font-bold font-mono">{formatCurrency(cashBalance)}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Total P&L</Label>
              <div className={`text-lg font-bold font-mono ${summary.totalPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {summary.totalPnl >= 0 ? "+" : ""}{formatCurrency(summary.totalPnl)}
              </div>
            </div>
          </div>

          <Separator />

          {!confirmReset ? (
            <Button variant="destructive" size="sm" className="text-xs" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset Portfolio
            </Button>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-xs flex-1">This will erase all trades and positions.</span>
              <Button variant="destructive" size="xs" onClick={handleReset}>Confirm</Button>
              <Button variant="outline" size="xs" onClick={() => setConfirmReset(false)}>Cancel</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button
                key={t}
                variant={theme === t ? "default" : "outline"}
                size="sm"
                className="flex-1 text-xs capitalize"
                onClick={() => {
                  setTheme(t)
                  setNextTheme(t)
                }}
              >
                {t}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <AISettings />
        </CardContent>
      </Card>
    </div>
  )
}
