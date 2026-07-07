"use client"

import { useState, useMemo } from "react"
import { useJournalStore, type TradeJournalEntry } from "@/stores/journalStore"
import { useAIStore } from "@/stores/aiStore"
import { streamChat } from "@/lib/ai/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatPercent, formatDate, generateId, cn } from "@/lib/utils"
import { BookOpen, Plus, Trash2, Brain, Loader2, TrendingUp, TrendingDown, BarChart3, Target, Sparkles, X } from "lucide-react"
import { toast } from "sonner"

export function TradeJournal() {
  const { entries, addEntry, deleteEntry, closeTrade, enrichWithAI, getStats } = useJournalStore()
  const { providerState } = useAIStore()
  const [showForm, setShowForm] = useState(false)
  const [enriching, setEnriching] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"journal" | "stats">("journal")

  const stats = useMemo(() => getStats(), [entries])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Trade Journal</span>
          <Badge variant="outline" className="text-[10px]">{entries.length} entries</Badge>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant={activeTab === "journal" ? "default" : "ghost"} className="h-7 text-xs" onClick={() => setActiveTab("journal")}>
            Journal
          </Button>
          <Button size="sm" variant={activeTab === "stats" ? "default" : "ghost"} className="h-7 text-xs" onClick={() => setActiveTab("stats")}>
            Stats
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-3 w-3" />
            Log Trade
          </Button>
        </div>
      </div>

      {showForm && (
        <JournalEntryForm onSave={() => setShowForm(false)} />
      )}

      {activeTab === "stats" ? (
        <JournalStats stats={stats} />
      ) : (
        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-8">
              No journal entries yet. Log your first trade!
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              {entries.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={() => deleteEntry(entry.id)}
                  onClose={(price) => closeTrade(entry.id, price, Date.now())}
                  onEnrich={() => handleEnrich(entry.id)}
                  enriching={enriching === entry.id}
                />
              ))}
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  )
}

