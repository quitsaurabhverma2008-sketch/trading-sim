"use client"

import { useState } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatPercent, cn } from "@/lib/utils"
import { BarChart3, Play, Loader2, TrendingUp, TrendingDown, Target, Activity, AlertTriangle, Info } from "lucide-react"
import { toast } from "sonner"

interface BacktestResult {
  symbol: string
  timeframe: string
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalReturn: number
  totalReturnPercent: number
  maxDrawdown: number
  maxDrawdownPercent: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  sharpeRatio: number
  trades: {
    entryDate: number
    exitDate: number
    side: "buy" | "sell"
    entryPrice: number
    exitPrice: number
    pnl: number
    pnlPercent: number
  }[]
  equityCurve: { date: number; value: number }[]
}

const STRATEGY_TEMPLATES = [
  {
    id: "sma-cross",
    name: "SMA Crossover",
    description: "Buy when 20 SMA crosses above 50 SMA, sell when opposite",
    code: "if sma(20) > sma(50) and prev_sma(20) <= prev_sma(50) then buy\nif sma(20) < sma(50) and prev_sma(20) >= prev_sma(50) then sell",
  },
  {
    id: "rsi-reversal",
    name: "RSI Reversal",
    description: "Buy when RSI < 30 (oversold), sell when RSI > 70 (overbought)",
    code: "if rsi(14) < 30 then buy\nif rsi(14) > 70 then sell",
  },
  {
    id: "macd-cross",
    name: "MACD Crossover",
    description: "Buy when MACD crosses above signal line, sell when opposite",
    code: "if macd > signal and prev_macd <= prev_signal then buy\nif macd < signal and prev_macd >= prev_signal then sell",
  },
  {
    id: "bb-bounce",
    name: "BB Bounce",
    description: "Buy when price touches lower band, sell when price touches upper band",
    code: "if price <= bb_lower then buy\nif price >= bb_upper then sell",
  },
]

