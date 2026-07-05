"use client"

import { useMarketStore } from "@/stores/marketStore"
import { useUIStore } from "@/stores/uiStore"
import { useRealtime, useTicker24h } from "@/hooks/useRealtime"
import { TradingChart } from "@/components/chart/TradingChart"
import { OrderPanel } from "@/components/trading/OrderPanel"
import { TradeHistory } from "@/components/trading/TradeHistory"
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary"
import { HoldingsTable } from "@/components/portfolio/HoldingsTable"
import { PerformanceMetrics } from "@/components/portfolio/PerformanceMetrics"
import { AIChat } from "@/components/ai/AIChat"
import { SymbolSearch } from "@/components/market/SymbolSearch"
import { Button } from "@/components/ui/button"
import { TIMEFRAMES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Brain, Activity } from "lucide-react"

const TOP_CRYPTO = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT",
  "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "DOTUSDT", "LINKUSDT",
]

export default function DashboardPage() {
  const { activeTimeframe, setActiveTimeframe, connectionStatus } = useMarketStore()
  const { toggleAIPanel, toggleOrderPanel, aiPanelOpen } = useUIStore()

  useRealtime(TOP_CRYPTO)
  useTicker24h(TOP_CRYPTO)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0 overflow-x-auto">
        <SymbolSearch />

        <div className="flex items-center gap-0.5 ml-auto">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf.id}
              variant={activeTimeframe === tf.id ? "default" : "ghost"}
              size="xs"
              className="text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2"
              onClick={() => setActiveTimeframe(tf.id)}
            >
              {tf.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className={cn("h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full", connectionStatus === "connected" ? "bg-emerald-500" : "bg-red-500")} title={connectionStatus} />
          <Button variant="outline" size="xs" className="text-xs gap-1 h-7" onClick={toggleOrderPanel}>
            <Activity className="h-3 w-3" />
            <span className="hidden sm:inline">Trade</span>
          </Button>
          <Button
            variant={aiPanelOpen ? "default" : "outline"}
            size="xs"
            className="text-xs gap-1 h-7"
            onClick={toggleAIPanel}
          >
            <Brain className="h-3 w-3" />
            <span className="hidden sm:inline">AI</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        <div className="flex-1 flex flex-col gap-0 overflow-hidden min-w-0">
          <div className="flex-1 min-h-[200px]">
            <TradingChart />
          </div>

          <div className="shrink-0 border-t hidden sm:block">
            <TradeHistory />
          </div>
        </div>

        {aiPanelOpen && (
          <div className="w-full lg:w-96 shrink-0 border-t lg:border-t-0 lg:border-l flex flex-col overflow-hidden max-h-[50vh] lg:max-h-none">
            <AIChat />
          </div>
        )}

        <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l flex flex-col overflow-hidden max-h-[40vh] lg:max-h-none">
          <div className="p-2 sm:p-3 space-y-2 sm:space-y-3 overflow-y-auto">
            <PortfolioSummary />
            <div className="hidden sm:block">
              <HoldingsTable />
            </div>
            <PerformanceMetrics />
            <OrderPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
