"use client"

import { useEffect, useRef, useCallback } from "react"
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, ColorType, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type LineData, type Time } from "lightweight-charts"
import { useMarketStore } from "@/stores/marketStore"
import { useMarketData } from "@/hooks/useMarketData"

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
}

export function TradingChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)

  const { activeSymbol, activeTimeframe } = useMarketStore()
  const { candles, indicators, loading } = useMarketData(activeSymbol, "crypto", activeTimeframe)

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
      crosshair: {
        mode: 0,
      },
      rightPriceScale: { borderColor: COLORS.grid },
      timeScale: { borderColor: COLORS.grid, timeVisible: true, secondsVisible: false },
      handleScroll: { vertTouchDrag: false },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      autoSize: true,
    })

    chartRef.current = chart

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.candleUp,
      downColor: COLORS.candleDown,
      borderUpColor: COLORS.candleUp,
      borderDownColor: COLORS.candleDown,
      wickUpColor: COLORS.candleUp,
      wickDownColor: COLORS.candleDown,
    })
    candleSeriesRef.current = candleSeries

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      color: COLORS.volUp,
    })
    volumeSeriesRef.current = volumeSeries
    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    const smaSeries = chart.addSeries(LineSeries, {
      color: COLORS.sma,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    smaSeriesRef.current = smaSeries

    const emaSeries = chart.addSeries(LineSeries, {
      color: COLORS.ema,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    emaSeriesRef.current = emaSeries

    return () => {
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
      smaSeriesRef.current = null
      emaSeriesRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || !volumeSeriesRef.current) return

    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))

    const volumeData: HistogramData[] = candles.map((c) => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open ? COLORS.volUp : COLORS.volDown,
    }))

    candleSeriesRef.current.setData(candleData)
    volumeSeriesRef.current.setData(volumeData)

    if (indicators?.sma && smaSeriesRef.current) {
      const smaData: LineData[] = candles.slice(-indicators.sma.length).map((c, i) => ({
        time: c.time as Time,
        value: indicators.sma![i],
      }))
      smaSeriesRef.current.setData(smaData)
    }

    if (indicators?.ema && emaSeriesRef.current) {
      const emaData: LineData[] = candles.slice(-indicators.ema.length).map((c, i) => ({
        time: c.time as Time,
        value: indicators.ema![i],
      }))
      emaSeriesRef.current.setData(emaData)
    }

    chartRef.current.timeScale().fitContent()
  }, [candles, indicators])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-sm text-muted-foreground animate-pulse">Loading chart data...</div>
        </div>
      )}
    </div>
  )
}
