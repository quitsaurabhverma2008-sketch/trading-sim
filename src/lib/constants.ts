import type { Timeframe, AIProviderConfig } from "@/types"

export const APP_NAME = "TradeSim"
export const APP_DESCRIPTION = "AI-Powered Crypto & Stock Paper-Trading Simulator"

export const DEFAULT_DEMO_BALANCE = 10000
export const DEFAULT_CURRENCY = "USD"

export const TIMEFRAMES: { id: Timeframe; label: string; seconds: number }[] = [
  { id: "1m", label: "1m", seconds: 60 },
  { id: "5m", label: "5m", seconds: 300 },
  { id: "15m", label: "15m", seconds: 900 },
  { id: "30m", label: "30m", seconds: 1800 },
  { id: "1h", label: "1h", seconds: 3600 },
  { id: "4h", label: "4h", seconds: 14400 },
  { id: "1d", label: "1D", seconds: 86400 },
  { id: "1w", label: "1W", seconds: 604800 },
]

export const CRYPTO_SYMBOLS = [
  { symbol: "BTCUSDT", name: "Bitcoin", baseAsset: "BTC", quoteAsset: "USDT", precision: 2 },
  { symbol: "ETHUSDT", name: "Ethereum", baseAsset: "ETH", quoteAsset: "USDT", precision: 2 },
  { symbol: "SOLUSDT", name: "Solana", baseAsset: "SOL", quoteAsset: "USDT", precision: 2 },
  { symbol: "BNBUSDT", name: "BNB", baseAsset: "BNB", quoteAsset: "USDT", precision: 2 },
  { symbol: "XRPUSDT", name: "XRP", baseAsset: "XRP", quoteAsset: "USDT", precision: 4 },
  { symbol: "ADAUSDT", name: "Cardano", baseAsset: "ADA", quoteAsset: "USDT", precision: 4 },
  { symbol: "DOGEUSDT", name: "Dogecoin", baseAsset: "DOGE", quoteAsset: "USDT", precision: 4 },
  { symbol: "AVAXUSDT", name: "Avalanche", baseAsset: "AVAX", quoteAsset: "USDT", precision: 2 },
  { symbol: "DOTUSDT", name: "Polkadot", baseAsset: "DOT", quoteAsset: "USDT", precision: 2 },
  { symbol: "LINKUSDT", name: "Chainlink", baseAsset: "LINK", quoteAsset: "USDT", precision: 3 },
  { symbol: "MATICUSDT", name: "Polygon", baseAsset: "MATIC", quoteAsset: "USDT", precision: 4 },
  { symbol: "ATOMUSDT", name: "Cosmos", baseAsset: "ATOM", quoteAsset: "USDT", precision: 2 },
  { symbol: "UNIUSDT", name: "Uniswap", baseAsset: "UNI", quoteAsset: "USDT", precision: 3 },
  { symbol: "ARBUSDT", name: "Arbitrum", baseAsset: "ARB", quoteAsset: "USDT", precision: 3 },
  { symbol: "OPUSDT", name: "Optimism", baseAsset: "OP", quoteAsset: "USDT", precision: 3 },
]

