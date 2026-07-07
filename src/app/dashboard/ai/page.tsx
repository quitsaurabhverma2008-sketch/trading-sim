"use client"

import { useState } from "react"
import { AIChat } from "@/components/ai/AIChat"
import { MultiAgentAnalysis } from "@/components/ai/MultiAgentAnalysis"
import { ErrorBoundary } from "@/components/ai/ErrorBoundary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Users } from "lucide-react"

export default function AIPage() {
  const [tab, setTab] = useState("chat")

  return (
    <div className="h-full flex flex-col min-h-0">
      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-3 pb-0">
          <TabsList>
            <TabsTrigger value="chat" className="text-xs gap-1">
              <Bot className="h-3.5 w-3.5" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="multi-agent" className="text-xs gap-1">
              <Users className="h-3.5 w-3.5" />
              Multi-Agent
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0">
          <ErrorBoundary>
            <AIChat />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="multi-agent" className="flex-1 overflow-y-auto p-4">
          <MultiAgentAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  )
}
