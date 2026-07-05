import type { Candle } from "@/types"

export interface RSIData {
  value: number
  overbought: boolean
  oversold: boolean
}

export interface MACDData {
  macd: number
  signal: number
  histogram: number
}

export interface BollingerBandsData {
  upper: number
  middle: number
  lower: number
}

export interface IndicatorResult {
  rsi?: RSIData
  macd?: MACDData
  sma?: number[]
  ema?: number[]
  bb?: BollingerBandsData
  volumeSMA?: number
}

export function calcSMA(values: number[], period: number): number[] {
  const result: number[] = []
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += values[i - j]
    }
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

export function calcRSI(closes: number[], period = 14): RSIData | undefined {
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
    if (avgLoss === 0) {
      rsi = 100
    } else {
      rs = avgGain / avgLoss
      rsi = 100 - 100 / (1 + rs)
    }
  }

  return {
    value: rsi,
    overbought: rsi > 70,
    oversold: rsi < 30,
  }
}

export function calcMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDData | undefined {
  if (closes.length < slowPeriod + signalPeriod) return undefined

  const fastEMA = calcEMA(closes, fastPeriod)
  const slowEMA = calcEMA(closes, slowPeriod)

  const macdLine: number[] = []
  const startIdx = fastEMA.length - slowEMA.length
  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + startIdx] - slowEMA[i])
  }

  const signal = calcEMA(macdLine, signalPeriod)
  const histogram = macdLine[macdLine.length - 1] - signal[signal.length - 1]

  return {
    macd: macdLine[macdLine.length - 1],
    signal: signal[signal.length - 1],
    histogram,
  }
}

export function calcBollingerBands(
  closes: number[],
  period = 20,
  stdDev = 2
): BollingerBandsData | undefined {
  if (closes.length < period) return undefined

  const sma = calcSMA(closes, period)
  const middle = sma[sma.length - 1]

  const slice = closes.slice(closes.length - period)
  const variance = slice.reduce((sum, val) => sum + (val - middle) ** 2, 0) / period
  const std = Math.sqrt(variance)

  return {
    upper: middle + stdDev * std,
    middle,
    lower: middle - stdDev * std,
  }
}

export function calcAllIndicators(candles: Candle[]): IndicatorResult {
  const closes = candles.map((c) => c.close)
  const volumes = candles.map((c) => c.volume)

  return {
    rsi: calcRSI(closes),
    macd: calcMACD(closes),
    sma: calcSMA(closes, 20).slice(-3),
    ema: calcEMA(closes, 20).slice(-3),
    bb: calcBollingerBands(closes),
    volumeSMA: volumes.length > 20
      ? volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
      : undefined,
  }
}

export function findSupportResistance(candles: Candle[]): { support: number; resistance: number } {
  if (candles.length < 20) return { support: 0, resistance: 0 }

  const recent = candles.slice(-50)
  const highs = recent.map((c) => c.high)
  const lows = recent.map((c) => c.low)

  highs.sort((a, b) => b - a)
  lows.sort((a, b) => a - b)

  return {
    resistance: highs.slice(0, 3).reduce((a, b) => a + b, 0) / 3,
    support: lows.slice(0, 3).reduce((a, b) => a + b, 0) / 3,
  }
}

export function calcADX(candles: Candle[], period = 14): number | undefined {
  if (candles.length < period * 2) return undefined

  const tr: number[] = []
  const plusDM: number[] = []
  const minusDM: number[] = []

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high
    const low = candles[i].low
    const prevHigh = candles[i - 1].high
    const prevLow = candles[i - 1].low
    const prevClose = candles[i - 1].close

    tr.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)))

    const upMove = high - prevHigh
    const downMove = prevLow - low

    if (upMove > downMove && upMove > 0) {
      plusDM.push(upMove)
    } else {
      plusDM.push(0)
    }

    if (downMove > upMove && downMove > 0) {
      minusDM.push(downMove)
    } else {
      minusDM.push(0)
    }
  }

  const atr = calcSMA(tr, period)
  const avgPlusDM = calcSMA(plusDM, period)
  const avgMinusDM = calcSMA(minusDM, period)

  const lastIdx = atr.length - 1
  if (lastIdx < 0 || atr[lastIdx] === 0) return undefined

  const plusDI = (avgPlusDM[lastIdx] / atr[lastIdx]) * 100
  const minusDI = (avgMinusDM[lastIdx] / atr[lastIdx]) * 100
  const dx = Math.abs((plusDI - minusDI) / (plusDI + minusDI)) * 100

  return dx
}

export function calcOBV(candles: Candle[]): number {
  let obv = 0
  for (let i = 1; i < candles.length; i++) {
    if (candles[i].close > candles[i - 1].close) {
      obv += candles[i].volume
    } else if (candles[i].close < candles[i - 1].close) {
      obv -= candles[i].volume
    }
  }
  return obv
}