export function StrategyBacktester() {
  const { activeSymbol, activeTimeframe } = useMarketStore()
  const [symbol, setSymbol] = useState(activeSymbol)
  const [timeframe, setTimeframe] = useState("1h")
  const [selectedStrategy, setSelectedStrategy] = useState<string>("sma-cross")
  const [customCode, setCustomCode] = useState("")
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState("strategies")

  async function runBacktest() {
    if (!symbol) {
      toast.error("Enter a symbol")
      return
    }

    setLoading(true)
    setResult(null)

    const strategyCode = customCode || STRATEGY_TEMPLATES.find((s) => s.id === selectedStrategy)?.code || ""

    try {
      const res = await fetch(`/api/market/crypto/${symbol}?interval=${timeframe}&limit=500`)
      if (!res.ok) {
        const stockRes = await fetch(`/api/market/stocks/${symbol}?interval=${timeframe}&limit=500`)
        if (!stockRes.ok) throw new Error("Failed to fetch candle data")
        const json = await stockRes.json()
        if (!json.candles || json.candles.length < 50) throw new Error("Not enough candle data")
        simulateBacktest(json.candles, strategyCode)
      } else {
        const json = await res.json()
        if (!json.candles || json.candles.length < 50) throw new Error("Not enough candle data")
        simulateBacktest(json.candles, strategyCode)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Backtest failed")
    } finally {
      setLoading(false)
    }
  }

  function simulateBacktest(candles: { time: number; open: number; high: number; low: number; close: number; volume: number }[], code: string) {
    const closes = candles.map((c) => c.close)
    const highs = candles.map((c) => c.high)
    const lows = candles.map((c) => c.low)
    const volumes = candles.map((c) => c.volume)

    const isSmaStrategy = code.includes("sma")
    const isRsiStrategy = code.includes("rsi")
    const isMacdStrategy = code.includes("macd")
    const isBbStrategy = code.includes("bb")

    function sma(data: number[], period: number): number[] {
      const result: number[] = []
      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) { result.push(0); continue }
        let sum = 0
        for (let j = i - period + 1; j <= i; j++) sum += data[j]
        result.push(sum / period)
      }
      return result
    }

    function rsi(data: number[], period = 14): number[] {
      const result: number[] = []
      for (let i = 0; i < data.length; i++) {
        if (i < period + 1) { result.push(50); continue }
        let gains = 0, losses = 0
        for (let j = i - period; j <= i; j++) {
          const diff = data[j] - data[j - 1]
          if (diff >= 0) gains += diff
          else losses -= diff
        }
        const avgGain = gains / period
        const avgLoss = losses / period
        if (avgLoss === 0) { result.push(100); continue }
        const rs = avgGain / avgLoss
        result.push(100 - (100 / (1 + rs)))
      }
      return result
    }

    function macd(data: number[], fast = 12, slow = 26, signal = 9): { macd: number[]; signal: number[]; histogram: number[] } {
      const emaFast = sma(data, fast)
      const emaSlow = sma(data, slow)
      const macdLine = emaFast.map((v, i) => v - emaSlow[i])
      const signalLine = sma(macdLine, signal)
      const histogram = macdLine.map((v, i) => v - (signalLine[i] || 0))
      return { macd: macdLine, signal: signalLine, histogram }
    }

    function bb(data: number[], period = 20, stdDev = 2): { upper: number[]; middle: number[]; lower: number[] } {
      const middle = sma(data, period)
      const upper: number[] = []
      const lower: number[] = []
      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) { upper.push(0); lower.push(0); continue }
        let sum = 0
        for (let j = i - period + 1; j <= i; j++) sum += Math.pow(data[j] - middle[i], 2)
        const std = Math.sqrt(sum / period)
        upper.push(middle[i] + stdDev * std)
        lower.push(middle[i] - stdDev * std)
      }
      return { upper, middle, lower }
    }

    const sma20 = isSmaStrategy ? sma(closes, 20) : []
    const sma50 = isSmaStrategy ? sma(closes, 50) : []
    const rsiValues = isRsiStrategy ? rsi(closes, 14) : []
    const macdData = isMacdStrategy ? macd(closes) : { macd: [], signal: [], histogram: [] }
    const bbData = isBbStrategy ? bb(closes) : { upper: [], middle: [], lower: [] }

    let position: "none" | "long" = "none"
    let entryPrice = 0
    let entryIndex = 0
    const trades: BacktestResult["trades"] = []
    const equityCurve: BacktestResult["equityCurve"] = []
    let equity = 10000

    for (let i = 50; i < candles.length; i++) {
      const prevI = i - 1
      let signal: "buy" | "sell" | null = null

      if (isSmaStrategy) {
        if (sma20[i] > sma50[i] && sma20[prevI] <= sma50[prevI] && position === "none") signal = "buy"
        if (sma20[i] < sma50[i] && sma20[prevI] >= sma50[prevI] && position === "long") signal = "sell"
      }

      if (isRsiStrategy) {
        if (rsiValues[i] < 30 && position === "none") signal = "buy"
        if (rsiValues[i] > 70 && position === "long") signal = "sell"
      }

      if (isMacdStrategy) {
        if (macdData.macd[i] > macdData.signal[i] && macdData.macd[prevI] <= macdData.signal[prevI] && position === "none") signal = "buy"
        if (macdData.macd[i] < macdData.signal[i] && macdData.macd[prevI] >= macdData.signal[prevI] && position === "long") signal = "sell"
      }

      if (isBbStrategy) {
        if (closes[i] <= bbData.lower[i] && position === "none") signal = "buy"
        if (closes[i] >= bbData.upper[i] && position === "long") signal = "sell"
      }

      if (signal === "buy" && position === "none") {
        position = "long"
        entryPrice = closes[i]
        entryIndex = i
      }

      if (signal === "sell" && position === "long") {
        const pnl = (closes[i] - entryPrice)
        const pnlPercent = ((closes[i] - entryPrice) / entryPrice) * 100
        trades.push({
          entryDate: candles[entryIndex].time,
          exitDate: candles[i].time,
          side: "buy",
          entryPrice,
          exitPrice: closes[i],
          pnl: pnl * (equity / entryPrice),
          pnlPercent,
        })
        equity += pnl * (equity / entryPrice)
        position = "none"
      }

      equityCurve.push({ date: candles[i].time, value: equity })
    }

    if (position === "long") {
      const lastI = candles.length - 1
      const pnl = (closes[lastI] - entryPrice)
      trades.push({
        entryDate: candles[entryIndex].time,
        exitDate: candles[lastI].time,
        side: "buy",
        entryPrice,
        exitPrice: closes[lastI],
        pnl: pnl * (equity / entryPrice),
        pnlPercent: ((closes[lastI] - entryPrice) / entryPrice) * 100,
      })
    }

    const winning = trades.filter((t) => t.pnl > 0)
    const losing = trades.filter((t) => t.pnl < 0)
    const totalReturn = equity - 10000
    const winRate = trades.length > 0 ? (winning.length / trades.length) * 100 : 0

    let peak = 10000
    let maxDrawdown = 0
    for (const point of equityCurve) {
      if (point.value > peak) peak = point.value
      const dd = peak - point.value
      if (dd > maxDrawdown) maxDrawdown = dd
    }

    const avgWin = winning.length > 0 ? winning.reduce((s, t) => s + t.pnl, 0) / winning.length : 0
    const avgLoss = losing.length > 0 ? losing.reduce((s, t) => s + t.pnl, 0) / losing.length : 0
    const profitFactor = losing.reduce((s, t) => s + Math.abs(t.pnl), 0) > 0
      ? winning.reduce((s, t) => s + t.pnl, 0) / losing.reduce((s, t) => s + Math.abs(t.pnl), 0)
      : winning.length > 0 ? Infinity : 0

    const returns = equityCurve.slice(1).map((p, i) => (p.value - equityCurve[i].value) / equityCurve[i].value)
    const avgReturn = returns.reduce((s, r) => s + r, 0) / (returns.length || 1)
    const variance = returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / (returns.length || 1)
    const sharpeRatio = Math.sqrt(252) * (avgReturn / (Math.sqrt(variance) || 0.001))

    setResult({
      symbol,
      timeframe,
      totalTrades: trades.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      winRate,
      totalReturn,
      totalReturnPercent: (totalReturn / 10000) * 100,
      maxDrawdown,
      maxDrawdownPercent: (maxDrawdown / 10000) * 100,
      profitFactor,
      avgWin,
      avgLoss,
      sharpeRatio,
      trades,
      equityCurve,
    })

    setTab("results")
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Strategy Backtester</span>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="strategies" className="text-xs">Strategy</TabsTrigger>
          <TabsTrigger value="results" className="text-xs" disabled={!result}>Results</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-3 mt-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground">Symbol</label>
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="BTCUSDT" className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Timeframe</label>
              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="h-8 text-xs bg-muted border border-border rounded-md px-2">
                {["1m","5m","15m","30m","1h","4h","1d"].map((tf) => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {STRATEGY_TEMPLATES.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedStrategy(s.id); setCustomCode("") }}
                className={cn(
                  "text-left p-2 rounded-md border text-xs transition-colors",
                  selectedStrategy === s.id && !customCode ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                )}
              >
                <div className="font-medium text-sm">{s.name}</div>
                <div className="text-muted-foreground mt-0.5">{s.description}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground">Or Custom Strategy Code</label>
            <textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="w-full bg-muted border border-border rounded-md px-2 py-1.5 text-xs font-mono h-20 resize-none mt-1"
              placeholder="if rsi(14) < 30 then buy&#10;if rsi(14) > 70 then sell"
            />
          </div>

          <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-muted/30 rounded-md p-2">
            <Info className="h-3 w-3 shrink-0 mt-0.5" />
            <span>Simple rule-based backtester. Supports: sma(N), rsi(N), macd, bb. Uses 10k starting capital. 500 candles max.</span>
          </div>

          <Button className="w-full h-8 text-xs gap-1" onClick={runBacktest} disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            {loading ? "Running..." : "Run Backtest"}
          </Button>
        </TabsContent>

        <TabsContent value="results" className="mt-3">
          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Total Return", value: `${result.totalReturnPercent >= 0 ? "+" : ""}${result.totalReturnPercent.toFixed(2)}%`, color: result.totalReturnPercent >= 0 ? "text-emerald-500" : "text-red-500" },
                  { label: "Win Rate", value: `${result.winRate.toFixed(1)}%`, color: result.winRate >= 50 ? "text-emerald-500" : "text-red-500" },
                  { label: "Max DD", value: `${result.maxDrawdownPercent.toFixed(2)}%`, color: "text-red-500" },
                  { label: "Profit Factor", value: result.profitFactor === Infinity ? "∞" : result.profitFactor.toFixed(2), color: result.profitFactor >= 1.5 ? "text-emerald-500" : "text-amber-500" },
                  { label: "Trades", value: String(result.totalTrades) },
                  { label: "Sharpe", value: result.sharpeRatio.toFixed(2), color: result.sharpeRatio >= 1 ? "text-emerald-500" : "text-red-500" },
                  { label: "Avg Win", value: formatCurrency(result.avgWin), color: "text-emerald-500" },
                  { label: "Avg Loss", value: formatCurrency(Math.abs(result.avgLoss)), color: "text-red-500" },
                ].map((m) => (
                  <Card key={m.label}>
                    <CardContent className="p-2 text-center">
                      <div className={cn("text-xs font-bold font-mono", m.color ?? "")}>{m.value}</div>
                      <div className="text-[10px] text-muted-foreground">{m.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {result.equityCurve.length > 0 && (
                <Card>
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs font-medium">Equity Curve</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="h-32 flex items-end gap-[1px]">
                      {result.equityCurve.map((point, i) => {
                        const max = Math.max(...result.equityCurve.map((p) => p.value))
                        const min = Math.min(...result.equityCurve.map((p) => p.value))
                        const range = max - min || 1
                        const height = ((point.value - min) / range) * 100
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm"
                            style={{
                              height: `${height}%`,
                              backgroundColor: point.value >= 10000 ? "#22c55e" : "#ef4444",
                              opacity: 0.7,
                            }}
                            title={`$${point.value.toFixed(2)}`}
                          />
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>{formatCurrency(result.equityCurve[0]?.value ?? 10000)}</span>
                      <span>{formatCurrency(result.equityCurve[result.equityCurve.length - 1]?.value ?? 10000)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.trades.length > 0 && (
                <Card>
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs font-medium">Trade Log ({result.trades.length})</CardTitle>
                  </CardHeader>
                  <ScrollArea className="h-[200px]">
                    <CardContent className="p-3 pt-1">
                      <div className="space-y-1">
                        {result.trades.map((t, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-border/30 last:border-0">
                            <div className="flex items-center gap-2">
                              <Badge variant={t.pnl >= 0 ? "default" : "destructive"} className="text-[8px] px-1 py-0">
                                {t.pnl >= 0 ? "W" : "L"}
                              </Badge>
                              <span className="font-mono">{formatCurrency(t.entryPrice)} → {formatCurrency(t.exitPrice)}</span>
                            </div>
                            <span className={cn("font-mono", t.pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                              {t.pnl >= 0 ? "+" : ""}{t.pnlPercent.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </ScrollArea>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
