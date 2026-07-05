import type { Candle } from "@/types"

export interface IndicatorRequest {
  id: string
  type: "rsi" | "macd" | "bb" | "all" | "sma" | "ema" | "adx"
  candles: Candle[]
  period?: number
}

export interface IndicatorResponse {
  id: string
  type: string
  result: unknown
}

self.onmessage = (e: MessageEvent<IndicatorRequest>) => {
  const { id, type, candles, period } = e.data

  try {
    const closes = candles.map((c) => c.close)
    const volumes = candles.map((c) => c.volume)
    let result: unknown

    switch (type) {
      case "rsi":
        result = calcRSI(closes, period ?? 14)
        break
      case "macd":
        result = calcMACD(closes)
        break
      case "bb":
        result = calcBollingerBands(closes, period ?? 20)
        break
      case "sma":
        result = calcSMA(closes, period ?? 20)
        break
      case "ema":
        result = calcEMA(closes, period ?? 20)
        break
      case "adx":
        result = calcADX(candles, period ?? 14)
        break
      case "all":
        result = {
          rsi: calcRSI(closes),
          macd: calcMACD(closes),
          bb: calcBollingerBands(closes),
          sma: calcSMA(closes, 20).slice(-3),
          ema: calcEMA(closes, 20).slice(-3),
          volumeSMA: volumes.length > 20
            ? volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
            : undefined,
        }
        break
    }

    const response: IndicatorResponse = { id, type, result }
    ;(self as unknown as { postMessage: (msg: unknown) => void }).postMessage(response)
  } catch (error) {
    ;(self as unknown as { postMessage: (msg: unknown) => void }).postMessage({ id, type, error: String(error) })
  }
}

function calcSMA(values: number[], period: number): number[] {
  const result: number[] = []
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) sum += values[i - j]
    result.push(sum / period)
  }
  return result
}

function calcEMA(values: number[], period: number): number[] {
  const result: number[] = []
  const multiplier = 2 / (period + 1)
  let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period
  result.push(ema)
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema
    result.push(ema)
  }
  return result
}

function calcRSI(closes: number[], period = 14): { value: number; overbought: boolean; oversold: boolean } | undefined {
  if (closes.length < period + 1) return undefined
  const gains: number[] = []
  const losses: number[] = []
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    gains.push(diff > 0 ? diff : 0)
    losses.push(diff < 0 ? -diff : 0)
  }
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period
  if (avgLoss === 0) return { value: 100, overbought: true, oversold: false }
  let rs = avgGain / avgLoss
  let rsi = 100 - 100 / (1 + rs)
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
    if (avgLoss === 0) { rsi = 100 } else { rs = avgGain / avgLoss; rsi = 100 - 100 / (1 + rs) }
  }
  return { value: rsi, overbought: rsi > 70, oversold: rsi < 30 }
}

function calcMACD(closes: number[], fast = 12, slow = 26, signal = 9) {
  if (closes.length < slow + signal) return undefined
  const fastEMA = calcEMA(closes, fast)
  const slowEMA = calcEMA(closes, slow)
  const macdLine: number[] = []
  const startIdx = fastEMA.length - slowEMA.length
  for (let i = 0; i < slowEMA.length; i++) macdLine.push(fastEMA[i + startIdx] - slowEMA[i])
  const signalLine = calcEMA(macdLine, signal)
  return { macd: macdLine[macdLine.length - 1], signal: signalLine[signalLine.length - 1], histogram: macdLine[macdLine.length - 1] - signalLine[signalLine.length - 1] }
}

function calcBollingerBands(closes: number[], period = 20, stdDev = 2) {
  if (closes.length < period) return undefined
  const sma = calcSMA(closes, period)
  const middle = sma[sma.length - 1]
  const slice = closes.slice(closes.length - period)
  const variance = slice.reduce((sum, val) => sum + (val - middle) ** 2, 0) / period
  const std = Math.sqrt(variance)
  return { upper: middle + stdDev * std, middle, lower: middle - stdDev * std }
}

function calcADX(candles: Candle[], period = 14): number | undefined {
  if (candles.length < period * 2) return undefined
  const tr: number[] = []; const plusDM: number[] = []; const minusDM: number[] = []
  for (let i = 1; i < candles.length; i++) {
    const h = candles[i].high; const l = candles[i].low; const pH = candles[i - 1].high; const pL = candles[i - 1].low; const pC = candles[i - 1].close
    tr.push(Math.max(h - l, Math.abs(h - pC), Math.abs(l - pC)))
    const up = h - pH; const down = pL - l
    plusDM.push(up > down && up > 0 ? up : 0)
    minusDM.push(down > up && down > 0 ? down : 0)
  }
  const atr = calcSMA(tr, period); const aPDM = calcSMA(plusDM, period); const aMDM = calcSMA(minusDM, period)
  const li = atr.length - 1; if (li < 0 || atr[li] === 0) return undefined
  return Math.abs((aPDM[li] / atr[li] * 100 - aMDM[li] / atr[li] * 100) / (aPDM[li] / atr[li] * 100 + aMDM[li] / atr[li] * 100)) * 100
}
