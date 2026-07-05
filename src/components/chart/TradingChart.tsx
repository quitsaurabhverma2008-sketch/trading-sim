"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, AreaSeries, ColorType, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type LineData, type AreaData, type Time } from "lightweight-charts"
import { useMarketStore } from "@/stores/marketStore"
import { useMarketData } from "@/hooks/useMarketData"
import { BarChart3, TrendingUp, ChartLine } from "lucide-react"

type ChartStyle = "candle" | "line" | "area"

const COLORS = {
  bg: "transparent",
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
  rsiLine: "#a855f7",
  macdLine: "#3b82f6",
  macdSignal: "#f59e0b",
  macdHist: "#22c55e",
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
  const rsiChartRef = useRef<IChartApi | null>(null)
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const rsiContainerRef = useRef<HTMLDivElement>(null)
  const macdChartRef = useRef<IChartApi | null>(null)
  const macdSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const macdSignalRef = useRef<ISeriesApi<"Line"> | null>(null)
  const macdHistRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const macdContainerRef = useRef<HTMLDivElement>(null)

  const { activeSymbol, activeAssetType, activeTimeframe } = useMarketStore()
  const { candles, indicators, loading, error } = useMarketData(activeSymbol, activeAssetType ?? "crypto", activeTimeframe)
  const [chartStyle, setChartStyle] = useState<ChartStyle>("candle")
  const [showIndicators, setShowIndicators] = useState({ sma: true, ema: true, bb: false, rsi: false, macd: false })

  const toggleIndicator = (key: keyof typeof showIndicators) => {
    setShowIndicators((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: COLORS.text,
      },
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: COLORS.grid },
      timeScale: { borderColor: COLORS.grid, timeVisible: true, secondsVisible: false },
      handleScroll: { vertTouchDrag: false },
      autoSize: true,
    })
    chartRef.current = chart

    const mainSeries = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.candleUp,
      downColor: COLORS.candleDown,
      borderUpColor: COLORS.candleUp,
      borderDownColor: COLORS.candleDown,
      wickUpColor: COLORS.candleUp,
      wickDownColor: COLORS.candleDown,
    })
    mainSeriesRef.current = mainSeries

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      color: COLORS.volUp,
    })
    volumeSeriesRef.current = volumeSeries
    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    const smaSeries = chart.addSeries(LineSeries, { color: COLORS.sma, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
    smaSeriesRef.current = smaSeries
    const emaSeries = chart.addSeries(LineSeries, { color: COLORS.ema, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
    emaSeriesRef.current = emaSeries
    const bbUpper = chart.addSeries(LineSeries, { color: COLORS.bb, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
    bbUpperRef.current = bbUpper
    const bbLower = chart.addSeries(LineSeries, { color: COLORS.bb, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
    bbLowerRef.current = bbLower

    return () => {
      chart.remove()
      chartRef.current = null
      mainSeriesRef.current = null
      volumeSeriesRef.current = null
      smaSeriesRef.current = null
      emaSeriesRef.current = null
      bbUpperRef.current = null
      bbLowerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!rsiContainerRef.current) return
    if (rsiChartRef.current) { rsiChartRef.current.remove(); rsiChartRef.current = null }

    const rsiChart = createChart(rsiContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: COLORS.text },
      grid: { vertLines: { color: COLORS.grid }, horzLines: { color: COLORS.grid } },
      rightPriceScale: { borderColor: COLORS.grid },
      timeScale: { borderColor: COLORS.grid, visible: false },
      autoSize: true, height: 80,
    })
    rsiChartRef.current = rsiChart
    rsiChart.priceScale("right").applyOptions({ scaleMargins: { top: 0.15, bottom: 0.15 } })
    const rsiSeries = rsiChart.addSeries(LineSeries, { color: COLORS.rsiLine, lineWidth: 1 })
    rsiSeriesRef.current = rsiSeries

    return () => { rsiChart.remove(); rsiChartRef.current = null; rsiSeriesRef.current = null }
  }, [showIndicators.rsi])

  useEffect(() => {
    if (!macdContainerRef.current) return
    if (macdChartRef.current) { macdChartRef.current.remove(); macdChartRef.current = null }

    const macdChart = createChart(macdContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: COLORS.text },
      grid: { vertLines: { color: COLORS.grid }, horzLines: { color: COLORS.grid } },
      rightPriceScale: { borderColor: COLORS.grid },
      timeScale: { borderColor: COLORS.grid, visible: false },
      autoSize: true, height: 80,
    })
    macdChartRef.current = macdChart
    macdChart.priceScale("right").applyOptions({ scaleMargins: { top: 0.2, bottom: 0.2 } })
    const macdLine = macdChart.addSeries(LineSeries, { color: COLORS.macdLine, lineWidth: 1 })
    macdSeriesRef.current = macdLine
    const macdSig = macdChart.addSeries(LineSeries, { color: COLORS.macdSignal, lineWidth: 1 })
    macdSignalRef.current = macdSig
    const macdHist = macdChart.addSeries(HistogramSeries, { color: COLORS.macdHist })
    macdHistRef.current = macdHist

    return () => { macdChart.remove(); macdChartRef.current = null; macdSeriesRef.current = null; macdSignalRef.current = null; macdHistRef.current = null }
  }, [showIndicators.macd])

  useEffect(() => {
    if (!chartRef.current || !mainSeriesRef.current || !volumeSeriesRef.current) return
    if (candles.length === 0) return

    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open, high: c.high, low: c.low, close: c.close,
    }))

    const volumeData: HistogramData[] = candles.map((c) => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open ? COLORS.volUp : COLORS.volDown,
    }))

    chartRef.current.removeSeries(mainSeriesRef.current)

    if (chartStyle === "candle") {
      mainSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
        upColor: COLORS.candleUp, downColor: COLORS.candleDown,
        borderUpColor: COLORS.candleUp, borderDownColor: COLORS.candleDown,
        wickUpColor: COLORS.candleUp, wickDownColor: COLORS.candleDown,
      })
      ;(mainSeriesRef.current as ISeriesApi<"Candlestick">).setData(candleData)
    } else if (chartStyle === "line") {
      mainSeriesRef.current = chartRef.current.addSeries(LineSeries, {
        color: COLORS.sma, lineWidth: 2,
      })
      const lineData: LineData[] = candles.map((c) => ({ time: c.time as Time, value: c.close }))
      ;(mainSeriesRef.current as ISeriesApi<"Line">).setData(lineData)
    } else {
      mainSeriesRef.current = chartRef.current.addSeries(AreaSeries, {
        lineColor: COLORS.sma, topColor: COLORS.area, bottomColor: "transparent", lineWidth: 2,
      })
      const areaData: AreaData[] = candles.map((c) => ({ time: c.time as Time, value: c.close }))
      ;(mainSeriesRef.current as ISeriesApi<"Area">).setData(areaData)
    }

    volumeSeriesRef.current.setData(volumeData)

    if (showIndicators.sma && indicators?.sma && smaSeriesRef.current) {
      const offset = candles.length - indicators.sma.length
      smaSeriesRef.current.setData(indicators.sma.map((val, i) => ({ time: candles[offset + i]?.time as Time, value: val })))
    } else if (smaSeriesRef.current) {
      smaSeriesRef.current.setData([])
    }

    if (showIndicators.ema && indicators?.ema && emaSeriesRef.current) {
      const offset = candles.length - indicators.ema.length
      emaSeriesRef.current.setData(indicators.ema.map((val, i) => ({ time: candles[offset + i]?.time as Time, value: val })))
    } else if (emaSeriesRef.current) {
      emaSeriesRef.current.setData([])
    }

    if (showIndicators.bb && indicators?.bb && bbUpperRef.current && bbLowerRef.current) {
      const closes = candles.map((c) => c.close)
      const len = closes.length
      bbUpperRef.current.setData([{ time: candles[len - 1]?.time as Time, value: indicators.bb.upper }])
      bbLowerRef.current.setData([{ time: candles[len - 1]?.time as Time, value: indicators.bb.lower }])
    } else {
      bbUpperRef.current?.setData([])
      bbLowerRef.current?.setData([])
    }

    if (showIndicators.rsi && rsiSeriesRef.current && indicators?.rsi) {
      const rsiData: LineData[] = candles.map((c, i) => ({ time: c.time as Time, value: 50 }))
      rsiData[rsiData.length - 1] = { time: candles[candles.length - 1]?.time as Time, value: indicators.rsi.value }
      rsiSeriesRef.current.setData(rsiData)
    }

    if (showIndicators.macd && macdSeriesRef.current && indicators?.macd) {
      const macdData: LineData[] = candles.map((c) => ({ time: c.time as Time, value: 0 }))
      const last = candles[candles.length - 1]
      if (last) {
        macdData[macdData.length - 1] = { time: last.time as Time, value: indicators.macd.macd }
      }
      macdSeriesRef.current.setData(macdData)
      macdSignalRef.current?.setData(macdData.length > 0 ? [{ ...macdData[macdData.length - 1], value: indicators.macd.signal }] : [])
      macdHistRef.current?.setData(macdData.length > 0 ? [{ time: last?.time as Time, value: indicators.macd.histogram, color: indicators.macd.histogram >= 0 ? COLORS.macdHist : COLORS.candleDown }] : [])
    }

    chartRef.current.timeScale().fitContent()
  }, [candles, indicators, chartStyle, showIndicators])

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex items-center gap-1 px-2 py-1 border-b shrink-0 overflow-x-auto">
        <div className="flex items-center gap-0.5">
          <button onClick={() => setChartStyle("candle")} className={`p-1 rounded ${chartStyle === "candle" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`} title="Candlestick">
            <BarChart3 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setChartStyle("line")} className={`p-1 rounded ${chartStyle === "line" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`} title="Line">
            <TrendingUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setChartStyle("area")} className={`p-1 rounded ${chartStyle === "area" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`} title="Area">
            <ChartLine className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="w-px h-4 bg-border mx-1" />
        {(["sma", "ema", "bb", "rsi", "macd"] as const).map((key) => (
          <button
            key={key}
            onClick={() => toggleIndicator(key)}
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${showIndicators[key] ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {key}
          </button>
        ))}
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

      {showIndicators.rsi && (
        <div className="h-20 shrink-0 border-t" ref={rsiContainerRef} />
      )}
      {showIndicators.macd && (
        <div className="h-20 shrink-0 border-t" ref={macdContainerRef} />
      )}
    </div>
  )
}
