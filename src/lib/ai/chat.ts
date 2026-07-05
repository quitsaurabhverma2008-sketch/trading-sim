import { getProviderHandler, type ChatRequest, type ProviderHandler } from "./providers"
import type { AIProviderId } from "@/types"
import { AI_PROVIDERS, SYSTEM_PROMPT } from "@/lib/constants"

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: (fullText: string) => void
  onError: (error: string) => void
}

export async function streamChat(
  providerId: AIProviderId,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  callbacks: StreamCallbacks,
  systemPromptOverride?: string
): Promise<void> {
  const handler = getProviderHandler(providerId, apiKey)
  const provider = AI_PROVIDERS.find((p) => p.id === providerId)
  const isStreamable = providerId !== "google" && providerId !== "ollama"

  const request: ChatRequest = {
    model,
    messages,
    systemPrompt: systemPromptOverride || SYSTEM_PROMPT,
    temperature: 0.7,
    maxTokens: 4096,
    stream: isStreamable,
  }

  const { url, headers, body } = handler.buildRequest(request)

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error")
      let detail = errorText
      try {
        const err = JSON.parse(errorText)
        detail = err.error?.message || err.error || errorText
      } catch {}
      callbacks.onError(`API error (${res.status}): ${detail}`)
      return
    }

    if (isStreamable && res.body) {
      let fullText = ""
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          const parsed = handler.parseStream(line)
          if (parsed) {
            if (parsed.content) {
              fullText += parsed.content
              callbacks.onToken(parsed.content)
            }
            if (parsed.done) {
              callbacks.onDone(fullText)
              return
            }
          }
        }
      }

      if (buffer.trim()) {
        const parsed = handler.parseStream(buffer)
        if (parsed?.content) {
          callbacks.onToken(parsed.content)
          callbacks.onDone(fullText + parsed.content)
          return
        }
      }

      callbacks.onDone(fullText)
    } else {
      const data = await res.json()
      const result = handler.parseResponse(data)
      if (result.content) {
        callbacks.onToken(result.content)
      }
      callbacks.onDone(result.content)
    }
  } catch (err) {
    callbacks.onError(err instanceof Error ? err.message : "Network error")
  }
}
