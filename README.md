# TradeSim — AI-Powered Paper Trading Simulator

> **Live Demo:** [https://xsdemo.vercel.app](https://xsdemo.vercel.app)

![Trading Dashboard](https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=1200&h=600&fit=crop)

**TradeSim** is a free, web‑based AI‑powered crypto & stock paper‑trading simulator. Practice trading with **$10,000 virtual USD**, analyze markets with **real‑time charts**, and get AI‑powered research assistance using **your own API keys** — all without spending a single real rupee.

---

## 🌟 Features

### 📊 Real‑Time Trading Dashboard
- **Live candlestick charts** powered by Lightweight Charts v5 (Candle/Line/Area styles)
- **Real‑time kline WebSocket** — candles update live with every new tick
- **Volume histogram**, SMA, EMA, Bollinger Bands overlays
- **Order Book** depth visualization (15 levels, 3s polling)
- **PnL Calculator** (Long/Short toggle, entry/exit, ROI)
- **Real‑time prices** via Binance WebSocket for 440+ crypto pairs
- **Search 1500+ symbols** (crypto + 1081 stocks)
- **Multiple timeframes**: 1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W
- **Technical indicators**: RSI, MACD, SMA, EMA, Bollinger Bands, ADX, OBV

![Candlestick Chart](https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop)

### 💰 Paper Trading Engine
- **$10,000 demo balance** to start
- **Order types**: Market, Limit, Stop-Loss
- **Quick sizing**: 25%, 50%, 75%, 100% buttons
- **Real‑time P&L**: Unrealized + realized profit/loss tracking
- **Trade history**: Filterable, searchable log
- **Holdings table** with current value & return %
- **Performance metrics**: Win rate, total trades, best/worst trade

### 🤖 AI Research Assistant (BYOK)
**Bring Your Own Key** — your API keys stay in your browser, encrypted.

- **7 providers**: OpenAI, Anthropic, Google, Groq, OpenRouter, NVIDIA, Ollama
- **234 models** to choose from
- **Auto‑market context** — when you ask about BTC, ETH, or any symbol, the AI automatically fetches live price + technical analysis (RSI, MACD, BB, support/resistance) and includes it in its response
- **Streaming responses** — token‑by‑token AI replies
- **Customizable**: Temperature, max tokens, system prompt editor
- **Test connection** button to verify your API key

**Example:** Ask *"What's happening with BTC right now?"* — the AI fetches real data and gives a live analysis.

### 📈 Screeners & Analysis
- **Crypto Heatmap** — market‑cap sized bubbles colored by 24h change
- **Gainers & Losers** — top/bottom performers with volume screener
- **Technical Screener** — RSI overbought/oversold, MACD crossover, MA golden/death cross, Bollinger Band breakout
- **News Feed** — latest crypto/stock news via NewsAPI

### 🔔 Alerts & Watchlist
- **Price alerts** — set "above/below" thresholds with browser notifications
- **Personalized watchlist** — star symbols to track favorites
- **Real‑time prices** in sidebar watchlist

### 🎨 UI/UX
- **Dark theme** default, system theme support
- **Keyboard shortcuts**: `/` search, `B` AI panel, `T` Order panel, `S` Sidebar, `1-7` timeframes
- **Fully responsive** — desktop & mobile
- **shadcn/ui v4** + **Tailwind CSS v4**

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/quitsaurabhverma2008-sketch/trading-sim.git
cd trading-sim

# Install
npm install

# Run
npm run dev
```

Visit **http://localhost:3000** — click **"Continue as Guest"** to start trading immediately.

---

## 🔑 AI Provider Setup

1. Go to **Dashboard → AI** (`/dashboard/ai`)
2. Open **Settings** (gear icon)
3. Select provider → enter API key → **Test Connection**
4. Start chatting — the AI auto‑fetches live market data

> Keys are encrypted with Web Crypto AES‑GCM and stored in localStorage. Never sent to any server.

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/market/           # API routes (crypto, stocks, symbols)
│   ├── dashboard/            # Dashboard, Portfolio, Watchlist, Screeners, AI, Settings
│   └── login/                # Login / Guest page
├── components/
│   ├── ai/                   # AIChat, AISettings
│   ├── chart/                # TradingChart, OrderBook
│   ├── layout/               # Header, Sidebar, Disclaimer
│   ├── market/               # SymbolSearch, Heatmap, Screeners
│   ├── portfolio/            # Summary, Holdings, Metrics
│   ├── trading/              # OrderPanel, TradeHistory, PnLCalculator
│   └── ui/                   # shadcn/ui components
├── hooks/
│   ├── useMarketData.ts      # REST + WebSocket kline data
│   ├── useRealtime.ts        # Ticker WebSocket + polling
│   └── useAlertChecker.ts    # Price alert engine
├── lib/
│   ├── market/               # Binance client, stock client, indicators
│   ├── ai/                   # Provider handlers, chat, tools (market context)
│   └── storage.ts            # Encrypted localStorage
├── stores/                   # Zustand (portfolio, market, AI, UI, alerts, watchlist)
└── types/                    # TypeScript types
```

---

## ⚙️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16.2.10** | React framework (App Router) |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **shadcn/ui v4** | Component library |
| **Zustand 5** | State management |
| **Lightweight Charts v5** | Candlestick charts |
| **Binance API** | Crypto market data + WebSocket |
| **Yahoo Finance** | Stock market data |
| **Web Crypto API** | AES‑GCM encrypted storage |
| **IndexedDB** | Large data storage |

---

## 🌐 Deployment

Auto‑deployed to Vercel from GitHub. Live at:
- **https://xsdemo.vercel.app** (primary)
- **https://tradesim-paper-trading.vercel.app** (alias)

---

## 📝 License

MIT — Educational use only. **Paper trading simulator.** No real money. All trading is virtual.

## ⚠️ Disclaimer

**This is an educational simulation only — not financial advice.** Cryptocurrency and stock trading involves substantial risk. This platform is for learning and practice purposes only. No real money touches this platform. Data is provided by Binance and Yahoo Finance for informational purposes only.
