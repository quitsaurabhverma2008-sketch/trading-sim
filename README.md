# TradeSim — AI-Powered Paper Trading Simulator

![Trading Dashboard](https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=1200&h=600&fit=crop)
> *AI-powered crypto & stock paper-trading simulator with real-time charts, virtual money, and a BYOK AI research assistant.*

## 🌟 Features

### 📊 Real-Time Trading Dashboard
- **Live candlestick charts** powered by Lightweight Charts v5 with volume pane, SMA/EMA overlays
- **Real-time prices** via Binance WebSocket for 440+ crypto pairs
- **Search 1500+ symbols** (440+ crypto from Binance API + 1081 stock symbols)
- **Technical indicators**: RSI, MACD, SMA, EMA, Bollinger Bands, ADX
- **Multiple timeframes**: 1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W

![Candlestick Chart](https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop)

### 💰 Paper Trading Engine
- **Demo balance**: $10,000 virtual USD to start
- **Order types**: Market, Limit, Stop-Loss orders
- **Quick sizing**: 25%, 50%, 75%, 100% position buttons
- **Real-time P&L tracking**: Unrealized/realized profit & loss
- **Trade history**: Filterable, searchable transaction log
- **Portfolio analytics**: Win rate, total trades, performance metrics

### 🤖 AI Research Assistant (BYOK)
- **Bring Your Own Key**: Use your own API keys for OpenAI, Anthropic, Google, Groq, OpenRouter, or Ollama
- **Never leaves your browser**: Keys stored in encrypted localStorage
- **Market-aware**: AI has access to real-time prices, historical data, and technical analysis
- **Streaming responses**: Real-time token-by-token AI responses
- **Customizable**: Provider selector, model picker, temperature/max-tokens sliders, system prompt editor

![AI Assistant](https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop)

### 📈 Screeners & Analysis
- **Crypto Heatmap**: Market-cap sized bubbles colored by 24h change
- **Gainers & Losers**: Top/bottom performers with volume screener
- **Technical Screener**: RSI, MACD crossover, MA golden/death cross, Bollinger Band breakout detection
- **News Feed**: Latest crypto/stock news with time-ago timestamps

### 🔔 Alerts & Watchlist
- **Price alerts**: Set "above/below" alerts with browser notifications
- **Personalized watchlist**: Star symbols to track your favorites
- **Real-time updates**: Live price changes in sidebar

### 🎨 UI/UX
- **Dark theme** by default with system theme support
- **Keyboard shortcuts**: `/` search, `B` AI panel, `T` Order panel, `S` Sidebar, `1-7` switch timeframes
- **Fully responsive**: Works on desktop and mobile
- **shadcn/ui v4** components with Tailwind CSS v4

![Portfolio View](https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&h=400&fit=crop)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/quitsaurabhverma2008-sketch/trading-sim.git
cd trading-sim

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Visit **http://localhost:3000** — click "Continue as Guest" to start trading immediately.

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   └── market/
│   │       ├── crypto/[symbol]/route.ts   # Binance proxy API
│   │       ├── stocks/[symbol]/route.ts   # Yahoo Finance proxy API
│   │       └── symbols/route.ts           # Symbol search API
│   ├── dashboard/
│   │   ├── page.tsx                       # Main trading dashboard
│   │   ├── portfolio/
│   │   ├── screeners/
│   │   ├── settings/
│   │   └── watchlist/
│   └── login/
├── components/
│   ├── ai/         # AI chat, settings, provider config
│   ├── chart/      # Lightweight Charts wrapper
│   ├── layout/     # Header, Sidebar, Disclaimer
│   ├── market/     # SymbolSearch, heatmap, screeners
│   ├── portfolio/  # Summary, holdings, metrics
│   ├── trading/    # Order panel, trade history
│   ├── ui/         # shadcn/ui components
│   └── watchlist/  # Alert modal
├── hooks/
│   ├── useRealtime.ts          # WebSocket + ticker polling
│   ├── useKeyboardShortcuts.ts # Global keyboard shortcuts
│   └── useAlertChecker.ts      # Price alert engine
├── lib/
│   ├── market/     # Binance client, stocks client, indicators
│   ├── ai/         # Provider handlers, chat service, tools
│   ├── storage.ts  # Encrypted localStorage + IndexedDB
│   └── constants.ts
├── stores/         # Zustand stores (portfolio, market, AI, UI, alerts, watchlist)
└── types/          # TypeScript type definitions
```

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
| **Binance API** | Crypto market data |
| **Yahoo Finance** | Stock market data |
| **Web Crypto API** | Encrypted localStorage |
| **IndexedDB** | Large data storage |

## 🔑 AI Provider Setup

1. Click the **AI** button (`B` key) in the dashboard header
2. Click the **gear icon** in the AI panel
3. Select your provider (OpenAI, Anthropic, Google, Groq, OpenRouter, or Ollama)
4. Enter your API key (stored locally, never sent to any server)
5. Click **Test Connection** to verify
6. Start chatting with your AI research assistant!

> **Note**: Ollama runs locally and doesn't require an API key.

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

The app is fully static-ready for Vercel deployment with pre-configured `vercel.json`.

## 📝 License

MIT — Educational use only. This is a **paper trading simulator**. No real money is involved. All trading is virtual.

## ⚠️ Disclaimer

**This is an educational simulation only — not financial advice.** Cryptocurrency and stock trading involves substantial risk. This platform is for learning and practice purposes only. No real money touches this platform. Data is provided by Binance and Yahoo Finance for informational purposes only.
