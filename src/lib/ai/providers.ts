import type { AIProviderId, AIMessage } from "@/types"

export interface ChatRequest {
  model: string
  messages: { role: string; content: string }[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface ChatResponse {
  content: string
  finishReason?: string
}

export interface ProviderHandler {
  buildRequest: (req: ChatRequest) => { url: string; headers: Record<string, string>; body: string }
  parseResponse: (data: unknown) => ChatResponse
  parseStream: (line: string) => { content: string; done: boolean } | null
}

function openAIHandler(apiKey: string): ProviderHandler {
  return {
    buildRequest: ({ model, messages, systemPrompt, temperature, maxTokens, stream }) => {
      const msgs = systemPrompt ? [{ role: "system", content: systemPrompt }, ...messages] : messages
      return {
        url: "https://api.openai.com/v1/chat/completions",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: msgs, temperature, max_tokens: maxTokens, stream }),
      }
    },
    parseResponse: (data: unknown) => {
      const d = data as { choices: { message: { content: string }; finish_reason: string }[] }
      return { content: d.choices?.[0]?.message?.content ?? "", finishReason: d.choices?.[0]?.finish_reason }
    },
    parseStream: (line: string) => {
      if (!line.startsWith("data: ")) return null
      const json = line.slice(6)
      if (json === "[DONE]") return { content: "", done: true }
      try {
        const d = JSON.parse(json) as { choices: { delta: { content?: string }; finish_reason: string | null }[] }
        return { content: d.choices?.[0]?.delta?.content ?? "", done: d.choices?.[0]?.finish_reason != null }
      } catch { return null }
    },
  }
}

function anthropicHandler(apiKey: string): ProviderHandler {
  return {
    buildRequest: ({ model, messages, systemPrompt, temperature, maxTokens, stream }) => {
      const body: Record<string, unknown> = {
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: maxTokens ?? 4096,
        stream,
      }
      if (systemPrompt) body.system = systemPrompt
      if (temperature != null) body.temperature = temperature
      return {
        url: "https://api.anthropic.com/v1/messages",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    },
    parseResponse: (data: unknown) => {
      const d = data as { content: { text: string }[]; stop_reason: string }
      return { content: d.content?.map((c) => c.text).join("") ?? "", finishReason: d.stop_reason }
    },
    parseStream: (line: string) => {
      if (!line.startsWith("data: ")) return null
      const json = line.slice(6)
      try {
        const d = JSON.parse(json) as { type: string; delta?: { text: string }; content_block?: { text: string } }
        if (d.type === "content_block_delta" && d.delta?.text) {
          return { content: d.delta.text, done: false }
        }
        if (d.type === "message_stop") return { content: "", done: true }
        if (d.type === "content_block_start" && d.content_block?.text) {
          return { content: d.content_block.text, done: false }
        }
      } catch { return null }
      return null
    },
  }
}

function googleHandler(apiKey: string): ProviderHandler {
  return {
    buildRequest: ({ model, messages, systemPrompt, temperature, maxTokens }) => {
      const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : m.role, parts: [{ text: m.content }] }))
      const body: Record<string, unknown> = { contents }
      const systemInstruction = systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined
      if (systemInstruction) body.system_instruction = systemInstruction
      if (temperature != null) body.generationConfig = { ...(body.generationConfig as object), temperature }
      if (maxTokens != null) body.generationConfig = { ...(body.generationConfig as object), maxOutputTokens: maxTokens }
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    },
    parseResponse: (data: unknown) => {
      const d = data as { candidates: { content: { parts: { text: string }[] }; finishReason: string }[] }
      const text = d.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? ""
      return { content: text, finishReason: d.candidates?.[0]?.finishReason }
    },
    parseStream: () => null,
  }
}

function groqHandler(apiKey: string): ProviderHandler {
  const h = openAIHandler(apiKey)
  return {
    ...h,
    buildRequest: (req) => {
      const r = h.buildRequest(req)
      return { ...r, url: "https://api.groq.com/openai/v1/chat/completions" }
    },
  }
}

function openRouterHandler(apiKey: string): ProviderHandler {
  const h = openAIHandler(apiKey)
  return {
    ...h,
    buildRequest: (req) => {
      const r = h.buildRequest(req)
      return {
        ...r,
        url: "https://openrouter.ai/api/v1/chat/completions",
        headers: { ...r.headers, "HTTP-Referer": window.location.origin, "X-Title": "TradeSim" },
      }
    },
  }
}

function ollamaHandler(): ProviderHandler {
  return {
    buildRequest: ({ model, messages, systemPrompt, temperature, stream }) => {
      const msgs = systemPrompt ? [{ role: "system", content: systemPrompt }, ...messages] : messages
      return {
        url: "http://localhost:11434/api/chat",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: msgs, temperature, stream }),
      }
    },
    parseResponse: (data: unknown) => {
      const d = data as { message: { content: string }; done: boolean }
      return { content: d.message?.content ?? "", finishReason: d.done ? "stop" : undefined }
    },
    parseStream: (line: string) => {
      if (!line.trim()) return null
      try {
        const d = JSON.parse(line) as { message?: { content: string }; done: boolean }
        return { content: d.message?.content ?? "", done: d.done ?? false }
      } catch { return null }
    },
  }
}

export function getProviderHandler(providerId: AIProviderId, apiKey: string): ProviderHandler {
  switch (providerId) {
    case "openai": return openAIHandler(apiKey)
    case "anthropic": return anthropicHandler(apiKey)
    case "google": return googleHandler(apiKey)
    case "groq": return groqHandler(apiKey)
    case "openrouter": return openRouterHandler(apiKey)
    case "ollama": return ollamaHandler()
    default: return openAIHandler(apiKey)
  }
}
