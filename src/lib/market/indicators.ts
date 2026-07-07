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
    sma: calcSMA(closes, 20),
    ema: calcEMA(closes, 20),
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

export function calcATR(candles: Candle[], period = 14): number | undefined {
  if (candles.length < period + 1) return undefined
  const tr: number[] = []
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high
    const low = candles[i].low
    const prevClose = candles[i - 1].close
    tr.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)))
  }
  const atrValues = calcSMA(tr, period)
  return atrValues[atrValues.length - 1]
}

export interface DetectedPattern {
  name: string
  direction: "bullish" | "bearish" | "neutral"
  strength: number
  description: string
}

export function detectCandlestickPatterns(candles: Candle[]): DetectedPattern[] {
  if (candles.length < 3) return []
  const patterns: DetectedPattern[] = []
  const last = candles[candles.length - 1]
  const prev = candles[candles.length - 2]
  const prev2 = candles.length > 2 ? candles[candles.length - 3] : null

  const bodySize = Math.abs(last.close - last.open)
  const upperWick = last.high - Math.max(last.open, last.close)
  const lowerWick = Math.min(last.open, last.close) - last.low
  const totalRange = last.high - last.low
  if (totalRange === 0) return patterns

  const bodyRatio = bodySize / totalRange

  if (bodyRatio < 0.1) {
    patterns.push({ name: "Doji", direction: "neutral", strength: 3, description: "Open and close nearly equal — indecision in market" })
  }

  const isBullish = last.close > last.open
  if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.3 && !isBullish) {
    patterns.push({ name: "Hammer", direction: "bullish", strength: 4, description: "Long lower wick at bottom of downtrend — potential reversal up" })
  }
  if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.3 && isBullish) {
    patterns.push({ name: "Shooting Star", direction: "bearish", strength: 4, description: "Long upper wick at top of uptrend — potential reversal down" })
  }

  if (candles.length >= 2 && prev2) {
    const prevBody = Math.abs(prev.close - prev.open)
    const prevBullish = prev.close > prev.open
    if (!prevBullish && isBullish && last.close > prev.open && last.open < prev.close) {
      patterns.push({ name: "Bullish Engulfing", direction: "bullish", strength: 5, description: "Green candle fully engulfs previous red — strong reversal signal" })
    }
    if (prevBullish && !isBullish && last.close < prev.open && last.open > prev.close) {
      patterns.push({ name: "Bearish Engulfing", direction: "bearish", strength: 5, description: "Red candle fully engulfs previous green — strong reversal down" })
    }
  }

  if (bodySize > totalRange * 0.7 && upperWick < bodySize * 0.1 && lowerWick < bodySize * 0.1) {
    patterns.push({
      name: isBullish ? "Marubozu (Bullish)" : "Marubozu (Bearish)",
      direction: isBullish ? "bullish" : "bearish",
      strength: 4,
      description: `Full-bodied ${isBullish ? "green" : "red"} candle with no wicks — strong ${isBullish ? "buying" : "selling"} pressure`,
    })
  }

  return patterns
}

