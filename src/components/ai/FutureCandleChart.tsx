"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface PredictionData {
  symbol: string
  direction: "bullish" | "bearish" | "neutral"
  confidence: number
  currentPrice: number
  predictedOpen: number
  predictedHigh: number
  predictedLow: number
  predictedClose: number
  targetPrice: number
  stopLoss: number
  riskReward: string
  reason: string
}

interface FutureCandleChartProps {
  data: PredictionData
  compact?: boolean
}

export function FutureCandleChart({ data, compact }: FutureCandleChartProps) {
  const isUp = data.direction === "bullish"
  const isNeutral = data.direction === "neutral"

  const { chartSvg, candleTop, candleBottom, wickTop, wickBottom } = useMemo(() => {
    const pad = 0.15
    const maxP = Math.max(data.predictedHigh, data.currentPrice) * (1 + pad)
    const minP = Math.min(data.predictedLow, data.currentPrice) * (1 - pad)
    const range = maxP - minP || 1
    const totalH = compact ? 160 : 240
    const wickH = totalH * 0.85

    function toY(price: number) {
      return ((maxP - price) / range) * wickH + (totalH - wickH) / 2
    }

    const candleW = compact ? 40 : 56
    const bodyH = Math.abs(toY(data.predictedOpen) - toY(data.predictedClose))
    const bodyTop = Math.min(toY(data.predictedOpen), toY(data.predictedClose))
    const bodyBottom = bodyTop + bodyH
    const wTop = toY(data.predictedHigh)
    const wBottom = toY(data.predictedLow)
    const midX = 60
    const currentY = toY(data.currentPrice)

    const color = isNeutral ? "#a855f7" : isUp ? "#22c55e" : "#ef4444"
    const currentBarY = totalH - 40

    return { chartSvg: null, candleTop: bodyTop, candleBottom: bodyBottom, wickTop: wTop, wickBottom: wBottom }
  }, [data, compact])

  const h = compact ? 200 : 300
  const w = compact ? 280 : 380

  const pad = 0.15
  const maxP = Math.max(data.predictedHigh, data.currentPrice) * (1 + pad)
  const minP = Math.min(data.predictedLow, data.currentPrice) * (1 - pad)
  const range = maxP - minP || 1
  const chartH = h * 0.6
  const chartTop = (h - chartH) / 2

  function toY(price: number) {
    return ((maxP - price) / range) * chartH + chartTop
  }

  const color = isNeutral ? "#a855f7" : isUp ? "#22c55e" : "#ef4444"
  const bgColor = isNeutral ? "rgba(168,85,247,0.15)" : isUp ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"
  const labelColor = isNeutral ? "text-purple-500" : isUp ? "text-emerald-500" : "text-red-500"

  const candleW = compact ? 36 : 50
  const candleX = (w - candleW) / 2
  const oY = toY(data.predictedOpen)
  const cY = toY(data.predictedClose)
  const bodyTop = Math.min(oY, cY)
  const bodyBottom = Math.max(oY, cY)
  const bodyH = Math.abs(cY - oY) || 1
  const wickTopY = toY(data.predictedHigh)
  const wickBotY = toY(data.predictedLow)
  const currentY = toY(data.currentPrice)

  const pulseColor = isNeutral ? "#a855f7" : isUp ? "#22c55e" : "#ef4444"

  return (
    <div className={cn("rounded-lg border bg-card p-3", compact ? "max-w-[300px]" : "max-w-[400px]")}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold font-mono">{data.symbol.replace("USDT", "")}</span>
          <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", labelColor, "bg-current/10")}>
            {data.direction === "bullish" ? "🟢" : data.direction === "bearish" ? "🔴" : "🟡"} {data.direction === "bullish" ? "Bullish" : data.direction === "bearish" ? "Bearish" : "Neutral"}
          </span>
        </div>
        <span className={cn("text-xs font-mono font-bold", labelColor)}>{data.confidence}%</span>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" style={{ maxHeight: h }}>
          <defs>
            <linearGradient id={`pred-grad-${data.symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <rect x="10" y={chartTop} width={w - 20} height={chartH} fill={bgColor} rx="4" opacity="0.3" />

          {[0.25, 0.5, 0.75].map((f) => {
            const y = chartTop + chartH * f
            const price = maxP - range * f
            return (
              <g key={f}>
                <line x1="10" y1={y} x2={w - 10} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="3,3" />
                <text x={w - 12} y={y + 3} textAnchor="end" fill="currentColor" opacity="0.4" fontSize="9" fontFamily="monospace">
                  {price.toFixed(2)}
                </text>
              </g>
            )
          })}

          <line x1={candleX + candleW / 2} y1={wickTopY} x2={candleX + candleW / 2} y2={wickBotY} stroke={color} strokeWidth="2" strokeLinecap="round" />

          <rect
            x={candleX}
            y={bodyTop}
            width={candleW}
            height={bodyH}
            fill={color}
            rx="2"
            opacity="0.9"
          />

          {bodyH > 4 && (
            <rect
              x={candleX + candleW * 0.1}
              y={bodyH > 15 ? bodyTop + bodyH * 0.25 : bodyTop}
              width={candleW * 0.8}
              height={bodyH * 0.5}
              fill={color}
              opacity="0.3"
              rx="1"
            />
          )}

          <line x1="15" y1={currentY} x2={candleX - 4} y2={currentY} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,2" />
          <text x="16" y={currentY - 3} fill="#3b82f6" fontSize="9" fontFamily="monospace" fontWeight="600">
            Current ${data.currentPrice.toFixed(2)}
          </text>

          <circle cx={candleX + candleW + 12} cy={bodyTop} r="10" fill="none" stroke={pulseColor} strokeWidth="1.5" opacity="0.5">
            <animate attributeName="r" values="10;16;10" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <polygon
            points={
              data.direction === "bullish"
                ? `${candleX + candleW + 12},${bodyTop - 8} ${candleX + candleW + 6},${bodyTop - 1} ${candleX + candleW + 18},${bodyTop - 1}`
                : data.direction === "bearish"
                ? `${candleX + candleW + 12},${bodyBottom + 8} ${candleX + candleW + 6},${bodyBottom + 1} ${candleX + candleW + 18},${bodyBottom + 1}`
                : ""
            }
            fill={color}
          />
        </svg>

        {!compact && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center text-[10px] text-muted-foreground gap-4">
            <span>O: {data.predictedOpen.toFixed(2)}</span>
            <span>H: {data.predictedHigh.toFixed(2)}</span>
            <span>L: {data.predictedLow.toFixed(2)}</span>
            <span>C: {data.predictedClose.toFixed(2)}</span>
          </div>
        )}
      </div>

      {!compact && (
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="bg-muted/30 rounded p-2">
            <div className="text-muted-foreground text-[10px]">Target</div>
            <div className="font-mono font-medium text-emerald-500">{data.targetPrice.toFixed(2)}</div>
          </div>
          <div className="bg-muted/30 rounded p-2">
            <div className="text-muted-foreground text-[10px]">Stop Loss</div>
            <div className="font-mono font-medium text-red-500">{data.stopLoss.toFixed(2)}</div>
          </div>
          <div className="bg-muted/30 rounded p-2">
            <div className="text-muted-foreground text-[10px]">Risk:Reward</div>
            <div className="font-mono font-medium">{data.riskReward}</div>
          </div>
          <div className="bg-muted/30 rounded p-2">
            <div className="text-muted-foreground text-[10px]">Confidence</div>
            <div className={cn("font-mono font-medium", labelColor)}>{data.confidence}%</div>
          </div>
        </div>
      )}

      <div className="text-[10px] text-muted-foreground mt-2 italic">{data.reason}</div>
    </div>
  )
}

export function parsePrediction(text: string): PredictionData | null {
  const match = text.match(/\[PREDICTION\]([\s\S]*?)\[\/PREDICTION\]/)
  if (!match) return null
  const block = match[1]
  const lines = block.trim().split("\n")
  const kv: Record<string, string> = {}
  for (const line of lines) {
    const eqIdx = line.indexOf("=")
    if (eqIdx > 0) {
      kv[line.slice(0, eqIdx).trim()] = line.slice(eqIdx + 1).trim()
    }
  }

  const direction = kv.direction as "bullish" | "bearish" | "neutral"
  if (!direction || !["bullish", "bearish", "neutral"].includes(direction)) return null
  if (!kv.symbol || !kv.currentPrice) return null

  return {
    symbol: kv.symbol,
    direction,
    confidence: parseInt(kv.confidence ?? "50"),
    currentPrice: parseFloat(kv.currentPrice),
    predictedOpen: parseFloat(kv.predictedOpen ?? kv.currentPrice),
    predictedHigh: parseFloat(kv.predictedHigh ?? kv.currentPrice),
    predictedLow: parseFloat(kv.predictedLow ?? kv.currentPrice),
    predictedClose: parseFloat(kv.predictedClose ?? kv.currentPrice),
    targetPrice: parseFloat(kv.targetPrice ?? kv.predictedHigh ?? kv.currentPrice),
    stopLoss: parseFloat(kv.stopLoss ?? kv.predictedLow ?? kv.currentPrice),
    riskReward: kv.riskReward ?? "—",
    reason: kv.reason ?? "",
  }
}
