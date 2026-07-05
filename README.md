# TradeSim — AI-Powered Paper Trading Simulator

> **Live Demo:** [https://xsdemo.vercel.app](https://xsdemo.vercel.app)

![Trading Dashboard](https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=1200&h=600&fit=crop)

**TradeSim** is a free, web‑based AI‑powered crypto & stock paper‑trading simulator. Practice trading with **$10,000 virtual USD**, analyze markets with **real‑time charts**, and get AI‑powered research assistance — no API key needed for the built-in AI.

---

## ✨ Features

### 📊 Real‑Time Trading Dashboard

| Feature | Description |
|---|---|
| **Live Charts** | Candlestick, Line, Area with Lightweight Charts v5 |
| **Real‑time WebSocket** | Klines update live with every tick |
| **Indicators** | RSI, MACD, SMA, EMA, Bollinger Bands, ADX, OBV |
| **Order Book** | 15-level depth with 3s polling |
| **PnL Calculator** | Long/Short with entry/exit prices |
| **Symbol Search** | 1500+ symbols (crypto + stocks) |
| **Timeframes** | 1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W |

![Candlestick Chart](https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop)

### 💰 Paper Trading

![Portfolio](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop)

- **$10,000 demo balance**
- Market, Limit & Stop-Loss orders
- 25/50/75/100% quick sizing
- Real-time unrealized & realized P&L
- Filterable trade history
- Holdings table with return %
- Win rate, total trades, best/worst metrics

### 🤖 AI Research Assistant

**8 providers** — Bring Your Own Key OR use the free Built-in AI:

| Provider | Key Required | Models |
|---|---|---|
| **Built-in AI** (TA) | ❌ Free | Technical Analysis (chart-aware) |
| **OpenAI** | ✅ | GPT-4o, GPT-4o-mini, o3, o4-mini |
| **Anthropic** | ✅ | Claude 3.5/4 Sonnet, Haiku |
| **Google** | ✅ | Gemini 2.0/2.5 Flash, Pro |
| **Groq** | ✅ | Llama 3, Mixtral, Gemma 2 |
| **OpenRouter** | ✅ | 200+ models |
| **NVIDIA** | ✅ | 50+ free NIM models |
| **Ollama** | ❌ Free | Local models |

![AI Chat](https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop)

**Built-in AI** — click the **AI** button on any chart to get instant technical analysis (RSI, MACD, trend, support/resistance) based on live chart data. No setup required.

### 📈 Screeners

![Screeners](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop)

- **Crypto Heatmap** — market-cap sized bubbles by 24h change
- **Gainers & Losers** — top/bottom performers + volume screener
- **Technical Screener** — RSI, MACD crossover, MA cross, BB breakout
- **News Feed** — latest stories via NewsAPI

### 🔔 Alerts & Watchlist

- Price alerts with browser notifications
- Star symbols to track favorites
- Real-time prices in sidebar

### ⌨️ Shortcuts

| Key | Action |
|---|---|
| `/` | Search symbols |
| `1`-`7` | Timeframes |
| `B` | AI page |
| `T` | Order panel |
| `S` | Sidebar |

---

## 🚀 Quick Start

```bash
git clone https://github.com/quitsaurabhverma2008-sketch/trading-sim.git
cd trading-sim
npm install
npm run dev
```

Visit **http://localhost:3000** → click **"Continue as Guest"**.

---

## 🔑 AI Provider Setup

1. Go to **Dashboard → AI** (`/dashboard/ai`)
2. Open **Settings** (gear icon)
3. Select provider → enter API key → **Test**
4. Or select **Built-in AI** — works immediately, no key needed

> Keys are encrypted with Web Crypto AES‑GCM in localStorage. Never sent to any server.

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/ai/xsmodel/       # Built-in AI chat + prediction
│   ├── api/market/           # Crypto, stocks, symbols
│   └── dashboard/            + login/
├── components/
│   ├── ai/                   # AIChat, AISettings
│   ├── chart/                # TradingChart (with AI button), OrderBook
│   ├── layout/               # Header, Sidebar, Disclaimer
│   ├── market/               # SymbolSearch, Heatmap, Screeners
│   ├── portfolio/            # Summary, Holdings, Metrics
│   ├── trading/              # OrderPanel, TradeHistory, PnLCalculator
│   └── ui/                   # shadcn/ui components
├── hooks/                    # useMarketData, useRealtime, useAlertChecker
├── lib/
│   ├── market/               # Binance WS/REST, Yahoo stocks, indicators
│   ├── ai/                   # 8 providers, streaming chat, market tools
│   └── storage.ts            # Encrypted localStorage
├── stores/                   # Zustand (portfolio, market, AI, UI, alerts, watchlist)
└── types/                    # TypeScript types
```

### Data Flow

```
Browser ─► Binance (CORS) ──► Crypto prices, klines, WebSocket
         ─► Vercel API ──────► Yahoo Finance ──► Stock data
         ─► /api/ai/xsmodel ─► Built-in AI analysis (indicators)
```

---

## ⚙️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16.2.10** | React framework (App Router) |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **shadcn/ui v4** | (@base-ui/react) |
| **Zustand 5** | State management + persist |
| **Lightweight Charts v5** | Candlestick charts |
| **Binance API** | Crypto data (direct CORS fetch) |
| **Yahoo Finance** | Stock data (server proxy) |
| **Web Crypto API** | AES‑GCM encrypted storage |

---

## 🌐 Deployment

Auto-deployed to Vercel from `main` branch:

- **https://xsdemo.vercel.app**
- **https://trading-simulator-nine.vercel.app**

---

## ⚠️ Disclaimer

**Educational simulation only — not financial advice.** No real money. All trading is virtual. Data from Binance & Yahoo Finance for informational purposes only.
