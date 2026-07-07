"use client"

import { useState, useEffect, useCallback } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { MessageCircle, TrendingUp, TrendingDown, Minus, Newspaper, Loader2, RefreshCw, AlertTriangle } from "lucide-react"

interface NewsItem {
  title: string
  source: string
  url: string
  publishedAt: number
  sentiment: "positive" | "negative" | "neutral"
  summary: string
}

interface SentimentData {
  symbol: string
  overall: "bullish" | "bearish" | "neutral"
  score: number
  newsCount: number
  positiveCount: number
  negativeCount: number
  news: NewsItem[]
}

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "BNBUSDT", "AVAXUSDT", "DOTUSDT", "LINKUSDT"]

const SENTIMENT_SCORES: Record<string, { score: number; reason: string }> = {
  BTCUSDT: { score: 65, reason: "ETF inflows positive, macro uncertainty" },
  ETHUSDT: { score: 58, reason: "L2 adoption growing, gas fees moderate" },
  SOLUSDT: { score: 72, reason: "Strong ecosystem growth, high developer activity" },
  XRPUSDT: { score: 45, reason: "Regulatory overhang, mixed legal signals" },
  ADAUSDT: { score: 55, reason: "Development active, price lagging" },
  DOGEUSDT: { score: 35, reason: "Low utility, memecoin hype fading" },
  BNBUSDT: { score: 60, reason: "Ecosystem strong, regulatory concerns" },
  AVAXUSDT: { score: 50, reason: "Subnet adoption, competitive pressure" },
  DOTUSDT: { score: 48, reason: "Parachain activity moderate" },
  LINKUSDT: { score: 68, reason: "Oracle demand growing, partnerships" },
}

const NEWS_HEADLINES: Record<string, NewsItem[]> = {
  BTCUSDT: [
    { title: "Bitcoin ETFs See Record Inflows as Institutional Interest Grows", source: "CoinDesk", url: "#", publishedAt: Date.now() - 3600000, sentiment: "positive", summary: "Spot Bitcoin ETFs recorded $500M+ in daily inflows." },
    { title: "BTC Hashrate Hits New All-Time High", source: "CoinTelegraph", url: "#", publishedAt: Date.now() - 7200000, sentiment: "positive", summary: "Network security strengthens as miners remain confident." },
    { title: "Fed Comments Trigger Caution in Crypto Markets", source: "Bloomberg", url: "#", publishedAt: Date.now() - 10800000, sentiment: "negative", summary: "Hawkish stance may impact risk asset appetite." },
    { title: "MicroStrategy Adds 5,000 More BTC", source: "CoinDesk", url: "#", publishedAt: Date.now() - 14400000, sentiment: "positive", summary: "Corporate adoption continues with latest purchase." },
  ],
  ETHUSDT: [
    { title: "Ethereum L2 Transactions Surpass Mainnet Volume", source: "The Block", url: "#", publishedAt: Date.now() - 3600000, sentiment: "positive", summary: "Arbitrum and Optimism driving adoption." },
    { title: "ETH Staking Rate Reaches 25% of Supply", source: "CoinTelegraph", url: "#", publishedAt: Date.now() - 7200000, sentiment: "positive", summary: "More holders participating in network security." },
    { title: "Gas Fees Drop to Multi-Year Lows", source: "Decrypt", url: "#", publishedAt: Date.now() - 10800000, sentiment: "neutral", summary: "Dencun upgrade effects reducing L1 congestion." },
  ],
}

function generateNews(symbol: string): NewsItem[] {
  if (NEWS_HEADLINES[symbol]) return NEWS_HEADLINES[symbol]

  const templates = [
    { t: "${symbol} Price Analysis: Key Levels to Watch This Week", s: "TradingView", se: "neutral" as const },
    { t: "${symbol} Trading Volume Surges 40% in 24 Hours", s: "CoinTelegraph", se: "positive" as const },
    { t: "Analysts Weigh In on ${symbol} Outlook for Q3", s: "CoinDesk", se: "neutral" as const },
    { t: "${symbol} Technical Indicators Point to Potential Breakout", s: "TradingView", se: "positive" as const },
    { t: "Market Makers Accumulating ${symbol} — On-Chain Data Shows", s: "Santiment", se: "positive" as const },
    { t: "${symbol} Faces Resistance at Key Level", s: "CoinTelegraph", se: "negative" as const },
  ]

  return templates.map((t, i) => ({
    title: t.t.replace("${symbol}", symbol.replace("USDT", "")),
    source: t.s,
    url: "#",
    publishedAt: Date.now() - (i + 1) * 3600000,
    sentiment: t.se,
    summary: `${symbol.replace("USDT", "")} market analysis for today.`,
  }))
}

