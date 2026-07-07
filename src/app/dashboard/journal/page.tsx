"use client"

import { TradeJournal } from "@/components/trading/TradeJournal"

export default function JournalPage() {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-lg font-bold">Trade Journal</h1>
          <p className="text-sm text-muted-foreground">Log your trades, track patterns, learn from AI analysis</p>
        </div>
        <TradeJournal />
      </div>
    </div>
  )
}