export function detectChartPatterns(candles: Candle[]): DetectedPattern[] {
  if (candles.length < 20) return []
  const patterns: DetectedPattern[] = []
  const recent = candles.slice(-30)
  const closes = recent.map(c => c.close)
  const highs = recent.map(c => c.high)
  const lows = recent.map(c => c.low)

  const lookback = Math.min(14, Math.floor(recent.length / 2))
  const recentHighs = highs.slice(-lookback)
  const recentLows = lows.slice(-lookback)
  const currentPrice = closes[closes.length - 1]

  const maxIdx = recentHighs.indexOf(Math.max(...recentHighs))
  const minIdx = recentLows.indexOf(Math.min(...recentLows))

  if (maxIdx > 0 && currentPrice > recentHighs[maxIdx]) {
    patterns.push({ name: "Breakout Above Resistance", direction: "bullish", strength: 5, description: `Price broke above recent high of ${recentHighs[maxIdx]} — bullish breakout` })
  }
  if (minIdx > 0 && currentPrice < recentLows[minIdx]) {
    patterns.push({ name: "Breakdown Below Support", direction: "bearish", strength: 5, description: `Price broke below recent low of ${recentLows[minIdx]} — bearish breakdown` })
  }

  const midIdx = Math.floor(recent.length / 2)
  const firstHalf = closes.slice(0, midIdx)
  const secondHalf = closes.slice(midIdx)
  if (firstHalf.length > 3 && secondHalf.length > 3) {
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    if (secondAvg > firstAvg * 1.05) {
      patterns.push({ name: "Higher Lows Formation", direction: "bullish", strength: 3, description: "Price making higher lows in second half — uptrend structure intact" })
    } else if (secondAvg < firstAvg * 0.95) {
      patterns.push({ name: "Lower Highs Formation", direction: "bearish", strength: 3, description: "Price making lower highs in second half — downtrend structure forming" })
    }
  }

  const volatility = calcATR(candles, 14)
  if (volatility && volatility < (highs.reduce((a, b) => a + b, 0) / highs.length) * 0.02) {
    patterns.push({ name: "Low Volatility Squeeze", direction: "neutral", strength: 3, description: "ATR indicates low volatility — potential breakout incoming" })
  }

  return patterns
}

export interface RegimeInfo {
  regime: "trending_up" | "trending_down" | "ranging" | "volatile"
  strength: "strong" | "moderate" | "weak"
  adx: number | undefined
  atr: number | undefined
  atrPercent: number | undefined
  description: string
}

export function detectMarketRegime(candles: Candle[]): RegimeInfo {
  if (candles.length < 30) {
    return { regime: "ranging", strength: "weak", adx: undefined, atr: undefined, atrPercent: undefined, description: "Insufficient data for regime detection" }
  }

  const closes = candles.map(c => c.close)
  const adx = calcADX(candles)
  const atr = calcATR(candles)
  const avgPrice = closes.reduce((a, b) => a + b, 0) / closes.length
  const atrPercent = atr ? (atr / avgPrice) * 100 : undefined

  const recentCloses = closes.slice(-20)
  const firstHalf = recentCloses.slice(0, 10)
  const secondHalf = recentCloses.slice(-10)
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  const changePct = ((secondAvg - firstAvg) / firstAvg) * 100

  let regime: RegimeInfo["regime"] = "ranging"
  let strength: RegimeInfo["strength"] = "weak"
  let description = ""

  if (atrPercent && atrPercent > 4) {
    regime = "volatile"
    strength = "strong"
    description = `High volatility (ATR ${atrPercent.toFixed(2)}% of price) — wide swings expected`
  } else if (adx !== undefined) {
    if (adx > 35) {
      if (changePct > 3) {
        regime = "trending_up"
        description = `Strong uptrend (ADX ${adx.toFixed(1)}) — momentum favors bulls`
      } else if (changePct < -3) {
        regime = "trending_down"
        description = `Strong downtrend (ADX ${adx.toFixed(1)}) — momentum favors bears`
      } else {
        regime = "ranging"
        description = `High ADX (${adx.toFixed(1)}) but minimal net change — possible consolidation or trend transition`
      }
      strength = "strong"
    } else if (adx > 20) {
      if (Math.abs(changePct) > 2) {
        regime = changePct > 0 ? "trending_up" : "trending_down"
        strength = "moderate"
        description = `Moderate trend (ADX ${adx.toFixed(1)}) — directional bias ${changePct > 0 ? "up" : "down"}`
      } else {
        regime = "ranging"
        strength = "moderate"
        description = `Weak trend (ADX ${adx.toFixed(1)}) — price oscillating in range`
      }
    } else {
      regime = "ranging"
      strength = "weak"
      description = `No clear trend (ADX ${adx.toFixed(1)}) — range-bound conditions`
    }
  } else {
    if (Math.abs(changePct) > 5) {
      regime = changePct > 0 ? "trending_up" : "trending_down"
      strength = "moderate"
      description = `${changePct > 0 ? "Upward" : "Downward"} bias detected`
    } else {
      description = "Price moving sideways within narrow range"
    }
  }

  return { regime, strength, adx, atr, atrPercent, description }
}