export function SentimentDashboard() {
  const { realtimePrices, tickers } = useMarketStore()
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const [loading, setLoading] = useState(false)

  const getSentimentData = useCallback((symbol: string): SentimentData => {
    const scoreInfo = SENTIMENT_SCORES[symbol] || { score: 50, reason: "Mixed signals" }
    const news = generateNews(symbol)
    const positiveCount = news.filter((n) => n.sentiment === "positive").length
    const negativeCount = news.filter((n) => n.sentiment === "negative").length
    const overall = scoreInfo.score >= 60 ? "bullish" : scoreInfo.score <= 40 ? "bearish" : "neutral"
    return {
      symbol,
      overall,
      score: scoreInfo.score,
      newsCount: news.length,
      positiveCount,
      negativeCount,
      news,
    }
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Market Sentiment</span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {SYMBOLS.map((sym) => {
          const data = getSentimentData(sym)
          const isSelected = sym === selectedSymbol
          return (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors border",
                isSelected ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
              )}
            >
              <span className="font-medium">{sym.replace("USDT", "")}</span>
              {data.overall === "bullish" ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : data.overall === "bearish" ? <TrendingDown className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
              <span className={cn("font-mono", data.score >= 60 ? "text-emerald-500" : data.score <= 40 ? "text-red-500" : "")}>{data.score}</span>
            </button>
          )
        })}
      </div>

      {selectedSymbol && (() => {
        const data = getSentimentData(selectedSymbol)
        const ticker = tickers[selectedSymbol]
        const change = ticker?.priceChangePercent ?? 0

        return (
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold">{data.symbol.replace("USDT", "")}</div>
                    <div className="text-xs text-muted-foreground">Sentiment Score</div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-2xl font-bold font-mono", data.score >= 60 ? "text-emerald-500" : data.score <= 40 ? "text-red-500" : "")}>
                      {data.score}/100
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      data.overall === "bullish" ? "text-emerald-500 border-emerald-500" : data.overall === "bearish" ? "text-red-500 border-red-500" : ""
                    )}>
                      {data.overall === "bullish" ? "🟢 Bullish" : data.overall === "bearish" ? "🔴 Bearish" : "🟡 Neutral"}
                    </Badge>
                  </div>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className={cn("h-full rounded-full transition-all", data.score >= 60 ? "bg-emerald-500" : data.score <= 40 ? "bg-red-500" : "bg-amber-500")}
                    style={{ width: `${data.score}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Bearish 0</span>
                  <span className="font-medium">{SENTIMENT_SCORES[data.symbol]?.reason || "Mixed signals"}</span>
                  <span>100 Bullish</span>
                </div>

                {ticker && (
                  <div className="flex gap-3 mt-3 text-[11px]">
                    <div><span className="text-muted-foreground">24h Change: </span><span className={cn("font-mono", change >= 0 ? "text-emerald-500" : "text-red-500")}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span></div>
                    <div><span className="text-muted-foreground">News: </span><span className="font-mono">{data.newsCount} articles</span></div>
                    <div><span className="text-muted-foreground">Pos/Neg: </span><span className="font-mono"><span className="text-emerald-500">{data.positiveCount}</span>/<span className="text-red-500">{data.negativeCount}</span></span></div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 pb-1 flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium flex items-center gap-1">
                  <Newspaper className="h-3 w-3" /> Latest News
                </CardTitle>
              </CardHeader>
              <ScrollArea className="h-[300px]">
                <CardContent className="p-3 pt-1">
                  <div className="space-y-2">
                    {data.news.map((item, i) => (
                      <a key={i} href={item.url} className="block p-2 rounded-md hover:bg-muted/30 transition-colors border border-border/30">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {item.sentiment === "positive" ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : item.sentiment === "negative" ? <TrendingDown className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium leading-tight">{item.title}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{item.source} · {new Date(item.publishedAt).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          </div>
        )
      })()}
    </div>
  )
}
