"use client"

import { useMarketStore } from "@/stores/marketStore"
import { useUIStore } from "@/stores/uiStore"
import { useRealtime, useTicker24h } from "@/hooks/useRealtime"
import { TradingChart } from "@/components/chart/TradingChart"
import { OrderPanel, QuickTradeBar } from "@/components/trading/OrderPanel"
import { TradeHistory } from "@/components/trading/TradeHistory"
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary"
import { HoldingsTable } from "@/components/portfolio/HoldingsTable"
import { PerformanceMetrics } from "@/components/portfolio/PerformanceMetrics"
import { SymbolSearch } from "@/components/market/SymbolSearch"
import { OrderBook } from "@/components/chart/OrderBook"
import { PnLCalculator } from "@/components/trading/PnLCalculator"
import { AnimatedSection } from "@/components/ui/AnimatedSection"
import { Button } from "@/components/ui/button"
import { TIMEFRAMES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Brain, Activity, BookOpen, Calculator, BarChart3, BookOpen as JournalIcon } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const TOP_CRYPTO = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT",
  "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "DOTUSDT", "LINKUSDT",
]

export default function DashboardPage() {
  const { activeTimeframe, setActiveTimeframe, connectionStatus } = useMarketStore()
  const { toggleOrderPanel } = useUIStore()
  const [showOrderBook, setShowOrderBook] = useState(false)
  const [showPnLCalc, setShowPnLCalc] = useState(false)

  useRealtime(TOP_CRYPTO)
  useTicker24h(TOP_CRYPTO)

  return (
    <div className="h-full flex flex-col animate-slide-up">
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0 overflow-x-auto glass rounded-none">
        <SymbolSearch />

        <div className="flex items-center gap-0.5 ml-auto">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf.id}
              variant={activeTimeframe === tf.id ? "default" : "ghost"}
              size="xs"
              className="text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2 transition-all duration-200"
              onClick={() => setActiveTimeframe(tf.id)}
            >
              {tf.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className={cn("h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-colors duration-500", connectionStatus === "connected" ? "bg-emerald-500 animate-glow-pulse" : "bg-red-500")} title={connectionStatus} />
          <Button variant={showOrderBook ? "default" : "outline"} size="xs" className="text-xs gap-1 h-7" onClick={() => setShowOrderBook((p) => !p)} title="Order Book">
            <BookOpen className="h-3 w-3" />
            <span className="hidden sm:inline">Depth</span>
          </Button>
          <Button variant={showPnLCalc ? "default" : "outline"} size="xs" className="text-xs gap-1 h-7" onClick={() => setShowPnLCalc((p) => !p)} title="PnL Calculator">
            <Calculator className="h-3 w-3" />
            <span className="hidden sm:inline">PnL</span>
          </Button>
          <Button variant="outline" size="xs" className="text-xs gap-1 h-7" onClick={toggleOrderPanel}>
            <Activity className="h-3 w-3" />
            <span className="hidden sm:inline">Trade</span>
          </Button>
          <Link href="/dashboard/backtest">
            <Button variant="outline" size="xs" className="text-xs gap-1 h-7">
              <BarChart3 className="h-3 w-3" />
              <span className="hidden sm:inline">Backtest</span>
            </Button>
          </Link>
          <Link href="/dashboard/journal">
            <Button variant="outline" size="xs" className="text-xs gap-1 h-7">
              <JournalIcon className="h-3 w-3" />
              <span className="hidden sm:inline">Journal</span>
            </Button>
          </Link>
          <Link href="/dashboard/ai">
            <Button variant="outline" size="xs" className="text-xs gap-1 h-7">
              <Brain className="h-3 w-3" />
              <span className="hidden sm:inline">AI</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        <div className="flex-1 flex flex-col gap-0 overflow-hidden min-w-0">
          <div className="flex-1 min-h-[200px]">
            <TradingChart />
          </div>

          <div className="shrink-0 hidden sm:block">
            <QuickTradeBar />
            <TradeHistory />
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l flex flex-col overflow-hidden max-h-[40vh] lg:max-h-none">
          <div className="p-2 sm:p-3 space-y-2 sm:space-y-3 overflow-y-auto scrollbar-thin">
            <AnimatedSection delay={100}>
              <PortfolioSummary />
            </AnimatedSection>
            <AnimatedSection delay={200} className="hidden sm:block">
              <HoldingsTable />
            </AnimatedSection>
            <AnimatedSection delay={300}>
              <PerformanceMetrics />
            </AnimatedSection>
            {showOrderBook && (
              <AnimatedSection delay={150} direction="fade">
                <div className="border rounded-lg overflow-hidden glass">
                  <div className="text-[11px] font-semibold px-2 py-1.5 bg-muted/50">Order Book</div>
                  <OrderBook />
                </div>
              </AnimatedSection>
            )}
            {showPnLCalc && (
              <AnimatedSection delay={150} direction="fade">
                <div className="border rounded-lg overflow-hidden glass">
                  <div className="text-[11px] font-semibold px-2 py-1.5 bg-muted/50">PnL Calculator</div>
                  <PnLCalculator />
                </div>
              </AnimatedSection>
            )}
            <OrderPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
