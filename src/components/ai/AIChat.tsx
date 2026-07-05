"use client"

import { useState, useRef, useEffect } from "react"
import { useAIStore } from "@/stores/aiStore"
import { useMarketStore } from "@/stores/marketStore"
import { streamChat } from "@/lib/ai/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { generateId } from "@/lib/utils"
import { Send, Bot, User, Loader2, RefreshCw, Copy, Settings } from "lucide-react"
import { toast } from "sonner"
import { AISettings } from "./AISettings"
import type { AIMessage } from "@/types"

export function AIChat() {
  const [showSettings, setShowSettings] = useState(false)
  const { messages, isStreaming, providerState, addMessage, appendToLastAssistant, setIsStreaming, setStreamStatus, clearMessages } = useAIStore()
  const { activeSymbol } = useMarketStore()
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return
    if (!providerState.apiKey && providerState.provider !== "ollama") {
      toast.error("Set your API key in AI settings first")
      return
    }

    setInput("")

    const userMsg: AIMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    }
    addMessage(userMsg)

    setIsStreaming(true)
    setStreamStatus("streaming")

    const chatMessages = messages
      .concat(userMsg)
      .slice(-50)
      .map((m) => ({ role: m.role, content: m.content }))

    let fullResponse = ""

    const contextSymbol = text.toLowerCase().includes("btc") ? "BTCUSDT"
      : text.toLowerCase().includes("eth") ? "ETHUSDT"
      : text.toLowerCase().includes("sol") ? "SOLUSDT"
      : text.toLowerCase().includes("xrp") ? "XRPUSDT"
      : text.toLowerCase().includes("ada") ? "ADAUSDT"
      : text.toLowerCase().includes("doge") ? "DOGEUSDT"
      : text.toLowerCase().includes("bnb") ? "BNBUSDT"
      : text.toLowerCase().includes("avax") ? "AVAXUSDT"
      : text.toLowerCase().includes("dot") ? "DOTUSDT"
      : text.toLowerCase().includes("link") ? "LINKUSDT"
      : activeSymbol

    await streamChat(
      providerState.provider,
      providerState.apiKey,
      providerState.model,
      chatMessages,
      {
        onToken: (token) => {
          if (!fullResponse) {
            const assistantMsg: AIMessage = {
              id: generateId(),
              role: "assistant",
              content: token,
              timestamp: Date.now(),
            }
            addMessage(assistantMsg)
            fullResponse = token
          } else {
            appendToLastAssistant(token)
            fullResponse += token
          }
        },
        onDone: () => {
          setIsStreaming(false)
          setStreamStatus("idle")
        },
        onError: (error) => {
          setIsStreaming(false)
          setStreamStatus("error")
          const errMsg: AIMessage = {
            id: generateId(),
            role: "assistant",
            content: `Error: ${error}`,
            timestamp: Date.now(),
          }
          addMessage(errMsg)
          toast.error(error)
        },
      },
      providerState.systemPrompt || undefined,
      contextSymbol
    )
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard")
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Assistant</span>
          {providerState.apiKey || providerState.provider === "ollama" ? (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              {providerState.provider}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] px-1 py-0 text-amber-500 border-amber-500">
              No key
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearMessages}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {showSettings && (
        <div className="border-b p-4 max-h-[50vh] overflow-y-auto">
          <AISettings />
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm font-medium mb-1">AI Research Assistant</p>
            <p className="text-xs max-w-[250px]">
              Ask about any asset. Example: &ldquo;Analyze BTC for a swing trade&rdquo; or &ldquo;What&rsquo;s the sentiment on ETH?&rdquo;
            </p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn("max-w-[85%] space-y-1", msg.role === "user" && "order-first")}>
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                </div>
                {msg.role === "assistant" && !isStreaming && (
                  <div className="flex items-center gap-2 px-1">
                    <button
                      onClick={() => copyMessage(msg.content)}
                      className="text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isStreaming && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce delay-100" />
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-3 shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${activeSymbol.replace("USDT", "")}...`}
            disabled={isStreaming}
            className="h-9 text-sm"
          />
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={isStreaming || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