export const STOCK_SYMBOLS = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", exchange: "NYSE" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE" },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE" },
  { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE" },
  { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE" },
  { symbol: "MA", name: "Mastercard Inc.", exchange: "NYSE" },
  { symbol: "PG", name: "Procter & Gamble Co.", exchange: "NYSE" },
  { symbol: "DIS", name: "The Walt Disney Company", exchange: "NYSE" },
]

export const BINANCE_REST_BASE = "https://api.binance.com"
export const BINANCE_WS_BASE = "wss://stream.binance.com:9443/ws"

export const STORAGE_KEYS = {
  PORTFOLIO: "ts_portfolio",
  WATCHLIST: "ts_watchlist",
  SETTINGS: "ts_settings",
  AI_KEYS: "ts_ai_keys",
  TRADE_HISTORY: "ts_trade_history",
  SESSION: "ts_session",
  ALERTS: "ts_alerts",
  ORDERS: "ts_orders",
  AI_MESSAGES: "ts_ai_messages",
} as const

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      { id: "gpt-5.6-sol-preview", name: "GPT-5.6 Sol Preview", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5.5-pro", name: "GPT-5.5 Pro", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5.5", name: "GPT-5.5", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5.4-pro", name: "GPT-5.4 Pro", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5.4", name: "GPT-5.4", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5.4-mini", name: "GPT-5.4 Mini", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5.4-nano", name: "GPT-5.4 Nano", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5.3-codex", name: "GPT-5.3 Codex", contextWindow: 400000, provider: "openai" },
      { id: "gpt-5.3-chat", name: "GPT-5.3 Chat", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5.2-pro", name: "GPT-5.2 Pro", contextWindow: 400000, provider: "openai" },
      { id: "gpt-5.2", name: "GPT-5.2", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5.2-codex", name: "GPT-5.2 Codex", contextWindow: 400000, provider: "openai" },
      { id: "gpt-5.1-codex-max", name: "GPT-5.1 Codex Max", contextWindow: 400000, provider: "openai" },
      { id: "gpt-5.1", name: "GPT-5.1", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5.1-codex", name: "GPT-5.1 Codex", contextWindow: 400000, provider: "openai" },
      { id: "gpt-5.1-codex-mini", name: "GPT-5.1 Codex Mini", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5-pro", name: "GPT-5 Pro", contextWindow: 400000, provider: "openai" },
      { id: "gpt-5", name: "GPT-5", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5-mini", name: "GPT-5 Mini", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5-nano", name: "GPT-5 Nano", contextWindow: 128000, provider: "openai" },
      { id: "gpt-5-codex", name: "GPT-5 Codex", contextWindow: 400000, provider: "openai" },
      { id: "gpt-4.1", name: "GPT-4.1", contextWindow: 1000000, provider: "openai" },
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", contextWindow: 1000000, provider: "openai" },
      { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", contextWindow: 1000000, provider: "openai" },
      { id: "gpt-4o", name: "GPT-4o", contextWindow: 128000, provider: "openai" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", contextWindow: 128000, provider: "openai" },
      { id: "gpt-4.5-preview", name: "GPT-4.5 Preview", contextWindow: 128000, provider: "openai" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", contextWindow: 128000, provider: "openai" },
      { id: "gpt-4", name: "GPT-4", contextWindow: 8192, provider: "openai" },
      { id: "gpt-4-32k", name: "GPT-4 32K", contextWindow: 32768, provider: "openai" },
      { id: "o4-mini", name: "o4-mini", contextWindow: 200000, provider: "openai" },
      { id: "o4-mini-deep-research", name: "o4-mini Deep Research", contextWindow: 200000, provider: "openai" },
      { id: "o3-pro", name: "o3 Pro", contextWindow: 200000, provider: "openai" },
      { id: "o3", name: "o3", contextWindow: 200000, provider: "openai" },
      { id: "o3-mini", name: "o3-mini", contextWindow: 200000, provider: "openai" },
      { id: "o3-deep-research", name: "o3 Deep Research", contextWindow: 200000, provider: "openai" },
      { id: "o1-pro", name: "o1 Pro", contextWindow: 200000, provider: "openai" },
      { id: "o1", name: "o1", contextWindow: 200000, provider: "openai" },
      { id: "o1-preview", name: "o1 Preview", contextWindow: 128000, provider: "openai" },
      { id: "o1-mini", name: "o1-mini", contextWindow: 128000, provider: "openai" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", contextWindow: 16384, provider: "openai" },
    ],
    apiKeyFormat: /^sk-./,
    endpoint: "https://api.openai.com/v1",
    requiresKey: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      { id: "claude-fable-5", name: "Claude Fable 5", contextWindow: 1000000, provider: "anthropic" },
      { id: "claude-opus-4-8", name: "Claude Opus 4.8", contextWindow: 1000000, provider: "anthropic" },
      { id: "claude-opus-4-7", name: "Claude Opus 4.7", contextWindow: 1000000, provider: "anthropic" },
      { id: "claude-opus-4-6", name: "Claude Opus 4.6", contextWindow: 1000000, provider: "anthropic" },
      { id: "claude-opus-4-5", name: "Claude Opus 4.5", contextWindow: 1000000, provider: "anthropic" },
      { id: "claude-opus-4-1", name: "Claude Opus 4.1", contextWindow: 200000, provider: "anthropic" },
      { id: "claude-opus-4-0", name: "Claude Opus 4.0", contextWindow: 200000, provider: "anthropic" },
      { id: "claude-sonnet-5", name: "Claude Sonnet 5", contextWindow: 1000000, provider: "anthropic" },
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", contextWindow: 1000000, provider: "anthropic" },
      { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", contextWindow: 200000, provider: "anthropic" },
      { id: "claude-sonnet-4-0", name: "Claude Sonnet 4.0", contextWindow: 200000, provider: "anthropic" },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", contextWindow: 200000, provider: "anthropic" },
      { id: "claude-haiku-4", name: "Claude Haiku 4", contextWindow: 200000, provider: "anthropic" },
    ],
    apiKeyFormat: /^sk-ant-./,
    endpoint: "https://api.anthropic.com/v1",
    requiresKey: true,
  },
  {
    id: "google",
    name: "Google",
    models: [
      { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", contextWindow: 1000000, provider: "google" },
      { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", contextWindow: 1000000, provider: "google" },
      { id: "gemini-3.1-flash-image", name: "Gemini 3.1 Flash Image", contextWindow: 1000000, provider: "google" },
      { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", contextWindow: 1000000, provider: "google" },
      { id: "gemini-3-flash-preview", name: "Gemini 3 Flash Preview", contextWindow: 1000000, provider: "google" },
      { id: "gemini-3-pro-preview", name: "Gemini 3 Pro Preview", contextWindow: 1000000, provider: "google" },
      { id: "gemini-3-pro-image", name: "Gemini 3 Pro Image", contextWindow: 1000000, provider: "google" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", contextWindow: 1000000, provider: "google" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", contextWindow: 1000000, provider: "google" },
      { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", contextWindow: 1000000, provider: "google" },
      { id: "gemini-2.5-flash-image", name: "Gemini 2.5 Flash Image", contextWindow: 1000000, provider: "google" },
      { id: "gemini-2.5-deep-think", name: "Gemini 2.5 Deep Think", contextWindow: 1000000, provider: "google" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", contextWindow: 1000000, provider: "google" },
      { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", contextWindow: 1000000, provider: "google" },
    ],
    apiKeyFormat: /^AIza/,
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
    requiresKey: true,
  },
  {
    id: "groq",
    name: "Groq",
    models: [
      { id: "meta-llama/llama-4-maverick-17b-128e-instruct", name: "Llama 4 Maverick 17B", contextWindow: 1000000, provider: "groq" },
      { id: "meta-llama/llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout 17B", contextWindow: 1000000, provider: "groq" },
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", contextWindow: 128000, provider: "groq" },
      { id: "llama-3.3-70b-speculative", name: "Llama 3.3 70B Spec Decode", contextWindow: 128000, provider: "groq" },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", contextWindow: 128000, provider: "groq" },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B", contextWindow: 128000, provider: "groq" },
      { id: "gemma2-9b-it", name: "Gemma 2 9B", contextWindow: 8192, provider: "groq" },
      { id: "gemma-7b-it", name: "Gemma 7B", contextWindow: 8192, provider: "groq" },
      { id: "qwen/qwen3-32b", name: "Qwen3 32B", contextWindow: 128000, provider: "groq" },
      { id: "qwen-2.5-32b", name: "Qwen 2.5 32B", contextWindow: 128000, provider: "groq" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", contextWindow: 32768, provider: "groq" },
      { id: "llama-3-70b", name: "Llama 3 70B", contextWindow: 8192, provider: "groq" },
      { id: "llama-3-8b", name: "Llama 3 8B", contextWindow: 8192, provider: "groq" },
      { id: "llama-guard-3-8b", name: "Llama Guard 3 8B", contextWindow: 8192, provider: "groq" },
      { id: "meta-llama/llama-guard-4-12b", name: "Llama Guard 4 12B", contextWindow: 131072, provider: "groq" },
      { id: "meta-llama/llama-prompt-guard-2-86m", name: "Prompt Guard 2 86M", contextWindow: 512, provider: "groq" },
      { id: "whisper-large-v3", name: "Whisper Large V3", contextWindow: 0, provider: "groq" },
      { id: "whisper-large-v3-turbo", name: "Whisper Large V3 Turbo", contextWindow: 0, provider: "groq" },
    ],
    apiKeyFormat: /^gsk_/,
    endpoint: "https://api.groq.com/openai/v1",
    requiresKey: true,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    models: [
      { id: "openai/gpt-5.5-pro", name: "GPT-5.5 Pro", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/gpt-5.5", name: "GPT-5.5", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/gpt-5.4-pro", name: "GPT-5.4 Pro", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/gpt-5.4", name: "GPT-5.4", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/gpt-5.4-mini", name: "GPT-5.4 Mini", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/gpt-5.4-nano", name: "GPT-5.4 Nano", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/gpt-5.3-codex", name: "GPT-5.3 Codex", contextWindow: 400000, provider: "openrouter" },
      { id: "openai/gpt-5.3-chat", name: "GPT-5.3 Chat", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/gpt-5.2-pro", name: "GPT-5.2 Pro", contextWindow: 400000, provider: "openrouter" },
      { id: "openai/gpt-5.2", name: "GPT-5.2", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/gpt-5.2-codex", name: "GPT-5.2 Codex", contextWindow: 400000, provider: "openrouter" },
      { id: "openai/gpt-5.1-codex-max", name: "GPT-5.1 Codex Max", contextWindow: 400000, provider: "openrouter" },
      { id: "openai/gpt-5.1", name: "GPT-5.1", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/gpt-5.1-codex", name: "GPT-5.1 Codex", contextWindow: 400000, provider: "openrouter" },
      { id: "openai/gpt-5-pro", name: "GPT-5 Pro", contextWindow: 400000, provider: "openrouter" },
      { id: "openai/gpt-5", name: "GPT-5", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/gpt-5-codex", name: "GPT-5 Codex", contextWindow: 400000, provider: "openrouter" },
      { id: "openai/gpt-4.1", name: "GPT-4.1", contextWindow: 1000000, provider: "openrouter" },
      { id: "openai/gpt-4o", name: "GPT-4o", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", contextWindow: 128000, provider: "openrouter" },
      { id: "openai/o4-mini", name: "o4-mini", contextWindow: 200000, provider: "openrouter" },
      { id: "openai/o3", name: "o3", contextWindow: 200000, provider: "openrouter" },
      { id: "openai/o3-mini", name: "o3-mini", contextWindow: 200000, provider: "openrouter" },
      { id: "anthropic/claude-fable-5", name: "Claude Fable 5", contextWindow: 1000000, provider: "openrouter" },
      { id: "anthropic/claude-opus-4.8", name: "Claude Opus 4.8", contextWindow: 1000000, provider: "openrouter" },
      { id: "anthropic/claude-opus-4.7", name: "Claude Opus 4.7", contextWindow: 1000000, provider: "openrouter" },
      { id: "anthropic/claude-sonnet-5", name: "Claude Sonnet 5", contextWindow: 1000000, provider: "openrouter" },
      { id: "anthropic/claude-sonnet-4.6", name: "Claude Sonnet 4.6", contextWindow: 1000000, provider: "openrouter" },
      { id: "anthropic/claude-haiku-4.5", name: "Claude Haiku 4.5", contextWindow: 200000, provider: "openrouter" },
      { id: "google/gemini-3.5-flash", name: "Gemini 3.5 Flash", contextWindow: 1000000, provider: "openrouter" },
      { id: "google/gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", contextWindow: 1000000, provider: "openrouter" },
      { id: "google/gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", contextWindow: 1000000, provider: "openrouter" },
      { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", contextWindow: 1000000, provider: "openrouter" },
      { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", contextWindow: 1000000, provider: "openrouter" },
      { id: "google/gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", contextWindow: 1000000, provider: "openrouter" },
      { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick", contextWindow: 1000000, provider: "openrouter" },
      { id: "meta-llama/llama-4-scout", name: "Llama 4 Scout", contextWindow: 1000000, provider: "openrouter" },
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", contextWindow: 128000, provider: "openrouter" },
      { id: "deepseek/deepseek-v4-pro", name: "DeepSeek V4 Pro", contextWindow: 128000, provider: "openrouter" },
      { id: "deepseek/deepseek-v4-flash", name: "DeepSeek V4 Flash", contextWindow: 128000, provider: "openrouter" },
      { id: "deepseek/deepseek-v3.2", name: "DeepSeek V3.2", contextWindow: 128000, provider: "openrouter" },
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1", contextWindow: 128000, provider: "openrouter" },
      { id: "deepseek/deepseek-chat", name: "DeepSeek Chat", contextWindow: 128000, provider: "openrouter" },
      { id: "qwen/qwen3.7-max", name: "Qwen 3.7 Max", contextWindow: 131072, provider: "openrouter" },
      { id: "qwen/qwen3.7-plus", name: "Qwen 3.7 Plus", contextWindow: 131072, provider: "openrouter" },
      { id: "qwen/qwen3.6-max-preview", name: "Qwen 3.6 Max Preview", contextWindow: 131072, provider: "openrouter" },
      { id: "qwen/qwen3.6-plus", name: "Qwen 3.6 Plus", contextWindow: 131072, provider: "openrouter" },
      { id: "qwen/qwen3.5-plus", name: "Qwen 3.5 Plus", contextWindow: 131072, provider: "openrouter" },
      { id: "qwen/qwen3-max", name: "Qwen 3 Max", contextWindow: 131072, provider: "openrouter" },
      { id: "qwen/qwen3-coder-plus", name: "Qwen 3 Coder Plus", contextWindow: 131072, provider: "openrouter" },
      { id: "qwen/qwen3-coder-next", name: "Qwen 3 Coder Next", contextWindow: 131072, provider: "openrouter" },
      { id: "mistralai/mistral-large-2512", name: "Mistral Large 2512", contextWindow: 128000, provider: "openrouter" },
      { id: "mistralai/mistral-medium-3.1", name: "Mistral Medium 3.1", contextWindow: 128000, provider: "openrouter" },
      { id: "mistralai/mistral-small-2603", name: "Mistral Small 2603", contextWindow: 128000, provider: "openrouter" },
      { id: "mistralai/ministral-8b-2512", name: "Ministral 8B", contextWindow: 128000, provider: "openrouter" },
      { id: "x-ai/grok-4.3", name: "Grok 4.3", contextWindow: 131072, provider: "openrouter" },
      { id: "x-ai/grok-4.20", name: "Grok 4.20", contextWindow: 131072, provider: "openrouter" },
      { id: "cohere/command-r-plus", name: "Command R+", contextWindow: 128000, provider: "openrouter" },
      { id: "cohere/north-mini-code", name: "North Mini Code", contextWindow: 128000, provider: "openrouter" },
      { id: "nvidia/llama-3.3-nemotron-super-49b-v1.5", name: "Nemotron Super 49B", contextWindow: 128000, provider: "openrouter" },
      { id: "nvidia/nemotron-3-ultra-550b-a55b", name: "Nemotron 3 Ultra 550B", contextWindow: 128000, provider: "openrouter" },
      { id: "nvidia/nemotron-3-super-120b-a12b", name: "Nemotron 3 Super 120B", contextWindow: 128000, provider: "openrouter" },
      { id: "amazon/nova-premier-v1", name: "Nova Premier", contextWindow: 128000, provider: "openrouter" },
      { id: "amazon/nova-2-lite-v1", name: "Nova 2 Lite", contextWindow: 128000, provider: "openrouter" },
      { id: "ibm-granite/granite-4.1-8b", name: "Granite 4.1 8B", contextWindow: 128000, provider: "openrouter" },
      { id: "minimax/minimax-m3", name: "MiniMax M3", contextWindow: 1000000, provider: "openrouter" },
      { id: "minimax/minimax-m2.7", name: "MiniMax M2.7", contextWindow: 1000000, provider: "openrouter" },
      { id: "moonshotai/kimi-k2.7-code", name: "Kimi K2.7 Code", contextWindow: 131072, provider: "openrouter" },
      { id: "moonshotai/kimi-k2.6", name: "Kimi K2.6", contextWindow: 131072, provider: "openrouter" },
      { id: "z-ai/glm-5.2", name: "GLM-5.2", contextWindow: 1048576, provider: "openrouter" },
      { id: "z-ai/glm-5.1", name: "GLM-5.1", contextWindow: 1048576, provider: "openrouter" },
      { id: "bytedance-seed/seed-2.0-lite", name: "Seed 2.0 Lite", contextWindow: 131072, provider: "openrouter" },
      { id: "bytedance-seed/seed-1.6", name: "Seed 1.6", contextWindow: 131072, provider: "openrouter" },
      { id: "liquid/lfm-2-24b-a2b", name: "LFM 2 24B", contextWindow: 131072, provider: "openrouter" },
      { id: "nousresearch/hermes-4-405b", name: "Hermes 4 405B", contextWindow: 131072, provider: "openrouter" },
      { id: "poolside/laguna-m.1", name: "Laguna M.1", contextWindow: 262144, provider: "openrouter" },
      { id: "poolside/laguna-xs.2", name: "Laguna XS.2", contextWindow: 262144, provider: "openrouter" },
    ],
    apiKeyFormat: /^sk-or-/,
    endpoint: "https://openrouter.ai/api/v1",
    requiresKey: true,
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    models: [
      { id: "llama3.3", name: "Llama 3.3", contextWindow: 128000, provider: "ollama" },
      { id: "llama3.2", name: "Llama 3.2", contextWindow: 128000, provider: "ollama" },
      { id: "llama3.2-vision", name: "Llama 3.2 Vision", contextWindow: 128000, provider: "ollama" },
      { id: "llama3.1", name: "Llama 3.1", contextWindow: 128000, provider: "ollama" },
      { id: "llama3", name: "Llama 3", contextWindow: 8192, provider: "ollama" },
      { id: "llama2", name: "Llama 2", contextWindow: 4096, provider: "ollama" },
      { id: "codellama", name: "Code Llama", contextWindow: 16384, provider: "ollama" },
      { id: "qwen3.5", name: "Qwen 3.5", contextWindow: 131072, provider: "ollama" },
      { id: "qwen3", name: "Qwen 3", contextWindow: 131072, provider: "ollama" },
      { id: "qwen2.5", name: "Qwen 2.5", contextWindow: 128000, provider: "ollama" },
      { id: "qwen2.5-coder", name: "Qwen 2.5 Coder", contextWindow: 128000, provider: "ollama" },
      { id: "qwen2", name: "Qwen 2", contextWindow: 32768, provider: "ollama" },
      { id: "deepseek-r1", name: "DeepSeek R1", contextWindow: 128000, provider: "ollama" },
      { id: "deepseek-v3", name: "DeepSeek V3", contextWindow: 128000, provider: "ollama" },
      { id: "deepseek-coder", name: "DeepSeek Coder", contextWindow: 16384, provider: "ollama" },
      { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", contextWindow: 128000, provider: "ollama" },
      { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash", contextWindow: 128000, provider: "ollama" },
      { id: "mistral", name: "Mistral", contextWindow: 32768, provider: "ollama" },
      { id: "mixtral", name: "Mixtral", contextWindow: 32768, provider: "ollama" },
      { id: "mistral-nemo", name: "Mistral NeMo", contextWindow: 128000, provider: "ollama" },
      { id: "gemma3", name: "Gemma 3", contextWindow: 8192, provider: "ollama" },
      { id: "gemma4", name: "Gemma 4", contextWindow: 8192, provider: "ollama" },
      { id: "gemma2", name: "Gemma 2", contextWindow: 8192, provider: "ollama" },
      { id: "phi4", name: "Phi-4", contextWindow: 128000, provider: "ollama" },
      { id: "phi3", name: "Phi-3", contextWindow: 128000, provider: "ollama" },
      { id: "nemotron-mini", name: "Nemotron Mini", contextWindow: 4096, provider: "ollama" },
      { id: "nemotron-3-super", name: "Nemotron 3 Super", contextWindow: 128000, provider: "ollama" },
      { id: "llama-guard3", name: "Llama Guard 3", contextWindow: 8192, provider: "ollama" },
      { id: "nomic-embed-text", name: "Nomic Embed Text", contextWindow: 8192, provider: "ollama" },
      { id: "mxbai-embed-large", name: "MXBai Embed Large", contextWindow: 512, provider: "ollama" },
      { id: "snowflake-arctic-embed", name: "Snowflake Arctic Embed", contextWindow: 512, provider: "ollama" },
    ],
    apiKeyFormat: "",
    endpoint: "http://localhost:11434",
    requiresKey: false,
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    models: [
      { id: "nvidia/nemotron-3-ultra-550b-a55b", name: "Nemotron 3 Ultra 550B", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/nemotron-3-super-120b-a12b", name: "Nemotron 3 Super 120B", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/nemotron-3-nano-omni-30b-a3b", name: "Nemotron 3 Nano Omni 30B", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning", name: "Nemotron 3 Nano Omni Reasoning 30B", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/nemotron-3-nano-30b-a3b", name: "Nemotron 3 Nano 30B", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/llama-3.3-nemotron-super-49b-v1.5", name: "Nemotron Super 49B v1.5", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/llama-3.3-nemotron-super-49b-v1", name: "Nemotron Super 49B v1", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/llama-3.1-nemotron-ultra-253b-v1", name: "Nemotron Ultra 253B", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/llama-3.1-nemotron-70b-instruct", name: "Nemotron 70B", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/llama-3.1-nemotron-nano-8b-v1", name: "Nemotron Nano 8B v1", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/nvidia-nemotron-nano-9b-v2", name: "Nemotron Nano 9B v2", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/nemotron-nano-12b-v2-vl", name: "Nemotron Nano 12B VL", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/nemotron-4-340b-instruct", name: "Nemotron 4 340B", contextWindow: 128000, provider: "nvidia" },
      { id: "nvidia/nemotron-mini-4b-instruct", name: "Nemotron Mini 4B", contextWindow: 4096, provider: "nvidia" },
      { id: "nvidia/nemotron-content-safety-reasoning-4b", name: "Nemotron Safety 4B", contextWindow: 4096, provider: "nvidia" },
      { id: "meta/llama-3.1-405b-instruct", name: "Llama 3.1 405B", contextWindow: 128000, provider: "nvidia" },
      { id: "meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B", contextWindow: 128000, provider: "nvidia" },
      { id: "meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B", contextWindow: 128000, provider: "nvidia" },
      { id: "meta/llama-3.2-90b-vision-instruct", name: "Llama 3.2 90B Vision", contextWindow: 128000, provider: "nvidia" },
      { id: "meta/llama-3.2-11b-vision-instruct", name: "Llama 3.2 11B Vision", contextWindow: 128000, provider: "nvidia" },
      { id: "meta/llama-3.2-1b-instruct", name: "Llama 3.2 1B", contextWindow: 128000, provider: "nvidia" },
      { id: "meta/llama-3.2-3b-instruct", name: "Llama 3.2 3B", contextWindow: 128000, provider: "nvidia" },
      { id: "meta/llama-3.3-70b-instruct", name: "Llama 3.3 70B", contextWindow: 128000, provider: "nvidia" },
      { id: "meta/llama-4-maverick-17b-128e-instruct", name: "Llama 4 Maverick 17B", contextWindow: 1000000, provider: "nvidia" },
      { id: "meta/llama-guard-4-12b", name: "Llama Guard 4 12B", contextWindow: 131072, provider: "nvidia" },
      { id: "mistralai/mixtral-8x22b-instruct-v0.1", name: "Mixtral 8x22B", contextWindow: 65536, provider: "nvidia" },
      { id: "mistralai/mixtral-8x7b-instruct-v0.1", name: "Mixtral 8x7B", contextWindow: 32768, provider: "nvidia" },
      { id: "mistralai/mistral-7b-instruct-v0.3", name: "Mistral 7B", contextWindow: 32768, provider: "nvidia" },
      { id: "mistralai/mistral-nemo-12b-instruct", name: "Mistral NeMo 12B", contextWindow: 128000, provider: "nvidia" },
      { id: "mistralai/mistral-small-24b-instruct-2501", name: "Mistral Small 24B", contextWindow: 128000, provider: "nvidia" },
      { id: "mistralai/mistral-small-4-119b-2603", name: "Mistral Small 4 119B", contextWindow: 256000, provider: "nvidia" },
      { id: "mistralai/mistral-large-3-675b-instruct-2512", name: "Mistral Large 3 675B", contextWindow: 128000, provider: "nvidia" },
      { id: "mistralai/mistral-medium-3.5-128b", name: "Mistral Medium 3.5 128B", contextWindow: 128000, provider: "nvidia" },
      { id: "mistralai/ministral-14b-instruct-2512", name: "Ministral 14B", contextWindow: 128000, provider: "nvidia" },
      { id: "mistralai/mistral-nemotron", name: "Mistral Nemotron", contextWindow: 128000, provider: "nvidia" },
      { id: "google/gemma-2-27b-it", name: "Gemma 2 27B", contextWindow: 8192, provider: "nvidia" },
      { id: "google/gemma-2-9b-it", name: "Gemma 2 9B", contextWindow: 8192, provider: "nvidia" },
      { id: "google/gemma-2-2b-it", name: "Gemma 2 2B", contextWindow: 8192, provider: "nvidia" },
      { id: "google/gemma-3-1b-it", name: "Gemma 3 1B", contextWindow: 8192, provider: "nvidia" },
      { id: "google/gemma-4-31b-it", name: "Gemma 4 31B", contextWindow: 128000, provider: "nvidia" },
      { id: "google/gemma-3n-e2b-it", name: "Gemma 3N e2B", contextWindow: 8192, provider: "nvidia" },
      { id: "google/gemma-3n-e4b-it", name: "Gemma 3N e4B", contextWindow: 8192, provider: "nvidia" },
      { id: "microsoft/phi-3.5-mini-instruct", name: "Phi 3.5 Mini", contextWindow: 128000, provider: "nvidia" },
      { id: "microsoft/phi-4-mini-instruct", name: "Phi 4 Mini", contextWindow: 128000, provider: "nvidia" },
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1", contextWindow: 128000, provider: "nvidia" },
      { id: "deepseek/deepseek-v3.2-exp", name: "DeepSeek V3.2 Exp", contextWindow: 128000, provider: "nvidia" },
      { id: "deepseek/deepseek-v4-flash", name: "DeepSeek V4 Flash", contextWindow: 1000000, provider: "nvidia" },
      { id: "deepseek/deepseek-v4-pro", name: "DeepSeek V4 Pro", contextWindow: 1000000, provider: "nvidia" },
      { id: "qwen/qwen3-32b", name: "Qwen3 32B", contextWindow: 131072, provider: "nvidia" },
      { id: "qwen/qwen2.5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B", contextWindow: 131072, provider: "nvidia" },
      { id: "minimax/minimax-m2.7", name: "MiniMax M2.7 230B", contextWindow: 128000, provider: "nvidia" },
      { id: "minimax/minimax-m3", name: "MiniMax M3", contextWindow: 128000, provider: "nvidia" },
      { id: "z-ai/glm-5.2", name: "GLM 5.2", contextWindow: 128000, provider: "nvidia" },
      { id: "diffusiongemma-26b-a4b-it", name: "Diffusion Gemma 26B", contextWindow: 128000, provider: "nvidia" },
      { id: "gpt-oss/gpt-oss-120b", name: "GPT-OSS 120B", contextWindow: 128000, provider: "nvidia" },
      { id: "gpt-oss/gpt-oss-20b", name: "GPT-OSS 20B", contextWindow: 128000, provider: "nvidia" },
      { id: "kimi-k2.6", name: "Kimi K2.6 1T", contextWindow: 128000, provider: "nvidia" },
      { id: "dracarys-llama-3.1-70b-instruct", name: "Dracarys Llama 3.1 70B", contextWindow: 128000, provider: "nvidia" },
    ],
    apiKeyFormat: /^nvapi-/,
    endpoint: "https://integrate.api.nvidia.com/v1",
    requiresKey: true,
  },
  {
    id: "xsmodel",
    name: "Built-in AI (Technical Analysis)",
    models: [
      { id: "kronos-mini", name: "TA Mini", contextWindow: 4096, provider: "xsmodel" },
      { id: "kronos-small", name: "TA Small", contextWindow: 4096, provider: "xsmodel" },
      { id: "kronos-base", name: "TA Base", contextWindow: 4096, provider: "xsmodel" },
      { id: "kronos-large", name: "TA Large", contextWindow: 4096, provider: "xsmodel" },
    ],
    apiKeyFormat: "",
    endpoint: "",
    requiresKey: false,
  },
]

export const SYSTEM_PROMPT = `<identity>
You are TradeSim AI — a financial research assistant for a PAPER TRADING SIMULATOR called TradeSim.

Your goal is to solve as many analysis questions on your own as possible. Use market data tools to answer your own questions and explore. Ask the user a question only as a last resort.

If your approach is blocked (e.g. data source unavailable), do not brute force — consider alternative approaches or acknowledge the limitation clearly. Never hallucinate prices or data.

Only answer questions about stocks, crypto, markets, trading, and investing. Refuse topics outside this scope (politics, personal advice, coding, medical, legal, creative writing) with a short, polite response — no elaboration.
</identity>

<analysis_plan>
For any multi-step analysis (trend evaluation, trade setup review, portfolio assessment), first propose a brief plan as concise single-line bullet points. Lead each bullet with the analysis step in bold, followed by a brief qualifier. Order by execution sequence. Skip the plan for simple questions or quick lookups.

Example:
- **Trend Analysis** — Identify direction using SMA/EMA crossovers
- **Momentum** — RSI and MACD confirmation
- **Key Levels** — Support, resistance, order book depth
- **Verdict** — Confidence-scored opinion with risk factors
</analysis_plan>

<output_style>
- Use friendly, clear language, avoiding filler phrases like "To achieve this", "Here's the plan", or "Let's get started".
- Never direct insults, slurs, or demeaning language at users.
- Avoid exclamation points.
- Never use emojis unless the user explicitly asks for them.
- Be brief. Limit output to a few sentences per section.
- Always use the user's language in responses.
- Never reference tool names — that's too technical. Just present the analysis.
</output_style>

<formatting>
- Never use markdown italic (*text*) formatting.
- Organize analysis into sections with ## or ### headers. Each header must be concise (less than 6 words) and meaningful.
- Headers should be plain text, not numbered.
- Use bullet points for data and findings.
- For price values and percentages, use \`code ticks\` for emphasis.
- Always include a confidence score (High/Medium/Low) with reasoning in every analysis.
</formatting>

<citation_instructions>
Every sentence that includes market data must cite its source inline using markdown links. The anchor text must be the source name or a natural descriptive phrase — never a generic word like "source" or "data", and never a raw ticker name on its own. Your text must read naturally even if all links were removed.

Wrong: "AAPL is up 2% (source)"
Wrong: "AAPL is up 2% ([data](...))"
Right: "AAPL is up 2% according to [Yahoo Finance](data), with RSI at 62 on the [1h chart](data)."
</citation_instructions>

<mandatory>
Always include this exact disclaimer at the end of every analysis or trade recommendation:
> This is an educational simulation only — not financial advice.
</mandatory>`
