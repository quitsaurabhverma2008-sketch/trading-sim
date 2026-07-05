"use client"

import { useState } from "react"
import { useAIStore } from "@/stores/aiStore"
import { AI_PROVIDERS, SYSTEM_PROMPT } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AIProviderId } from "@/types"

export function AISettings() {
  const { providerState, updateProviderState } = useAIStore()
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<"idle" | "success" | "error">("idle")

  const provider = AI_PROVIDERS.find((p) => p.id === providerState.provider)
  const models = provider?.models ?? []

  async function testConnection() {
    if (!providerState.apiKey && providerState.provider !== "ollama" && providerState.provider !== "xsmodel") {
      toast.error("Enter an API key first")
      return
    }

    setTesting(true)
    setTestResult("idle")

    try {
      const { getProviderHandler } = await import("@/lib/ai/providers")
      const handler = getProviderHandler(providerState.provider, providerState.apiKey)
      const { url, headers, body } = handler.buildRequest({
        model: providerState.model,
        messages: [{ role: "user", content: "Reply with just: OK" }],
        maxTokens: 10,
      })
      const res = await fetch(url, { method: "POST", headers, body })
      if (res.ok) {
        setTestResult("success")
        toast.success("Connection successful")
      } else {
        setTestResult("error")
        const text = await res.text().catch(() => "Unknown error")
        toast.error(`Connection failed: ${res.status} ${text.slice(0, 100)}`)
      }
    } catch (err) {
      setTestResult("error")
      toast.error(err instanceof Error ? err.message : "Connection failed")
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Provider</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {AI_PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                updateProviderState({
                  provider: p.id as AIProviderId,
                  model: p.models[0]?.id ?? "",
                })
                setTestResult("idle")
              }}
              className={cn(
                "text-xs px-2 py-2 rounded-md border transition-colors text-center",
                providerState.provider === p.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              )}
            >
              <div className="font-medium">{p.name}</div>
              {!p.requiresKey && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 mt-1">
                  No key needed
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Model</Label>
        <select
          className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm"
          value={providerState.model}
          onChange={(e) => updateProviderState({ model: e.target.value })}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({Math.round(m.contextWindow / 1000)}k ctx)
            </option>
          ))}
        </select>
      </div>

      {provider?.requiresKey && (
        <div className="space-y-2">
          <Label className="text-xs">API Key</Label>
          <div className="flex gap-1">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                value={providerState.apiKey}
                onChange={(e) => updateProviderState({ apiKey: e.target.value })}
                placeholder={
                  providerState.provider === "openrouter"
                    ? "sk-or-..."
                    : providerState.provider === "anthropic"
                      ? "sk-ant-..."
                      : providerState.provider === "google"
                        ? "AIza..."
                        : providerState.provider === "groq"
                          ? "gsk_..."
                          : "sk-..."
                }
                className="h-9 text-sm pr-8"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={testConnection}
              disabled={testing}
            >
              {testing ? "..." : testResult === "success" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : testResult === "error" ? <AlertCircle className="h-3.5 w-3.5 text-red-500" /> : "Test"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs">System Prompt (optional override)</Label>
        <textarea
          className="w-full bg-muted border border-border rounded-md px-3 py-2 text-xs h-20 resize-none"
          value={providerState.systemPrompt}
          onChange={(e) => updateProviderState({ systemPrompt: e.target.value })}
          placeholder={SYSTEM_PROMPT.slice(0, 100) + "..."}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Temperature: {providerState.temperature.toFixed(1)}</Label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={providerState.temperature}
          onChange={(e) => updateProviderState({ temperature: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Max Tokens: {providerState.maxTokens}</Label>
        <input
          type="range"
          min="256"
          max="16384"
          step="256"
          value={providerState.maxTokens}
          onChange={(e) => updateProviderState({ maxTokens: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  )
}
