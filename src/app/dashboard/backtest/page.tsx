"use client"

import { StrategyBacktester } from "@/components/trading/StrategyBacktester"

export default function BacktestPage() {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-lg font-bold">Strategy Backtester</h1>
          <p className="text-sm text-muted-foreground">Test trading strategies against historical data</p>
        </div>
        <StrategyBacktester />
      </div>
    </div>
  )
}
