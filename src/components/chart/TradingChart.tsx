"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, AreaSeries, ColorType, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type LineData, type AreaData, type Time } from "lightweight-charts"
import { useMarketStore } from "@/stores/marketStore"
import { useMarketData } from "@/hooks/useMarketData"
import { BarChart3, TrendingUp, ChartLine } from "lucide-react"

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
      </div>

      <div className="flex-1 relative min-h-0">
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
    </div>
  )
}