function JournalEntryForm({ onSave }: { onSave: () => void }) {
  const { addEntry } = useJournalStore()
  const [symbol, setSymbol] = useState("")
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [entryPrice, setEntryPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [strategy, setStrategy] = useState("")
  const [notes, setNotes] = useState("")
  const [emotions, setEmotions] = useState("")
  const [lessons, setLessons] = useState("")
  const [rating, setRating] = useState<3 | 1 | 2 | 4 | 5>(3)

  function handleSubmit() {
    if (!symbol || !entryPrice || !quantity) {
      toast.error("Symbol, price, and quantity are required")
      return
    }
    addEntry({
      symbol: symbol.toUpperCase(),
      side,
      entryPrice: parseFloat(entryPrice),
      exitPrice: null,
      quantity: parseFloat(quantity),
      entryDate: Date.now(),
      exitDate: null,
      pnl: null,
      pnlPercent: null,
      strategy: strategy || "Not specified",
      notes,
      emotions,
      lessons,
      tags: [],
      rating,
    })
    toast.success("Trade logged!")
    onSave()
  }

  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">Symbol</label>
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="BTCUSDT" className="h-8 text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Side</label>
            <div className="flex gap-1 mt-1">
              <Button size="sm" variant={side === "buy" ? "default" : "outline"} className="h-7 text-xs flex-1" onClick={() => setSide("buy")}>
                <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" /> Buy
              </Button>
              <Button size="sm" variant={side === "sell" ? "default" : "outline"} className="h-7 text-xs flex-1" onClick={() => setSide("sell")}>
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" /> Sell
              </Button>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Entry Price</label>
            <Input value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="0.00" type="number" step="any" className="h-8 text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Quantity</label>
            <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0.00" type="number" step="any" className="h-8 text-xs" />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground">Strategy</label>
            <Input value={strategy} onChange={(e) => setStrategy(e.target.value)} placeholder="e.g. Breakout, Trend Following, RSI Reversal" className="h-8 text-xs" />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-muted border border-border rounded-md px-2 py-1 text-xs h-16 resize-none" placeholder="Why did you enter this trade?" />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground">Emotions at Entry</label>
            <textarea value={emotions} onChange={(e) => setEmotions(e.target.value)} className="w-full bg-muted border border-border rounded-md px-2 py-1 text-xs h-12 resize-none" placeholder="How were you feeling? (e.g. confident, nervous, FOMO)" />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground">Rating: {rating}/5</label>
            <input type="range" min="1" max="5" step="1" value={rating} onChange={(e) => setRating(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)} className="w-full" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="h-8 text-xs flex-1" onClick={handleSubmit}>
            <BookOpen className="h-3 w-3 mr-1" /> Log Entry
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={onSave}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function JournalEntryCard({ entry, onDelete, onClose, onEnrich, enriching }: {
  entry: TradeJournalEntry
  onDelete: () => void
  onClose: (price: number) => void
  onEnrich: () => void
  enriching: boolean
}) {
  const [closePrice, setClosePrice] = useState("")

  return (
    <Card className={cn(entry.pnl !== null && (entry.pnl > 0 ? "border-emerald-500/20" : "border-red-500/20"))}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={entry.side === "buy" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
              {entry.side === "buy" ? "LONG" : "SHORT"}
            </Badge>
            <span className="text-sm font-semibold font-mono">{entry.symbol}</span>
            {entry.pnl !== null && (
              <Badge variant="outline" className={cn("text-[10px]", entry.pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                {entry.pnl >= 0 ? "+" : ""}{formatCurrency(entry.pnl)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!entry.aiEnriched && entry.pnl !== null && (
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onEnrich} disabled={enriching} title="Analyze with AI">
                {enriching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3 text-purple-500" />}
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onDelete}>
              <Trash2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[11px]">
          <div><span className="text-muted-foreground">Entry: </span><span className="font-mono">{formatCurrency(entry.entryPrice)}</span></div>
          <div><span className="text-muted-foreground">Qty: </span><span className="font-mono">{entry.quantity.toFixed(4)}</span></div>
          <div><span className="text-muted-foreground">Date: </span><span>{formatDate(entry.entryDate)}</span></div>
          <div><span className="text-muted-foreground">Strategy: </span><span>{entry.strategy}</span></div>
          {entry.exitPrice && (
            <>
              <div><span className="text-muted-foreground">Exit: </span><span className="font-mono">{formatCurrency(entry.exitPrice)}</span></div>
              <div><span className="text-muted-foreground">P&L: </span><span className={cn("font-mono", (entry.pnl ?? 0) >= 0 ? "text-emerald-500" : "text-red-500")}>
                {(entry.pnl ?? 0) >= 0 ? "+" : ""}{formatPercent(entry.pnlPercent ?? 0)}
              </span></div>
            </>
          )}
        </div>

        {entry.notes && <div className="text-[11px] text-muted-foreground mt-1 italic">"{entry.notes}"</div>}

        {!entry.exitPrice && (
          <div className="flex gap-1 mt-2">
            <Input value={closePrice} onChange={(e) => setClosePrice(e.target.value)} placeholder="Exit price..." className="h-7 text-xs flex-1" type="number" step="any" />
            <Button size="sm" className="h-7 text-xs" onClick={() => { if (closePrice) { onClose(parseFloat(closePrice)); setClosePrice("") } }} disabled={!closePrice}>
              Close Trade
            </Button>
          </div>
        )}

        {entry.aiAnalysis && (
          <div className="mt-2 text-[10px] bg-primary/5 rounded-md p-2">
            <div className="flex items-center gap-1 text-primary font-medium mb-1">
              <Sparkles className="h-2.5 w-2.5" /> AI Analysis
            </div>
            <div className="text-muted-foreground">{entry.aiAnalysis}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function JournalStats({ stats }: { stats: ReturnType<typeof useJournalStore.getState>["getStats"] extends () => infer R ? R : never }) {
  if (stats.totalTrades === 0) return (
    <div className="text-center text-xs text-muted-foreground py-8">
      No closed trades yet. Close some trades to see stats.
    </div>
  )

  const statItems = [
    { label: "Win Rate", value: `${stats.winRate.toFixed(0)}%`, color: stats.winRate >= 50 ? "text-emerald-500" : "text-red-500" },
    { label: "Total P&L", value: `${stats.totalPnl >= 0 ? "+" : ""}${formatCurrency(Math.abs(stats.totalPnl))}`, color: stats.totalPnl >= 0 ? "text-emerald-500" : "text-red-500" },
    { label: "Profit Factor", value: stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2), color: stats.profitFactor >= 1.5 ? "text-emerald-500" : "text-amber-500" },
    { label: "Trades", value: String(stats.totalTrades) },
    { label: "Avg Win", value: formatCurrency(stats.avgWinPnl), color: "text-emerald-500" },
    { label: "Avg Loss", value: formatCurrency(Math.abs(stats.avgLossPnl)), color: "text-red-500" },
    { label: "Best Trade", value: formatCurrency(stats.bestTrade), color: "text-emerald-500" },
    { label: "Worst Trade", value: formatCurrency(stats.worstTrade), color: "text-red-500" },
    { label: "Avg Hold", value: `${stats.avgHoldingPeriod.toFixed(1)}h` },
    { label: "Streak", value: `${stats.currentStreak} ✅`, color: "text-emerald-500" },
    { label: "Top Strategy", value: stats.topStrategy || "—" },
    { label: "W/L Ratio", value: `${stats.winningTrades}/${stats.losingTrades}` },
  ]

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-2 text-center">
            <div className={cn("text-sm font-bold font-mono", item.color ?? "")}>{item.value}</div>
            <div className="text-[10px] text-muted-foreground">{item.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function handleEnrich(entryId: string) {
  const store = useJournalStore.getState()
  const entry = store.entries.find((e) => e.id === entryId)
  if (!entry || !entry.pnl) return

  const aiStore = useAIStore.getState()
  const { providerState } = aiStore

  let fullText = ""

  await streamChat(
    providerState.provider,
    providerState.apiKey,
    providerState.model,
    [
      { role: "system", content: "You are a trading psychologist and coach. Analyze the trade below and provide insights on what went right/wrong, emotional patterns, and improvement suggestions. 3-4 sentences max. Hinglish mein bata." },
      { role: "user", content: `Analyze this trade:\nSymbol: ${entry.symbol}\nSide: ${entry.side}\nEntry: ${entry.entryPrice}\nExit: ${entry.exitPrice}\nP&L: ${entry.pnl}\nP&L%: ${entry.pnlPercent}\nStrategy: ${entry.strategy}\nNotes: ${entry.notes}\nEmotions: ${entry.emotions}\nRating: ${entry.rating}/5` },
    ],
    {
      onToken: (token) => { fullText += token },
      onDone: () => {
        store.enrichWithAI(entry.id, fullText)
      },
      onError: () => {},
    }
  )
}
