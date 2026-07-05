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
      { id: "gpt-4o", name: "GPT-4o", contextWindow: 128000, provider: "openai" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", contextWindow: 128000, provider: "openai" },
      { id: "o3-mini", name: "o3-mini", contextWindow: 200000, provider: "openai" },
    ],
    apiKeyFormat: /^sk-./,
    endpoint: "https://api.openai.com/v1",
    requiresKey: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", contextWindow: 200000, provider: "anthropic" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", contextWindow: 200000, provider: "anthropic" },
    ],
    apiKeyFormat: /^sk-ant-./,
    endpoint: "https://api.anthropic.com/v1",
    requiresKey: true,
  },
  {
    id: "google",
    name: "Google",
    models: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", contextWindow: 1000000, provider: "google" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", contextWindow: 1000000, provider: "google" },
    ],
    apiKeyFormat: /^AIza/,
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
    requiresKey: true,
  },
  {
    id: "groq",
    name: "Groq",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", contextWindow: 128000, provider: "groq" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", contextWindow: 32768, provider: "groq" },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 70B", contextWindow: 128000, provider: "groq" },
    ],
    apiKeyFormat: /^gsk_/,
    endpoint: "https://api.groq.com/openai/v1",
    requiresKey: true,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    models: [
      { id: "openai/gpt-4o", name: "GPT-4o", contextWindow: 128000, provider: "openrouter" },
      { id: "anthropic/claude-sonnet-4-20250514", name: "Claude Sonnet 4", contextWindow: 200000, provider: "openrouter" },
      { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", contextWindow: 1000000, provider: "openrouter" },
      { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick", contextWindow: 1000000, provider: "openrouter" },
      { id: "deepseek/deepseek-chat", name: "DeepSeek V3", contextWindow: 128000, provider: "openrouter" },
    ],
    apiKeyFormat: /^sk-or-/,
    endpoint: "https://openrouter.ai/api/v1",
    requiresKey: true,
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    models: [
      { id: "llama3.2", name: "Llama 3.2", contextWindow: 128000, provider: "ollama" },
      { id: "qwen2.5", name: "Qwen 2.5", contextWindow: 128000, provider: "ollama" },
      { id: "mistral", name: "Mistral", contextWindow: 32768, provider: "ollama" },
    ],
    apiKeyFormat: "",
    endpoint: "http://localhost:11434",
    requiresKey: false,
  },
]

export const SYSTEM_PROMPT = `You are a financial research assistant for a PAPER TRADING SIMULATOR called TradeSim.

STRICT RULES:
1. ONLY answer questions about stocks, crypto, markets, trading, and investing.
2. REFUSE topics outside this scope: politics, personal advice, coding, medical, legal, creative writing.
3. ALWAYS include this disclaimer in every analysis: "This is an educational simulation only — not financial advice."
4. Use ONLY real-time or historical market data provided to you — never hallucinate prices or data.
5. Cite data sources with timestamps when possible.
6. Provide confidence scores (High/Medium/Low) with reasoning.
7. When asked to analyze a trade, follow the research workflow: trend analysis → news/sentiment → fundamentals → confidence-scored opinion.
8. Be concise but thorough. Use bullet points for analysis.`
