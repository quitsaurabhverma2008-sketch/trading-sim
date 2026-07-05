"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, AreaSeries, ColorType, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type LineData, type AreaData, type Time } from "lightweight-charts"
import { useMarketStore } from "@/stores/marketStore"
import { useMarketData } from "@/hooks/useMarketData"
import { BarChart3, TrendingUp, ChartLine, Brain, X, Sparkles } from "lucide-react"

type ChartStyle = "candle" | "line" | "area"

const COLORS = {
  text: "#888",
  grid: "rgba(128, 128, 128, 0.08)",
  candleUp: "#22c55e",
  candleDown: "#ef4444",
  volUp: "rgba(34, 197, 94, 0.3)",
  volDown: "rgba(239, 68, 68, 0.3)",
  sma: "#3b82f6",
  ema: "#a855f7",
  bb: "#f59e0b",
  area: "rgba(59, 130, 246, 0.2)",
}

export function TradingChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | ISeriesApi<"Area"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const bbUpperRef = useRef<ISeriesApi<"Line"> | null>(null)
  const bbLowerRef = useRef<ISeriesApi<"Line"> | null>(null)

  const { activeSymbol, activeAssetType, activeTimeframe } = useMarketStore()
  const { candles, indicators, loading, error } = useMarketData(activeSymbol, activeAssetType ?? "crypto", activeTimeframe)
  const [chartStyle, setChartStyle] = useState<ChartStyle>("candle")
  const [showSMA, setShowSMA] = useState(true)
  const [showEMA, setShowEMA] = useState(true)
  const [showBB, setShowBB] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const aiAbortRef = useRef<AbortController | null>(null)

  function handleAIAnalysis() {
    if (aiLoading) return
    setAiPanelOpen(true)
    setAiAnalysis("")
    setAiError(null)
    setAiLoading(true)

    const summary = {
      symbol: activeSymbol,
      timeframe: activeTimeframe,
      candles: candles.slice(-50).map(c => ({ t: c.time, o: c.open, h: c.high, l: c.low, c: c.close, v: c.volume })),
      rsi: indicators?.rsi?.value?.toFixed(1),
      macd: indicators?.macd ? { macd: indicators.macd.macd.toFixed(4), signal: indicators.macd.signal.toFixed(4), hist: indicators.macd.histogram.toFixed(4) } : null,
      sma: indicators?.sma ? indicators.sma.slice(-3).map(v => v.toFixed(2)) : null,
      ema: indicators?.ema ? indicators.ema.slice(-3).map(v => v.toFixed(2)) : null,
      bb: indicators?.bb ? { upper: indicators.bb.upper.toFixed(2), lower: indicators.bb.lower.toFixed(2) } : null,
    }

    const controller = new AbortController()
    aiAbortRef.current = controller

    fetch("/api/ai/xsmodel/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "kronos-base",
        messages: [
          { role: "user", content: `Analyze this chart data for ${activeSymbol} (${activeTimeframe} timeframe) and provide technical analysis:\n${JSON.stringify(summary, null, 2)}` },
        ],
        temperature: 0.3,
        stream: true,
      }),
      signal: controller.signal,
    }).then(async (res) => {
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const json = line.slice(6)
          if (json === "[DONE]") break
          try {
            const d = JSON.parse(json) as { choices: { delta: { content?: string } }[] }
            const content = d.choices?.[0]?.delta?.content ?? ""
            if (content) { fullText += content; setAiAnalysis(fullText) }
          } catch { }
        }
      }
      setAiLoading(false)
    }).catch((err) => {
      if (err.name !== "AbortError") { setAiError(err.message); setAiLoading(false) }
    })
  }

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: COLORS.text },
      grid: { vertLines: { color: COLORS.grid }, horzLines: { color: COLORS.grid } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: COLORS.grid },
      timeScale: { borderColor: COLORS.grid, timeVisible: true, secondsVisible: false },
      handleScroll: { vertTouchDrag: false },
      autoSize: true,
    })
    chartRef.current = chart

    const main = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.candleUp, downColor: COLORS.candleDown,
      borderUpColor: COLORS.candleUp, borderDownColor: COLORS.candleDown,
      wickUpColor: COLORS.candleUp, wickDownColor: COLORS.candleDown,
    })
    mainSeriesRef.current = main

    const vol = chart.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "volume" })
    volumeSeriesRef.current = vol
    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    smaSeriesRef.current = chart.addSeries(LineSeries, { color: COLORS.sma, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
    emaSeriesRef.current = chart.addSeries(LineSeries, { color: COLORS.ema, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
    bbUpperRef.current = chart.addSeries(LineSeries, { color: COLORS.bb, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
    bbLowerRef.current = chart.addSeries(LineSeries, { color: COLORS.bb, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })

    return () => { chart.remove(); chartRef.current = null; mainSeriesRef.current = null; volumeSeriesRef.current = null; smaSeriesRef.current = null; emaSeriesRef.current = null; bbUpperRef.current = null; bbLowerRef.current = null }
  }, [])

  useEffect(() => {
    try {
      if (!chartRef.current || !mainSeriesRef.current || !volumeSeriesRef.current) return
      if (candles.length === 0) return

      chartRef.current.removeSeries(mainSeriesRef.current)

      if (chartStyle === "candle") {
        mainSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
          upColor: COLORS.candleUp, downColor: COLORS.candleDown,
          borderUpColor: COLORS.candleUp, borderDownColor: COLORS.candleDown,
          wickUpColor: COLORS.candleUp, wickDownColor: COLORS.candleDown,
        })
        const d: CandlestickData[] = candles.map((c) => ({ time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close }))
        ;(mainSeriesRef.current as ISeriesApi<"Candlestick">).setData(d)
      } else if (chartStyle === "line") {
        mainSeriesRef.current = chartRef.current.addSeries(LineSeries, { color: COLORS.sma, lineWidth: 2 })
        const d: LineData[] = candles.map((c) => ({ time: c.time as Time, value: c.close }))
        ;(mainSeriesRef.current as ISeriesApi<"Line">).setData(d)
      } else {
        mainSeriesRef.current = chartRef.current.addSeries(AreaSeries, { lineColor: COLORS.sma, topColor: COLORS.area, bottomColor: "transparent", lineWidth: 2 })
        const d: AreaData[] = candles.map((c) => ({ time: c.time as Time, value: c.close }))
        ;(mainSeriesRef.current as ISeriesApi<"Area">).setData(d)
      }

      volumeSeriesRef.current.setData(candles.map((c) => ({ time: c.time as Time, value: c.volume, color: c.close >= c.open ? COLORS.volUp : COLORS.volDown })))

      if (showSMA && indicators?.sma && smaSeriesRef.current) {
        const offset = candles.length - indicators.sma.length
        smaSeriesRef.current.setData(indicators.sma.map((val, i) => ({ time: candles[offset + i]?.time as Time, value: val })))
      } else { smaSeriesRef.current?.setData([]) }

      if (showEMA && indicators?.ema && emaSeriesRef.current) {
        const offset = candles.length - indicators.ema.length
        emaSeriesRef.current.setData(indicators.ema.map((val, i) => ({ time: candles[offset + i]?.time as Time, value: val })))
      } else { emaSeriesRef.current?.setData([]) }

      if (showBB && indicators?.bb && bbUpperRef.current && bbLowerRef.current) {
        const len = candles.length
        bbUpperRef.current.setData([{ time: candles[len - 1]?.time as Time, value: indicators.bb.upper }])
        bbLowerRef.current.setData([{ time: candles[len - 1]?.time as Time, value: indicators.bb.lower }])
      } else { bbUpperRef.current?.setData([]); bbLowerRef.current?.setData([]) }

      chartRef.current.timeScale().fitContent()
    } catch (e) {
      console.error("Chart data error:", e)
    }
  }, [candles, indicators, chartStyle, showSMA, showEMA, showBB])

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex items-center gap-1 px-2 py-1 border-b shrink-0 overflow-x-auto">
        <div className="flex items-center gap-0.5">
          {(["candle", "line", "area"] as const).map((s) => (
            <button key={s} onClick={() => setChartStyle(s)} className={`p-1 rounded ${chartStyle === s ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`} title={s}>
              {s === "candle" ? <BarChart3 className="h-3.5 w-3.5" /> : s === "line" ? <TrendingUp className="h-3.5 w-3.5" /> : <ChartLine className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-border mx-1" />
        <button onClick={() => setShowSMA(!showSMA)} className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${showSMA ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>SMA</button>
        <button onClick={() => setShowEMA(!showEMA)} className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${showEMA ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>EMA</button>
        <button onClick={() => setShowBB(!showBB)} className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${showBB ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>BB</button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          onClick={handleAIAnalysis}
          disabled={aiLoading || candles.length === 0}
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase flex items-center gap-1 ${aiPanelOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"} disabled:opacity-50`}
          title="Analyze chart with AI"
        >
          <Brain className="h-3 w-3" />
          AI
          {aiLoading && <Sparkles className="h-2.5 w-2.5 animate-pulse" />}
        </button>
      </div>

      <div className="flex-1 relative min-h-0 flex">
        <div className={`absolute inset-0 ${aiPanelOpen ? "right-80" : ""}`}>
          <div ref={containerRef} className="absolute inset-0" />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-sm text-red-500">{error}</div>
            </div>
          )}
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-sm text-muted-foreground animate-pulse">Loading chart data...</div>
            </div>
          )}
        </div>

        {aiPanelOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-80 border-l bg-background z-20 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <Brain className="h-4 w-4" />
                AI Analysis
              </div>
              <button onClick={() => { setAiPanelOpen(false); aiAbortRef.current?.abort() }} className="p-1 rounded hover:bg-accent">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 text-xs leading-relaxed whitespace-pre-wrap">
              {aiLoading && !aiAnalysis && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  Analyzing chart...
                </div>
              )}
              {aiError && <div className="text-red-500">{aiError}</div>}
              {aiAnalysis && <div>{aiAnalysis}</div>}
              {!aiLoading && !aiAnalysis && !aiError && (
                <div className="text-muted-foreground">Click "AI" button to analyze the current chart.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
