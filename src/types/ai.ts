export type AIProviderId = "openai" | "anthropic" | "google" | "groq" | "openrouter" | "ollama" | "nvidia"

export interface AIProviderConfig {
  id: AIProviderId
  name: string
  models: AIModel[]
  apiKeyFormat: RegExp | string
  endpoint: string
  requiresKey: boolean
}

export interface AIModel {
  id: string
  name: string
  contextWindow: number
  provider: AIProviderId
}

export interface AIMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  toolCalls?: AIToolCall[]
  confidence?: "high" | "medium" | "low"
}

export interface AIToolCall {
  name: string
  arguments: Record<string, unknown>
  result?: unknown
}

export interface AIProviderState {
  provider: AIProviderId
  model: string
  apiKey: string
  temperature: number
  maxTokens: number
  systemPrompt: string
}

export type AIStreamStatus = "idle" | "streaming" | "error"
