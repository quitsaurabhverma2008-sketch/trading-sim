"use client"

import { useState } from "react"
import { useMarketStore } from "@/stores/marketStore"
import { useAIStore } from "@/stores/aiStore"
import { streamChat } from "@/lib/ai/chat"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Bot, Brain, TrendingUp, Globe, MessageCircle, Loader2, Sparkles, AlertTriangle } from "lucide-react"

type AgentType = "technical" | "fundamental" | "sentiment"

interface AgentResult {
  agent: AgentType
  content: string
  loading: boolean
  error: string | null
}

const AGENT_CONFIG: Record<AgentType, { label: string; icon: typeof Bot; color: string; prompt: string }> = {
  technical: {
    label: "Technical Analyst",
    icon: TrendingUp,
    color: "text-blue-500",
    prompt: "You are a technical analysis expert. Analyze {symbol} in detail. Focus on: price action, RSI, MACD, support/resistance, candlestick patterns, chart patterns, market regime. Use data tools to get real data. Write 3-4 paragraphs of detailed technical analysis in Hinglish (Bhai tone). End with specific price levels.",
  },
  fundamental: {
    label: "Fundamental Analyst",
    icon: Globe,
    color: "text-emerald-500",
    prompt: "You are a fundamental/macro analyst. Analyze {symbol} from a big-picture perspective. Focus on: market structure, long-term trends, volume analysis, key levels comparison, institutional interest signals. Use data tools. Write 3-4 paragraphs in Hinglish (Bhai tone). Cover both bullish and bearish cases.",
  },
  sentiment: {
    label: "Sentiment Analyst",
    icon: MessageCircle,
    color: "text-purple-500",
    prompt: "You are a market sentiment and liquidity analyst. Analyze {symbol} focusing on: market mood (fear/greed), volume trends, buying vs selling pressure, crowd psychology, liquidity zones. Use data tools. Write 3-4 paragraphs in Hinglish (Bhai tone). Read between the lines of what price is telling us.",
  },
}

export function MultiAgentAnalysis() {
  const { activeSymbol } = useMarketStore()
  const { providerState } = useAIStore()
  const [agents, setAgents] = useState<AgentResult[]>([
    { agent: "technical", content: "", loading: false, error: null },
    { agent: "fundamental", content: "", loading: false, error: null },
    { agent: "sentiment", content: "", loading: false, error: null },
  ])
  const [consolidated, setConsolidated] = useState("")
  const [consolidating, setConsolidating] = useState(false)
  const [showConsolidated, setShowConsolidated] = useState(false)

  const hasApiKey = providerState.apiKey || providerState.provider === "ollama" || providerState.provider === "xsmodel"

  async function runAgent(agentType: AgentType) {
    const config = AGENT_CONFIG[agentType]
    const formattedPrompt = config.prompt.replace("{symbol}", activeSymbol)

    setAgents((prev) => prev.map((a) => a.agent === agentType ? { ...a, loading: true, error: null, content: "" } : a))

    let fullText = ""

    const chatMessages = [
      { role: "system" as const, content: "You are a precise market analyst. Use the tools available to fetch real data. Write analysis in Hinglish with Bhai tone. Be factual and data-driven." },
      { role: "user" as const, content: formattedPrompt },
    ]

    await streamChat(
      providerState.provider,
      providerState.apiKey,
      providerState.model,
      chatMessages,
      {
        onToken: (token) => {
          fullText += token
          setAgents((prev) => prev.map((a) => a.agent === agentType ? { ...a, content: fullText } : a))
        },
        onDone: () => {
          setAgents((prev) => prev.map((a) => a.agent === agentType ? { ...a, loading: false } : a))
        },
        onError: (error) => {
          setAgents((prev) => prev.map((a) => a.agent === agentType ? { ...a, loading: false, error } : a))
        },
      },
      undefined,
      activeSymbol
    )
  }

  async function runAllAgents() {
    setShowConsolidated(false)
    setConsolidated("")
    await Promise.all([
      runAgent("technical"),
      runAgent("fundamental"),
      runAgent("sentiment"),
    ])
  }

  async function consolidateAnalyses() {
    setConsolidating(true)
    setConsolidated("")

    const allDone = agents.every((a) => !a.loading && a.content)
    if (!allDone) return

    const combined = agents.map((a) => `--- ${AGENT_CONFIG[a.agent].label} ---\n${a.content}`).join("\n\n")

    let fullText = ""

    await streamChat(
      providerState.provider,
      providerState.apiKey,
      providerState.model,
      [
        { role: "system", content: "You are a senior portfolio strategist. Consolidate the 3 agent analyses below into one coherent actionable summary. Keep it concise (3-4 paragraphs). Highlight key agreements, disagreements, and actionable takeaways. Write in Hinglish Bhai tone. End with a clear verdict." },
        { role: "user", content: `Consolidate these 3 analyses for ${activeSymbol}:\n\n${combined}` },
      ],
      {
        onToken: (token) => {
          fullText += token
          setConsolidated(fullText)
        },
        onDone: () => {
          setConsolidating(false)
          setShowConsolidated(true)
        },
        onError: (error) => {
          setConsolidated(`Error: ${error}`)
          setConsolidating(false)
        },
      },
      undefined,
      activeSymbol
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Multi-Agent Analysis</span>
          <Badge variant="outline" className="text-[10px]">{activeSymbol.replace("USDT", "")}</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={runAllAgents} disabled={!hasApiKey || agents.some((a) => a.loading)}>
            {agents.some((a) => a.loading) ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {agents.some((a) => a.loading) ? "Analyzing..." : "Run All Agents"}
          </Button>
        </div>
      </div>

      {!hasApiKey && (
        <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-md px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          Set an API key in AI Settings to use multi-agent analysis
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {agents.map((agentResult) => {
          const config = AGENT_CONFIG[agentResult.agent]
          const Icon = config.icon
          return (
            <Card key={agentResult.agent} className={cn("flex flex-col", agentResult.loading && "ring-1 ring-primary/30")}>
              <CardHeader className="p-3 pb-1 flex-row items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} />
                <CardTitle className="text-xs font-medium flex-1">{config.label}</CardTitle>
                {agentResult.loading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
              </CardHeader>
              <CardContent className="p-3 pt-1 flex-1">
                {agentResult.loading && !agentResult.content ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse py-4">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Analyzing...
                  </div>
                ) : agentResult.error ? (
                  <div className="text-xs text-red-500 py-2">{agentResult.error}</div>
                ) : agentResult.content ? (
                  <ScrollArea className="h-[200px]">
                    <div className="text-xs whitespace-pre-wrap leading-relaxed">{agentResult.content}</div>
                  </ScrollArea>
                ) : (
                  <div className="text-xs text-muted-foreground py-4 text-center">
                    Click "Run All Agents" to start
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {agents.every((a) => a.content && !a.loading) && !showConsolidated && (
        <Button size="sm" className="w-full h-8 text-xs gap-1" onClick={consolidateAnalyses} disabled={consolidating}>
          {consolidating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
          {consolidating ? "Consolidating..." : "Consolidate Into Final Verdict"}
        </Button>
      )}

      {showConsolidated && consolidated && (
        <Card className="border-primary/30">
          <CardHeader className="p-3 pb-1 flex-row items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-xs font-medium">Consolidated Verdict</CardTitle>
            <Badge variant="outline" className="text-[10px] ml-auto">{activeSymbol.replace("USDT", "")}</Badge>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xs whitespace-pre-wrap leading-relaxed">{consolidated}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
