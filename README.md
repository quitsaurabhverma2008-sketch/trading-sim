# TradeSim — AI-Powered Paper Trading Simulator

> **Live Demo:** [https://xsdemo.vercel.app](https://xsdemo.vercel.app)

**TradeSim** is a free, web‑based AI‑powered crypto & stock paper‑trading simulator. Practice trading with **$10,000 virtual USD**, analyze markets with **real‑time charts**, and get AI‑powered research assistance — no API key needed for the built-in AI.

---

## Features

### Real-Time Trading Dashboard

| Feature | Description |
|---|---|
| **Live Charts** | Candlestick, Line, Area with Lightweight Charts v5. Volume pane, SMA/EMA/BB overlays |
| **Real-time WebSocket** | 440+ crypto symbols stream live tick-by-tick via Binance WebSocket |
| **Technical Indicators** | RSI (14), MACD (12/26/9), SMA (20), EMA (20), Bollinger Bands (20,2), ADX (14), OBV, ATR (14) |
| **Market Regime Detection** | Trending Up/Down, Ranging, Volatile — ADX + ATR based classification |
| **Candlestick Patterns** | Doji, Hammer, Shooting Star, Engulfing, Marubozu — auto-detected |
| **Chart Patterns** | Breakout/breakdown, Higher Lows, Lower Highs, Volatility Squeeze |
| **Order Book** | 15-level depth with 3s polling |
| **PnL Calculator** | Long/Short with entry/exit prices, position sizing |
| **Symbol Search** | 2000+ symbols (440+ crypto, 1500+ stocks) with real-time prices & percent change |
| **Timeframes** | 1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W |
| **Animated Price Ticker** | Scrolling ticker in header with top 15 crypto prices, pauses on hover |
| **3D Particle Background** | Interactive Three.js particle field with mouse parallax |
| **Animated UI** | Anime.js scroll-triggered reveals, animated counters, glass morphism cards |

### Paper Trading

- **$10,000 demo balance** — reset anytime
- Market, Limit & Stop-Loss orders
- **OrderPanel always visible** — buy/sell accessible immediately on dashboard
- **Quick Trade Bar** — persistent Buy 50% / Sell 50% buttons below the chart for one-click trading
- 25/50/75/100% quick position sizing
- Real-time unrealized & realized P&L tracking
- Filterable trade history with date/symbol/type/P&L columns
- Holdings table with average cost, market price, return %
- Performance metrics: Win Rate, Best/Worst Trade, Avg Trade, Equity Curve
- **Benchmark Comparison** — portfolio vs Bitcoin, Ethereum, S&P 500 (90d)
- **CSV Export** — download trade history as CSV

### AI Research Assistant — 9 Providers

**Bring Your Own Key** OR use the free **Built-in AI**:

| Provider | Key Required | Models |
|---|---|---|
| **Built-in AI** (xsmodel) | Free | TA Mini/Small/Base/Large — English + Hinglish + Prediction Card |
| **OpenAI** | Key | GPT-4o, GPT-4o-mini, o3, o4-mini |
| **Anthropic** | Key | Claude Opus 5, Claude Sonnet 5, Claude Haiku 4 |
| **Google** | Key | Gemini 2.5 Flash, Gemini 2.5 Pro |
| **Groq** | Key | Llama 4, Mixtral, Gemma 2 (fast inference) |
| **OpenRouter** | Key | 200+ models from all providers |
| **Ollama** | Free | Local models (Llama, Mistral, Qwen) |
| **NVIDIA** | Key | 32 models — Llama, Mistral, DeepSeek, Qwen, Gemma |
| **DeepSeek** | Key | DeepSeek V3 Chat, DeepSeek R1 Reasoner |

**AI Market Context Injection:** Every AI response automatically gets live quote + technical analysis injected as system context — works with ALL 9 providers without requiring function-calling support.

#### AI Features

| Feature | Description |
|---|---|
| **Multi-Agent Analysis** | 3 agents (Technical, Fundamental, Sentiment) run in parallel, 4th consolidates into final verdict |
| **AI Strategy Backtester** | 4 strategy templates (SMA Cross, RSI Reversal, MACD Cross, BB Bounce) + custom code. Simulates 500 candles with full P&L, win rate, Sharpe, max drawdown |
| **AI Trade Journal** | Log trades with strategy, emotions, rating. Stats dashboard + AI enrichment for pattern analysis |
| **Prediction Cards** | AI generates visual candle chart predictions — rendered inline as SVG with `FutureCandleChart` component |
| **Oververbosity Slider** | Brief / Normal / Detailed — controls AI response length |
| **8 Data Tools** | `get_historical_data`, `get_realtime_quote`, `get_technical_analysis`, `detect_patterns`, `detect_regime`, `compare_symbols`, `multi_timeframe_analysis`, `predict_next_candle` |

### Screeners & Market Overview

- **Technical Screener** — RSI, MACD crossover, MA cross, Bollinger Band breakout signals
- **Volume Screener** — Unusual volume spikes compared to 20-period SMA
- **Gainers & Losers** — Top/bottom 10 performers by 24h change
- **10-symbol table** with Price, Change, RSI, MACD, Volume, Signal, Regime columns
- **Social Sentiment Dashboard** — Sentiment scores (0-100), bullish/bearish/neutral gauge, simulated news feed with sentiment tags
- **Crypto Heatmap** — Market-cap sized bubbles colored by 24h performance

### Demo Mode

Visit **/demo** for instant access — auto-login with reset portfolio, no credentials needed.

### Alerts & Watchlist

- Price alerts with browser notifications (Web Notification API)
- Set alerts at specific price levels per symbol
- Star symbols to track favorites in the sidebar
- Real-time prices in watchlist sidebar
- Persisted across sessions via localStorage

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `g+d` | Dashboard |
| `g+p` | Portfolio |
| `g+w` | Watchlist |
| `g+s` | Screeners |
| `g+a` | AI |
| `g+b` | Backtest |
| `g+j` | Journal |
| `g+t` | Settings |
| `/` | Search symbols |
| `1`-`8` | Switch timeframes |
| `B` | Open AI assistant |
| `T` | Toggle order panel |
| `S` | Toggle sidebar |
| `?` | Show help |

---

## System Prompt Evolution

The AI system prompt evolved through **4 leaked prompt inspirations**:

| Iteration | Source | Key Additions |
|---|---|---|
| **v1** | Perplexity computer-use leak | XML structure (`<identity>`, `<analysis_plan>`, `<output_style>`), citation rules, disclaimer mandate |
| **v2** | Gemini 3.5 Flash Hinglish | Warm peer tone, simple indicator explanations |
| **v3** | Claude Fable 5 + Opus 4.8 leaks | `<default_stance>`, `<data_first>`, `<evenhandedness>`, `<legal_and_financial_advice>`, 5-section output, Prediction Card, no CoT leak |
| **v3.1** | DeepSeek R1 + GPT Codex patterns | `<tools_available>` section listing 7 tools, human-readable tool output |
| **v4.0** | Gemini 3.5 Flash + Claude Sonnet 5 | Warm adaptive tone, language mirroring, indicator explainers in rules, variety principle, "own it fix it continue" accountability |

### Bug Fixes (v4.1)

| Bug | Fix |
|---|---|
| Stock analysis via Built-in AI was broken (`JSON.parse` on markdown) | Replaced with direct `fetchStockCandles()` call |
| `xsdemo.vercel.app` pointing to old deployment | Domain re-assigned to latest production |
| Wrong TypeScript cast (`Record<string, never>`) | Fixed to `Record<string, Ticker24h>` + added missing import |
| `limit` param ignored in stock API | Added `candles.slice(-n)` support |
| Dead `useMemo` in FutureCandleChart | Removed unused computation block |
| SSR-unsafe `window.location.origin` | Guarded with `typeof window !== "undefined"` |
| OrderPanel started hidden | Default `orderPanelOpen: true` + persisted |
| No quick-access buy/sell | Added persistent `QuickTradeBar` below chart |

> See `src/lib/constants.ts:413` for the full prompt (560+ lines).

---

## Quick Start

```bash
git clone https://github.com/quitsaurabhverma2008-sketch/trading-sim.git
cd trading-sim
npm install
npm run dev
```

Visit **http://localhost:3000** → click **"Continue as Guest"** or visit **/demo**.

---

## AI Provider Setup

1. Go to **Dashboard → AI** (`/dashboard/ai`)
2. Open **Settings** (gear icon)
3. Select provider → enter API key → click **Test Connection**
4. Or select **Built-in AI** — works immediately, no key needed

> Keys are encrypted with Web Crypto AES‑GCM in localStorage. Never sent to any server.

### Provider Endpoints

| Provider | Endpoint | Key Format |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `sk-...` |
| Anthropic | `https://api.anthropic.com/v1` | `sk-ant-...` |
| Google | `https://generativelanguage.googleapis.com/v1beta` | `AIza...` |
| Groq | `https://api.groq.com/openai/v1` | `gsk_...` |
| OpenRouter | `https://openrouter.ai/api/v1` | `sk-or-...` |
| Ollama | `http://localhost:11434` | (none) |
| NVIDIA | `https://integrate.api.nvidia.com/v1` | `nvapi-...` |
| DeepSeek | `https://api.deepseek.com/v1` | `sk-...` |
| Built-in AI | (embedded) | (none) |

---

## Architecture

```
src/
├── app/
│   ├── api/ai/xsmodel/           # Built-in AI chat (SSE streaming) + prediction
│   ├── api/market/crypto/[symbol]# Crypto klines proxy
│   ├── api/market/stocks/[symbol] # Stock data via Yahoo
│   ├── api/market/symbols        # Symbol search list
│   ├── dashboard/                 # 9 dashboard pages
│   │   ├── ai/                   # AI chat + multi-agent analysis
│   │   ├── backtest/             # AI strategy backtester
│   │   ├── journal/              # AI trade journal
│   │   ├── portfolio/            # Portfolio + benchmarks + CSV export
│   │   ├── screeners/            # Technical/Volume/Sentiment screeners
│   │   ├── settings/             # User settings
│   │   └── watchlist/            # Watchlist management
│   ├── demo/                     # Demo mode (auto-login)
│   └── login/                    # Guest login page
├── components/
│   ├── ai/                       # AIChat, FutureCandleChart, MultiAgentAnalysis, AISettings
│   ├── chart/                    # TradingChart (AI button), OrderBook
│   ├── layout/                   # Header (price ticker), Sidebar, Disclaimer
│   ├── market/                   # SymbolSearch, Heatmap, Screeners, SentimentDashboard
│   ├── portfolio/                # PortfolioSummary, BenchmarkComparison, HoldingsTable
│   ├── three/                    # MarketParticles (3D particle bg), PriceGlobe (3D globe)
│   ├── trading/                  # OrderPanel, StrategyBacktester, TradeJournal, PnLCalculator
│   └── ui/                       # shadcn/ui v4 (@base-ui/react), AnimatedSection
├── hooks/                        # useMarketData, useRealtime, useBenchmarkData, useKeyboardShortcuts
├── lib/
│   ├── market/                   # binance.ts (WS+REST), stocks.ts (Yahoo), indicators.ts (28 funcs)
│   └── ai/                       # 9 providers, streaming chat, 8 market tools, system prompt v4.0
├── stores/                       # Zustand: portfolio, market, AI, UI, alerts, watchlist, trade, journal
└── types/                        # TypeScript: market, portfolio, AI, UI
```

### Data Flow

```
Browser ──── Binance API (direct CORS fetch) ──── Crypto prices, klines, WebSocket tickers
         ──── Vercel API Routes ──── Yahoo Finance ──── Stock data (1081 symbols)
         ──── /api/ai/xsmodel/chat ──── Built-in AI: analysis + Prediction Card (SSE)
         ──── /api/ai/xsmodel ──────── Trend + Momentum + Noise prediction model
         ──── localStorage (AES-GCM encrypted) ──── Portfolio, API keys, alerts, settings, journal
```

### Routes (17 total)

| Route | Type | Description |
|---|---|---|
| `/` | Static | Landing page |
| `/login` | Static | Guest login |
| `/demo` | Static | Demo mode (instant access) |
| `/dashboard` | Static | Main dashboard with navigation |
| `/dashboard/ai` | Static | AI research assistant + multi-agent |
| `/dashboard/backtest` | Static | AI strategy backtester |
| `/dashboard/journal` | Static | AI trade journal |
| `/dashboard/portfolio` | Static | Portfolio + benchmarks + CSV export |
| `/dashboard/screeners` | Static | Technical, volume & sentiment screeners |
| `/dashboard/settings` | Static | User settings |
| `/dashboard/watchlist` | Static | Watchlist management |
| `/api/ai/xsmodel` | Dynamic | Prediction endpoint |
| `/api/ai/xsmodel/chat` | Dynamic | SSE streaming chat |
| `/api/market/crypto/[symbol]` | Dynamic | Crypto klines |
| `/api/market/stocks/[symbol]` | Dynamic | Stock klines |
| `/api/market/symbols` | Dynamic | Symbol search |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16.2.10** | React framework (App Router) |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Utility-first styling |
| **shadcn/ui v4** | Component library (@base-ui/react, not Radix) |
| **Zustand 5** | State management + persist middleware |
| **Lightweight Charts v5** | High-performance candlestick charts |
| **Three.js** | 3D particle backgrounds, animated globe visualization |
| **Anime.js** | Scroll-triggered animations, animated number counters, message reveals |
| **Binance API** | Crypto data (direct browser CORS fetch) |
| **Yahoo Finance** | Stock data (server-side proxy via Vercel) |
| **Web Crypto API** | AES‑GCM encryption for API key storage |
| **SVG** | Prediction card chart rendering (FutureCandleChart) |

---

## Indicators Library

28+ technical analysis functions in `src/lib/market/indicators.ts`:

- `calcSMA`, `calcEMA`, `calcRSI`, `calcMACD`, `calcBollingerBands`
- `calcADX`, `calcOBV`, `calcAllIndicators`, `findSupportResistance`
- `calcATR` — Average True Range for volatility measurement
- `detectCandlestickPatterns` — Doji, Hammer, Shooting Star, Bullish/Bearish Engulfing, Marubozu
- `detectChartPatterns` — Breakout above resistance, Breakdown below support, Higher Lows, Lower Highs, Low Volatility Squeeze
- `detectMarketRegime` — ADX + ATR based: trending_up, trending_down, ranging, volatile

---

## Development

```bash
# Install
npm install

# Development
npm run dev

# Build
npm run build

# TypeScript check
npx tsc --noEmit
```

---

## Deployment

Auto-deployed to Vercel from `main` branch:

- **Main:** [https://xsdemo.vercel.app](https://xsdemo.vercel.app)

---

## Disclaimer

**Educational simulation only — not financial advice.** No real money. All trading is virtual. Data from Binance & Yahoo Finance for informational purposes only. Past performance does not guarantee future results. See `src/lib/constants.ts` for the full system prompt and legal disclaimer.
