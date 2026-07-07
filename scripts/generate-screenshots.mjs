import { writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "..", "public", "readme")
mkdirSync(OUT, { recursive: true })

const W = 1200
const H = 675

function bg() {
  return `<rect width="${W}" height="${H}" fill="#0d1117" rx="12"/>
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1f2e" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0.8"/>
    </linearGradient>
    <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <linearGradient id="gr" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <linearGradient id="gy" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g1)" rx="12"/>`
}

function bottomBar() {
  return `<rect x="0" y="${H-48}" width="${W}" height="48" fill="#161b22" opacity="0.9"/>
  <text x="24" y="${H-18}" fill="#8b949e" font-family="monospace" font-size="13">XS TRADER v2.0</text>
  <text x="250" y="${H-18}" fill="#8b949e" font-family="monospace" font-size="13">Paper Trading Simulator</text>
  <text x="${W-24}" y="${H-18}" fill="#8b949e" font-family="monospace" font-size="13" text-anchor="end">$10,000 Virtual Portfolio</text>`
}

function gridLines() {
  let lines = `<line x1="0" y1="100" x2="${W}" y2="100" stroke="#1f2937" stroke-width="0.5"/>
  <line x1="0" y1="200" x2="${W}" y2="200" stroke="#1f2937" stroke-width="0.5"/>
  <line x1="0" y1="300" x2="${W}" y2="300" stroke="#1f2937" stroke-width="0.5"/>
  <line x1="0" y1="400" x2="${W}" y2="400" stroke="#1f2937" stroke-width="0.5"/>
  <line x1="0" y1="500" x2="${W}" y2="500" stroke="#1f2937" stroke-width="0.5"/>`
  return lines
}

function glowCircle(cx, cy, r, color) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.15" filter="url(#blur)"/>`
}

const DATA = {
  price: 67452.80,
  change: 2.34,
  high: 68200,
  low: 65800,
}

function priceLine(y, label, value, color) {
  return `<text x="40" y="${y}" fill="#8b949e" font-family="monospace" font-size="14">${label}</text>
  <text x="200" y="${y}" fill="${color}" font-family="monospace" font-size="14" font-weight="bold">${value}</text>`
}

// ========== 1. HERO / DASHBOARD ==========
function heroSVG() {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${bg()}
  <defs>
    <filter id="blur"><feGaussianBlur stdDeviation="20"/></filter>
  </defs>
  ${glowCircle(200, 180, 80, "#22c55e")}
  ${glowCircle(600, 250, 60, "#eab308")}
  ${gridLines()}

  <text x="40" y="50" fill="#e6edf3" font-family="sans-serif" font-size="28" font-weight="bold">XS TRADER</text>
  <text x="40" y="78" fill="#8b949e" font-family="sans-serif" font-size="14">AI-Powered Paper Trading Simulator</text>

  <rect x="40" y="110" width="260" height="130" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="60" y="140" fill="#8b949e" font-family="monospace" font-size="12">PORTFOLIO VALUE</text>
  <text x="60" y="175" fill="#22c55e" font-family="monospace" font-size="32" font-weight="bold">$10,452.80</text>
  <text x="60" y="200" fill="#22c55e" font-family="monospace" font-size="14">+$452.80 (+4.53%)</text>
  <text x="220" y="200" fill="#8b949e" font-family="monospace" font-size="11">24h</text>

  <rect x="320" y="110" width="260" height="130" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="340" y="140" fill="#8b949e" font-family="monospace" font-size="12">OPEN POSITIONS</text>
  <text x="340" y="175" fill="#e6edf3" font-family="monospace" font-size="32" font-weight="bold">4</text>
  <text x="340" y="200" fill="#eab308" font-family="monospace" font-size="14">2 Profitable · 2 Losing</text>

  <rect x="600" y="110" width="260" height="130" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="620" y="140" fill="#8b949e" font-family="monospace" font-size="12">WIN RATE</text>
  <text x="620" y="175" fill="#22c55e" font-family="monospace" font-size="32" font-weight="bold">68.5%</text>
  <text x="620" y="200" fill="#8b949e" font-family="monospace" font-size="14">Total Trades: 124</text>

  <rect x="880" y="110" width="280" height="130" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="900" y="140" fill="#8b949e" font-family="monospace" font-size="12">BEST PERFORMER</text>
  <text x="900" y="175" fill="#22c55e" font-family="monospace" font-size="24" font-weight="bold">SOLUSDT</text>
  <text x="900" y="200" fill="#22c55e" font-family="monospace" font-size="14">+32.4%</text>

  <rect x="40" y="260" width="500" height="200" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="60" y="290" fill="#8b949e" font-family="monospace" font-size="12">EQUITY CURVE (Last 30 Days)</text>
  <polyline points="60,430 100,420 140,410 180,415 220,400 260,390 300,395 340,380 380,370 420,360 460,350 500,340" fill="none" stroke="#22c55e" stroke-width="2.5"/>
  <polyline points="60,440 100,435 140,430 180,432 220,425 260,420 300,422 340,415 380,410 420,405 460,400 500,395" fill="none" stroke="#22c55e" stroke-width="1" opacity="0.4"/>
  <polyline points="60,420 100,415 140,410 180,412 220,405 260,400 300,402 340,395 380,390 420,385 460,380 500,375" fill="none" stroke="#22c55e" stroke-width="1" opacity="0.4"/>
  <rect x="60" y="430" width="440" height="1" fill="#2d333b"/>
  <text x="60" y="452" fill="#8b949e" font-family="monospace" font-size="10">$9,800</text>
  <text x="240" y="452" fill="#8b949e" font-family="monospace" font-size="10">$10,150</text>
  <text x="460" y="452" fill="#8b949e" font-family="monospace" font-size="10">$10,452</text>

  <rect x="560" y="260" width="600" height="200" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="580" y="290" fill="#8b949e" font-family="monospace" font-size="12">HOLDINGS</text>
  <line x1="580" y1="302" x2="1140" y2="302" stroke="#2d333b" stroke-width="1"/>
  <text x="580" y="320" fill="#8b949e" font-family="monospace" font-size="11">SYMBOL</text>
  <text x="700" y="320" fill="#8b949e" font-family="monospace" font-size="11">QTY</text>
  <text x="800" y="320" fill="#8b949e" font-family="monospace" font-size="11">AVG</text>
  <text x="920" y="320" fill="#8b949e" font-family="monospace" font-size="11">MARKET</text>
  <text x="1040" y="320" fill="#8b949e" font-family="monospace" font-size="11">P&L</text>
  <line x1="580" y1="328" x2="1140" y2="328" stroke="#2d333b" stroke-width="0.5"/>

  <text x="580" y="350" fill="#e6edf3" font-family="monospace" font-size="13">BTCUSDT</text>
  <text x="700" y="350" fill="#e6edf3" font-family="monospace" font-size="13">0.15</text>
  <text x="800" y="350" fill="#e6edf3" font-family="monospace" font-size="13">64,200</text>
  <text x="920" y="350" fill="#22c55e" font-family="monospace" font-size="13">67,452</text>
  <text x="1040" y="350" fill="#22c55e" font-family="monospace" font-size="13">+$487.80</text>
  <line x1="580" y1="358" x2="1140" y2="358" stroke="#2d333b" stroke-width="0.3"/>

  <text x="580" y="378" fill="#e6edf3" font-family="monospace" font-size="13">ETHUSDT</text>
  <text x="700" y="378" fill="#e6edf3" font-family="monospace" font-size="13">2.50</text>
  <text x="800" y="378" fill="#e6edf3" font-family="monospace" font-size="13">3,120</text>
  <text x="920" y="378" fill="#ef4444" font-family="monospace" font-size="13">3,045</text>
  <text x="1040" y="378" fill="#ef4444" font-family="monospace" font-size="13">-$187.50</text>
  <line x1="580" y1="386" x2="1140" y2="386" stroke="#2d333b" stroke-width="0.3"/>

  <text x="580" y="406" fill="#e6edf3" font-family="monospace" font-size="13">SOLUSDT</text>
  <text x="700" y="406" fill="#e6edf3" font-family="monospace" font-size="13">8.00</text>
  <text x="800" y="406" fill="#e6edf3" font-family="monospace" font-size="13">142.50</text>
  <text x="920" y="406" fill="#22c55e" font-family="monospace" font-size="13">188.70</text>
  <text x="1040" y="406" fill="#22c55e" font-family="monospace" font-size="13">+$369.60</text>

  ${bottomBar()}
  </svg>`
}

// ========== 2. CHART ==========
function chartSVG() {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${bg()}
  <defs><filter id="blur2"><feGaussianBlur stdDeviation="4"/></filter></defs>

  <text x="40" y="50" fill="#e6edf3" font-family="sans-serif" font-size="22" font-weight="bold">BTCUSDT — Advanced Chart</text>
  <rect x="40" y="70" width="800" height="440" fill="#111827" rx="8" stroke="#2d333b" stroke-width="1"/>

  <!-- Chart grid -->
  <line x1="80" y1="120" x2="800" y2="120" stroke="#1f2937" stroke-width="0.5"/>
  <line x1="80" y1="180" x2="800" y2="180" stroke="#1f2937" stroke-width="0.5"/>
  <line x1="80" y1="240" x2="800" y2="240" stroke="#1f2937" stroke-width="0.5"/>
  <line x1="80" y1="300" x2="800" y2="300" stroke="#1f2937" stroke-width="0.5"/>
  <line x1="80" y1="360" x2="800" y2="360" stroke="#1f2937" stroke-width="0.5"/>
  <line x1="80" y1="420" x2="800" y2="420" stroke="#1f2937" stroke-width="0.5"/>

  <!-- Candlestick simulation -->
  <rect x="100" y="280" width="6" height="40" fill="#22c55e" rx="1"/>
  <rect x="120" y="300" width="6" height="30" fill="#ef4444" rx="1"/>
  <rect x="140" y="260" width="6" height="50" fill="#22c55e" rx="1"/>
  <rect x="160" y="290" width="6" height="25" fill="#ef4444" rx="1"/>
  <rect x="180" y="250" width="6" height="55" fill="#22c55e" rx="1"/>
  <rect x="200" y="270" width="6" height="35" fill="#22c55e" rx="1"/>
  <rect x="220" y="310" width="6" height="20" fill="#ef4444" rx="1"/>
  <rect x="240" y="240" width="6" height="60" fill="#22c55e" rx="1"/>
  <rect x="260" y="260" width="6" height="45" fill="#22c55e" rx="1"/>
  <rect x="280" y="280" width="6" height="35" fill="#ef4444" rx="1"/>
  <rect x="300" y="230" width="6" height="65" fill="#22c55e" rx="1"/>
  <rect x="320" y="250" width="6" height="50" fill="#22c55e" rx="1"/>
  <rect x="340" y="290" width="6" height="30" fill="#ef4444" rx="1"/>
  <rect x="360" y="270" width="6" height="40" fill="#ef4444" rx="1"/>
  <rect x="380" y="220" width="6" height="70" fill="#22c55e" rx="1"/>
  <rect x="400" y="240" width="6" height="55" fill="#22c55e" rx="1"/>
  <rect x="420" y="280" width="6" height="35" fill="#ef4444" rx="1"/>
  <rect x="440" y="260" width="6" height="45" fill="#22c55e" rx="1"/>
  <rect x="460" y="300" width="6" height="25" fill="#ef4444" rx="1"/>
  <rect x="480" y="250" width="6" height="50" fill="#22c55e" rx="1"/>

  <!-- SMA lines -->
  <polyline points="80,380 140,360 200,340 260,320 320,300 380,280 440,270 500,260 560,250 620,240 680,230 740,220 800,210" fill="none" stroke="#eab308" stroke-width="1.5" opacity="0.8"/>
  <polyline points="80,400 140,385 200,370 260,355 320,340 380,325 440,315 500,305 560,295 620,285 680,275 740,265 800,255" fill="none" stroke="#818cf8" stroke-width="1.5" opacity="0.8"/>

  <!-- Labels -->
  <text x="60" y="125" fill="#8b949e" font-family="monospace" font-size="10">68,500</text>
  <text x="60" y="185" fill="#8b949e" font-family="monospace" font-size="10">67,500</text>
  <text x="60" y="245" fill="#8b949e" font-family="monospace" font-size="10">66,500</text>
  <text x="60" y="305" fill="#8b949e" font-family="monospace" font-size="10">65,500</text>
  <text x="60" y="365" fill="#8b949e" font-family="monospace" font-size="10">64,500</text>
  <text x="60" y="425" fill="#8b949e" font-family="monospace" font-size="10">63,500</text>

  <!-- Volume bars -->
  <rect x="100" y="440" width="6" height="30" fill="#22c55e" opacity="0.3" rx="1"/>
  <rect x="120" y="450" width="6" height="20" fill="#ef4444" opacity="0.3" rx="1"/>
  <rect x="140" y="435" width="6" height="35" fill="#22c55e" opacity="0.3" rx="1"/>
  <rect x="160" y="455" width="6" height="15" fill="#ef4444" opacity="0.3" rx="1"/>
  <rect x="180" y="430" width="6" height="40" fill="#22c55e" opacity="0.3" rx="1"/>

  <!-- Toolbar -->
  <rect x="40" y="518" width="800" height="40" fill="#1a1f2e" rx="8" stroke="#2d333b" stroke-width="1"/>
  <rect x="60" y="528" width="50" height="22" fill="#1f2937" rx="4" stroke="#2d333b"/>
  <text x="72" y="543" fill="#8b949e" font-family="monospace" font-size="11">1m</text>
  <rect x="118" y="528" width="50" height="22" fill="#1f2937" rx="4" stroke="#2d333b"/>
  <text x="130" y="543" fill="#8b949e" font-family="monospace" font-size="11">5m</text>
  <rect x="176" y="528" width="50" height="22" fill="#1f2937" rx="4" stroke="#2d333b"/>
  <text x="188" y="543" fill="#8b949e" font-family="monospace" font-size="11">15m</text>
  <rect x="234" y="528" width="50" height="22" fill="#1f2937" rx="4" stroke="#2d333b"/>
  <text x="246" y="543" fill="#8b949e" font-family="monospace" font-size="11">1h</text>
  <rect x="292" y="528" width="50" height="22" fill="#2563eb" rx="4"/>
  <text x="304" y="543" fill="#fff" font-family="monospace" font-size="11" font-weight="bold">4h</text>
  <rect x="350" y="528" width="50" height="22" fill="#1f2937" rx="4" stroke="#2d333b"/>
  <text x="362" y="543" fill="#8b949e" font-family="monospace" font-size="11">1d</text>
  <rect x="408" y="528" width="50" height="22" fill="#1f2937" rx="4" stroke="#2d333b"/>
  <text x="420" y="543" fill="#8b949e" font-family="monospace" font-size="11">1w</text>

  <!-- Right sidebar - indicators panel -->
  <rect x="860" y="70" width="300" height="488" fill="#111827" rx="8" stroke="#2d333b" stroke-width="1"/>
  <text x="880" y="100" fill="#e6edf3" font-family="monospace" font-size="14" font-weight="bold">INDICATORS</text>
  <line x1="880" y1="110" x2="1140" y2="110" stroke="#2d333b" stroke-width="1"/>

  <text x="880" y="135" fill="#22c55e" font-family="monospace" font-size="13">RSI (14)</text>
  <text x="1050" y="135" fill="#22c55e" font-family="monospace" font-size="13" text-anchor="end">54.7</text>
  <rect x="880" y="143" width="240" height="4" fill="#1f2937" rx="2"/>
  <rect x="880" y="143" width="130" height="4" fill="#eab308" rx="2"/>

  <text x="880" y="168" fill="#eab308" font-family="monospace" font-size="13">MACD</text>
  <text x="1050" y="168" fill="#22c55e" font-family="monospace" font-size="13" text-anchor="end">+124.50</text>
  <text x="880" y="183" fill="#8b949e" font-family="monospace" font-size="11">Signal: -45.20</text>
  <text x="880" y="198" fill="#8b949e" font-family="monospace" font-size="11">Histogram: +169.70 (Bullish)</text>

  <text x="880" y="223" fill="#818cf8" font-family="monospace" font-size="13">SMA (20)</text>
  <text x="1050" y="223" fill="#818cf8" font-family="monospace" font-size="13" text-anchor="end">64,820</text>

  <text x="880" y="248" fill="#f472b6" font-family="monospace" font-size="13">EMA (20)</text>
  <text x="1050" y="248" fill="#f472b6" font-family="monospace" font-size="13" text-anchor="end">65,110</text>

  <text x="880" y="273" fill="#34d399" font-family="monospace" font-size="13">Bollinger Bands</text>
  <text x="880" y="290" fill="#8b949e" font-family="monospace" font-size="11">Upper: 69,840</text>
  <text x="880" y="305" fill="#8b949e" font-family="monospace" font-size="11">Middle: 64,820</text>
  <text x="880" y="320" fill="#8b949e" font-family="monospace" font-size="11">Lower: 59,800</text>

  <line x1="880" y1="335" x2="1140" y2="335" stroke="#2d333b" stroke-width="0.5"/>

  <text x="880" y="358" fill="#eab308" font-family="monospace" font-size="13">ADX (14)</text>
  <text x="1050" y="358" fill="#eab308" font-family="monospace" font-size="13" text-anchor="end">28.4</text>

  <text x="880" y="383" fill="#a78bfa" font-family="monospace" font-size="13">OBV</text>
  <text x="1050" y="383" fill="#a78bfa" font-family="monospace" font-size="13" text-anchor="end">+2.4M</text>

  <text x="880" y="408" fill="#f87171" font-family="monospace" font-size="13">ATR (14)</text>
  <text x="1050" y="408" fill="#f87171" font-family="monospace" font-size="13" text-anchor="end">1,245</text>

  <line x1="880" y1="425" x2="1140" y2="425" stroke="#2d333b" stroke-width="0.5"/>
  <text x="880" y="450" fill="#e6edf3" font-family="monospace" font-size="12" font-weight="bold">MARKET REGIME</text>
  <rect x="880" y="462" width="240" height="28" fill="#1a2e1a" rx="6"/>
  <text x="900" y="480" fill="#22c55e" font-family="monospace" font-size="12">Trending Up (Moderate)</text>

  <text x="880" y="510" fill="#e6edf3" font-family="monospace" font-size="12" font-weight="bold">DETECTED PATTERNS</text>
  <text x="880" y="530" fill="#8b949e" font-family="monospace" font-size="11">• Bullish Engulfing (strength 5/5)</text>
  <text x="880" y="545" fill="#8b949e" font-family="monospace" font-size="11">• Higher Lows Forming (strength 3/5)</text>

  ${bottomBar()}
  </svg>`
}

// ========== 3. AI CHAT ==========
function aiChatSVG() {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${bg()}
  <defs><filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter></defs>

  <text x="40" y="50" fill="#e6edf3" font-family="sans-serif" font-size="22" font-weight="bold">AI Research Assistant</text>
  <text x="40" y="78" fill="#8b949e" font-family="monospace" font-size="12">9 providers · BYOK · Streaming responses · Hinglish</text>

  <!-- Chat messages area -->
  <rect x="40" y="100" width="860" height="520" fill="#111827" rx="10" stroke="#2d333b" stroke-width="1"/>

  <!-- User message -->
  <rect x="340" y="120" width="540" height="50" fill="#2563eb" rx="10" opacity="0.9"/>
  <text x="360" y="140" fill="#93c5fd" font-family="monospace" font-size="11">You</text>
  <text x="360" y="158" fill="#fff" font-family="sans-serif" font-size="13">BTCUSDT ke current trend ke baare mein batao bhai</text>

  <!-- AI response -->
  <rect x="60" y="190" width="580" height="200" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="80" y="212" fill="#22c55e" font-family="monospace" font-size="11">XS Trader AI · 1h ago</text>

  <text x="80" y="235" fill="#e6edf3" font-family="sans-serif" font-size="13">Dekh bhai, BTCUSDT ka analysis karte hain:</text>
  <text x="80" y="258" fill="#eab308" font-family="monospace" font-size="13" font-weight="bold">1. Technical Analysis</text>
  <text x="80" y="278" fill="#e6edf3" font-family="sans-serif" font-size="13">• Current Price: $67,452 par trade kar raha hai</text>
  <text x="80" y="298" fill="#e6edf3" font-family="sans-serif" font-size="13">• RSI 54.7 — neutral zone mein hai, na overbought na</text>
  <text x="80" y="318" fill="#e6edf3" font-family="sans-serif" font-size="13">  oversold. Dono taraf movement possible hai.</text>
  <text x="80" y="338" fill="#e6edf3" font-family="sans-serif" font-size="13">• MACD positive hai +124.50, signal line upar cross</text>
  <text x="80" y="358" fill="#e6edf3" font-family="sans-serif" font-size="13">  kiya — thoda bullish momentum dikh raha hai</text>

  <!-- Prediction card -->
  <rect x="660" y="190" width="220" height="260" fill="#0d1117" rx="10" stroke="#2563eb" stroke-width="1.5"/>
  <rect x="660" y="190" width="220" height="28" fill="#1a2332" rx="10"/>
  <text x="680" y="210" fill="#2563eb" font-family="monospace" font-size="11" font-weight="bold">TRADE SETUP</text>
  <text x="680" y="235" fill="#8b949e" font-family="monospace" font-size="10">Market: BTCUSDT</text>
  <text x="680" y="252" fill="#8b949e" font-family="monospace" font-size="10">Timeframe: 4H</text>

  <text x="680" y="275" fill="#eab308" font-family="monospace" font-size="11">Trend: 🟡 Neutral</text>

  <text x="680" y="298" fill="#8b949e" font-family="monospace" font-size="10">Entry: $66,800 — $67,000</text>
  <text x="680" y="315" fill="#ef4444" font-family="monospace" font-size="10">SL: $65,200</text>
  <text x="680" y="332" fill="#22c55e" font-family="monospace" font-size="10">TP1: $68,500</text>
  <text x="680" y="349" fill="#22c55e" font-family="monospace" font-size="10">TP2: $69,800</text>

  <text x="680" y="372" fill="#8b949e" font-family="monospace" font-size="10">R:R: 1:2.5</text>
  <text x="680" y="392" fill="#eab308" font-family="monospace" font-size="10">Confidence: 65%</text>

  <line x1="680" y1="405" x2="860" y2="405" stroke="#2d333b" stroke-width="0.5"/>
  <text x="680" y="425" fill="#8b949e" font-family="monospace" font-size="10">Verdict: Wait for breakout</text>
  <text x="680" y="442" fill="#8b949e" font-family="monospace" font-size="10">confirmation</text>

  <!-- Disclaimer -->
  <text x="60" y="430" fill="#8b949e" font-family="monospace" font-size="11">⚠️ This is paper trading / educational simulation — not financial advice. DYOR.</text>

  <!-- Provider bar -->
  <rect x="60" y="460" width="700" height="36" fill="#1a1f2e" rx="8" stroke="#2d333b" stroke-width="1"/>
  <text x="80" y="483" fill="#8b949e" font-family="monospace" font-size="11">AI Provider:</text>
  <rect x="170" y="468" width="100" height="22" fill="#1f2937" rx="4"/>
  <text x="182" y="483" fill="#e6edf3" font-family="monospace" font-size="11">OpenAI</text>
  <text x="290" y="483" fill="#8b949e" font-family="monospace" font-size="11">Model:</text>
  <rect x="340" y="468" width="140" height="22" fill="#1f2937" rx="4"/>
  <text x="352" y="483" fill="#e6edf3" font-family="monospace" font-size="11">gpt-4o-mini</text>

  <!-- Input box -->
  <rect x="60" y="510" width="700" height="44" fill="#1a1f2e" rx="22" stroke="#2d333b" stroke-width="1"/>
  <text x="90" y="536" fill="#8b949e" font-family="monospace" font-size="13">Ask about any market...</text>
  <circle cx="730" cy="532" r="14" fill="#2563eb"/>
  <text x="730" y="537" fill="#fff" font-family="monospace" font-size="12" text-anchor="middle">→</text>

  <rect x="920" y="100" width="240" height="520" fill="#111827" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="940" y="125" fill="#e6edf3" font-family="monospace" font-size="12" font-weight="bold">MARKET CONTEXT</text>
  <line x1="940" y1="135" x2="1140" y2="135" stroke="#2d333b" stroke-width="1"/>

  <text x="940" y="158" fill="#8b949e" font-family="monospace" font-size="11">Active Symbol</text>
  <text x="940" y="175" fill="#e6edf3" font-family="monospace" font-size="14" font-weight="bold">BTCUSDT</text>
  <text x="1060" y="175" fill="#22c55e" font-family="monospace" font-size="14">+2.34%</text>

  <text x="940" y="200" fill="#8b949e" font-family="monospace" font-size="11">Price</text>
  <text x="940" y="218" fill="#e6edf3" font-family="monospace" font-size="16" font-weight="bold">$67,452.80</text>

  <line x1="940" y1="230" x2="1140" y2="230" stroke="#2d333b" stroke-width="0.5"/>

  <text x="940" y="253" fill="#8b949e" font-family="monospace" font-size="11">AI Providers</text>
  ${["OpenAI", "Anthropic", "Google", "Groq", "OpenRouter", "Ollama", "NVIDIA", "DeepSeek", "xsmodel"].map((p, i) => {
    const y = 275 + i * 24
    const isActive = p === "OpenAI"
    return `<rect x="940" y="${y}" width="200" height="20" fill="${isActive ? "#1a2332" : "transparent"}" rx="4"/>
    <circle cx="950" cy="${y+10}" r="4" fill="${isActive ? "#22c55e" : "#2d333b"}"/>
    <text x="964" y="${y+14}" fill="${isActive ? "#e6edf3" : "#8b949e"}" font-family="monospace" font-size="11">${p}</text>`
  }).join("\n")}

  ${bottomBar()}
  </svg>`
}

// ========== 4. SCREENERS ==========
function screenersSVG() {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${bg()}
  <text x="40" y="50" fill="#e6edf3" font-family="sans-serif" font-size="22" font-weight="bold">Market Screeners</text>
  <text x="40" y="78" fill="#8b949e" font-family="monospace" font-size="12">Technical Screener · Volume Screener · Gainers/Losers</text>

  <!-- Tabs -->
  <rect x="40" y="100" width="140" height="36" fill="#2563eb" rx="8"/>
  <text x="65" y="122" fill="#fff" font-family="monospace" font-size="13" font-weight="bold">Technical</text>
  <rect x="188" y="100" width="140" height="36" fill="#1a1f2e" rx="8" stroke="#2d333b"/>
  <text x="213" y="122" fill="#8b949e" font-family="monospace" font-size="13">Volume</text>
  <rect x="336" y="100" width="150" height="36" fill="#1a1f2e" rx="8" stroke="#2d333b"/>
  <text x="366" y="122" fill="#8b949e" font-family="monospace" font-size="13">Gainers/Losers</text>

  <rect x="40" y="145" width="1120" height="480" fill="#111827" rx="10" stroke="#2d333b" stroke-width="1"/>

  <!-- Table header -->
  <rect x="40" y="145" width="1120" height="36" fill="#1a1f2e" rx="10"/>
  <text x="70" y="168" fill="#8b949e" font-family="monospace" font-size="12">#</text>
  <text x="130" y="168" fill="#8b949e" font-family="monospace" font-size="12">SYMBOL</text>
  <text x="280" y="168" fill="#8b949e" font-family="monospace" font-size="12">PRICE</text>
  <text x="410" y="168" fill="#8b949e" font-family="monospace" font-size="12">CHANGE 24H</text>
  <text x="560" y="168" fill="#8b949e" font-family="monospace" font-size="12">RSI</text>
  <text x="670" y="168" fill="#8b949e" font-family="monospace" font-size="12">MACD</text>
  <text x="800" y="168" fill="#8b949e" font-family="monospace" font-size="12">VOLUME</text>
  <text x="950" y="168" fill="#8b949e" font-family="monospace" font-size="12">SIGNAL</text>
  <text x="1090" y="168" fill="#8b949e" font-family="monospace" font-size="12">REGIME</text>
  <line x1="60" y1="180" x2="1140" y2="180" stroke="#2d333b" stroke-width="0.5"/>

  ${[
    ["1", "BTCUSDT", "67,452", "+2.34%", "54.7", "+124.5", "28.4B", "Neutral", "Trending Up"],
    ["2", "ETHUSDT", "3,045", "-1.20%", "42.3", "-45.2", "15.2B", "Oversold", "Ranging"],
    ["3", "SOLUSDT", "188.70", "+5.68%", "62.1", "+89.3", "4.8B", "Bullish", "Trending Up"],
    ["4", "BNBUSDT", "578.20", "+0.85%", "48.9", "+12.4", "1.2B", "Neutral", "Ranging"],
    ["5", "XRPUSDT", "0.5245", "-0.32%", "45.6", "-3.8", "2.1B", "Neutral", "Ranging"],
    ["6", "ADAUSDT", "0.4580", "+1.75%", "52.3", "+8.2", "0.9B", "Neutral", "Trending Up"],
    ["7", "DOGEUSDT", "0.1245", "-2.10%", "38.7", "-15.6", "1.8B", "Oversold", "Trending Down"],
    ["8", "DOTUSDT", "7.82", "+3.45%", "58.2", "+22.1", "0.5B", "Bullish", "Trending Up"],
    ["9", "AVAXUSDT", "35.60", "+1.22%", "51.4", "+5.7", "0.7B", "Neutral", "Ranging"],
    ["10", "LINKUSDT", "14.85", "-0.95%", "44.8", "-4.2", "0.3B", "Neutral", "Ranging"],
  ].map(([rank, sym, price, chg, rsi, macd, vol, sig, regime], i) => {
    const y = 194 + i * 38
    const isGreen = chg.startsWith("+")
    const color = isGreen ? "#22c55e" : "#ef4444"
    return `<line x1="60" y1="${y+30}" x2="1140" y2="${y+30}" stroke="#1f2937" stroke-width="0.3"/>
    <text x="70" y="${y+20}" fill="#8b949e" font-family="monospace" font-size="12">${rank}</text>
    <text x="130" y="${y+20}" fill="#e6edf3" font-family="monospace" font-size="12" font-weight="bold">${sym}</text>
    <text x="280" y="${y+20}" fill="#e6edf3" font-family="monospace" font-size="12">$${price}</text>
    <text x="410" y="${y+20}" fill="${color}" font-family="monospace" font-size="12">${chg}</text>
    <text x="560" y="${y+20}" fill="#eab308" font-family="monospace" font-size="12">${rsi}</text>
    <text x="670" y="${y+20}" fill="${macd.startsWith("+") ? "#22c55e" : "#ef4444"}" font-family="monospace" font-size="12">${macd}</text>
    <text x="800" y="${y+20}" fill="#e6edf3" font-family="monospace" font-size="12">${vol}</text>
    <text x="950" y="${y+20}" fill="#a78bfa" font-family="monospace" font-size="12">${sig}</text>
    <text x="1090" y="${y+20}" fill="${regime === "Trending Up" ? "#22c55e" : regime === "Trending Down" ? "#ef4444" : "#eab308"}" font-family="monospace" font-size="12">${regime}</text>`
  }).join("\n")}

  ${bottomBar()}
  </svg>`
}

// ========== 5. HEATMAP ==========
function heatmapSVG() {
  const coins = [
    { sym: "BTC", pct: 2.34, size: 180 },
    { sym: "ETH", pct: -1.20, size: 140 },
    { sym: "SOL", pct: 5.68, size: 110 },
    { sym: "BNB", pct: 0.85, size: 100 },
    { sym: "XRP", pct: -0.32, size: 90 },
    { sym: "ADA", pct: 1.75, size: 85 },
    { sym: "DOGE", pct: -2.10, size: 80 },
    { sym: "DOT", pct: 3.45, size: 70 },
    { sym: "AVAX", pct: 1.22, size: 65 },
    { sym: "LINK", pct: -0.95, size: 60 },
    { sym: "MATIC", pct: 2.10, size: 55 },
    { sym: "ATOM", pct: -0.45, size: 50 },
    { sym: "UNI", pct: 0.30, size: 48 },
    { sym: "LTC", pct: -1.80, size: 45 },
    { sym: "FIL", pct: 4.20, size: 42 },
    { sym: "NEAR", pct: 3.10, size: 40 },
    { sym: "APT", pct: -0.60, size: 38 },
    { sym: "ARB", pct: 1.50, size: 36 },
    { sym: "OP", pct: -2.50, size: 34 },
    { sym: "SUI", pct: 6.80, size: 32 },
  ]

  const positions = [
    [40, 100], [250, 100], [460, 100], [670, 100], [880, 100],
    [40, 300], [250, 300], [460, 300], [670, 300], [880, 300],
    [40, 420], [250, 420], [460, 420], [670, 420], [880, 420],
    [40, 500], [250, 500], [460, 500], [670, 500], [880, 500],
  ]

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${bg()}
  <text x="40" y="50" fill="#e6edf3" font-family="sans-serif" font-size="22" font-weight="bold">Crypto Market Heatmap</text>
  <text x="40" y="78" fill="#8b949e" font-family="monospace" font-size="12">Real-time market overview · Green = Bullish · Red = Bearish · Size = Market Cap</text>

  ${coins.map((c, i) => {
    const [x, y] = positions[i]
    const w = c.size * 2.8
    const h = 60
    const isGreen = c.pct >= 0
    const intensity = Math.min(Math.abs(c.pct) / 10, 0.8)
    const r = isGreen ? Math.round(34 * (1 - intensity) + 22 * intensity) : Math.round(239 * intensity + 34 * (1 - intensity))
    const g = isGreen ? Math.round(197 * (1 - intensity) + 180 * intensity) : Math.round(68 * (1 - intensity) + 22 * intensity)
    const b = isGreen ? Math.round(94 * (1 - intensity) + 60 * intensity) : Math.round(68 * (1 - intensity) + 22 * intensity)
    const fill = isGreen ? `rgba(${r},${g},${b},0.85)` : `rgba(${r},${g},${b},0.85)`
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="6"/>
    <text x="${x+12}" y="${y+26}" fill="#fff" font-family="sans-serif" font-size="15" font-weight="bold">${c.sym}</text>
    <text x="${x+12}" y="${y+46}" fill="#fff" font-family="monospace" font-size="13" opacity="0.9">${c.pct >= 0 ? "+" : ""}${c.pct}%</text>`
  }).join("\n")}

  ${bottomBar()}
  </svg>`
}

// ========== 6. PORTFOLIO ==========
function portfolioSVG() {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${bg()}
  <defs><filter id="blur4"><feGaussianBlur stdDeviation="10"/></filter></defs>

  <text x="40" y="50" fill="#e6edf3" font-family="sans-serif" font-size="22" font-weight="bold">Portfolio Performance</text>
  <text x="40" y="78" fill="#8b949e" font-family="monospace" font-size="12">Track your paper trading performance · P&L · Win rate · Metrics</text>

  <!-- Stats cards -->
  <rect x="40" y="105" width="170" height="100" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="62" y="132" fill="#8b949e" font-family="monospace" font-size="11">TOTAL P&L</text>
  <text x="62" y="162" fill="#22c55e" font-family="monospace" font-size="24" font-weight="bold">+$452.80</text>
  <text x="62" y="182" fill="#22c55e" font-family="monospace" font-size="12">+4.53%</text>

  <rect x="230" y="105" width="170" height="100" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="252" y="132" fill="#8b949e" font-family="monospace" font-size="11">WIN RATE</text>
  <text x="252" y="162" fill="#eab308" font-family="monospace" font-size="24" font-weight="bold">68.5%</text>
  <text x="252" y="182" fill="#8b949e" font-family="monospace" font-size="12">85 Wins / 124 Total</text>

  <rect x="420" y="105" width="170" height="100" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="442" y="132" fill="#8b949e" font-family="monospace" font-size="11">BEST TRADE</text>
  <text x="442" y="162" fill="#22c55e" font-family="monospace" font-size="20" font-weight="bold">+$487.80</text>
  <text x="442" y="182" fill="#8b949e" font-family="monospace" font-size="12">BTCUSDT Long</text>

  <rect x="610" y="105" width="170" height="100" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="632" y="132" fill="#8b949e" font-family="monospace" font-size="11">WORST TRADE</text>
  <text x="632" y="162" fill="#ef4444" font-family="monospace" font-size="20" font-weight="bold">-$187.50</text>
  <text x="632" y="182" fill="#8b949e" font-family="monospace" font-size="12">ETHUSDT Long</text>

  <rect x="800" y="105" width="360" height="100" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="822" y="132" fill="#8b949e" font-family="monospace" font-size="11">AVERAGE TRADE</text>
  <text x="822" y="162" fill="#22c55e" font-family="monospace" font-size="20" font-weight="bold">+$3.65</text>
  <text x="822" y="182" fill="#8b949e" font-family="monospace" font-size="12">Avg Win: $24.80 · Avg Loss: -$12.40</text>

  <!-- Equity curve -->
  <rect x="40" y="220" width="740" height="200" fill="#111827" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="62" y="250" fill="#8b949e" font-family="monospace" font-size="12">EQUITY CURVE</text>
  <polyline points="60,390 100,385 140,375 180,370 220,365 260,355 300,348 340,340 380,335 420,325 460,318 500,310 540,305 580,298 620,290 660,285 700,280 740,275 780,268" fill="none" stroke="#22c55e" stroke-width="2.5"/>
  <rect x="60" y="400" width="720" height="1" fill="#2d333b"/>
  <text x="62" y="412" fill="#8b949e" font-family="monospace" font-size="10">$9,800</text>
  <text x="720" y="412" fill="#8b949e" font-family="monospace" font-size="10">$10,452</text>

  <!-- Recent trades -->
  <rect x="800" y="220" width="360" height="410" fill="#111827" rx="10" stroke="#2d333b" stroke-width="1"/>
  <text x="822" y="250" fill="#e6edf3" font-family="monospace" font-size="12" font-weight="bold">TRADE HISTORY</text>
  <line x1="822" y1="260" x2="1140" y2="260" stroke="#2d333b" stroke-width="1"/>

  <text x="822" y="282" fill="#8b949e" font-family="monospace" font-size="11">DATE</text>
  <text x="910" y="282" fill="#8b949e" font-family="monospace" font-size="11">SYMBOL</text>
  <text x="990" y="282" fill="#8b949e" font-family="monospace" font-size="11">TYPE</text>
  <text x="1070" y="282" fill="#8b949e" font-family="monospace" font-size="11">P&L</text>
  <line x1="822" y1="290" x2="1140" y2="290" stroke="#2d333b" stroke-width="0.5"/>

  ${[
    ["Jul 07", "BTCUSDT", "Long", "+$124.50", true],
    ["Jul 06", "SOLUSDT", "Long", "+$89.20", true],
    ["Jul 05", "ETHUSDT", "Long", "-$187.50", false],
    ["Jul 04", "BTCUSDT", "Short", "+$45.80", true],
    ["Jul 03", "DOGEUSDT", "Long", "-$32.10", false],
    ["Jul 02", "BNBUSDT", "Long", "+$12.40", true],
    ["Jul 01", "SOLUSDT", "Short", "+$56.30", true],
    ["Jun 30", "BTCUSDT", "Long", "-$78.20", false],
    ["Jun 29", "ADAUSDT", "Long", "+$33.10", true],
    ["Jun 28", "ETHUSDT", "Short", "+$22.80", true],
  ].map(([date, sym, type, pnl, isWin], i) => {
    const y = 302 + i * 28
    return `<line x1="822" y1="${y+22}" x2="1140" y2="${y+22}" stroke="#1f2937" stroke-width="0.3"/>
    <text x="822" y="${y+14}" fill="#8b949e" font-family="monospace" font-size="10">${date}</text>
    <text x="910" y="${y+14}" fill="#e6edf3" font-family="monospace" font-size="10">${sym}</text>
    <text x="990" y="${y+14}" fill="${type === "Long" ? "#22c55e" : "#ef4444"}" font-family="monospace" font-size="10">${type}</text>
    <text x="1070" y="${y+14}" fill="${isWin ? "#22c55e" : "#ef4444"}" font-family="monospace" font-size="10">${pnl}</text>`
  }).join("\n")}

  ${bottomBar()}
  </svg>`
}

// ========== 7. AI PROVIDERS ==========
function providersSVG() {
  const providers = [
    { name: "OpenAI", models: "GPT-4o, GPT-4o-mini, o3, o4-mini", color: "#10a37f", icon: "O" },
    { name: "Anthropic", models: "Claude Opus 5, Claude Sonnet 5, Claude Haiku 4", color: "#d97706", icon: "A" },
    { name: "Google", models: "Gemini 2.5 Flash, Gemini 2.5 Pro", color: "#4285f4", icon: "G" },
    { name: "Groq", models: "Llama 4, Mixtral, Gemma 2", color: "#f97316", icon: "G" },
    { name: "OpenRouter", models: "200+ models from all providers", color: "#8b5cf6", icon: "O" },
    { name: "Ollama", models: "Local models (Llama, Mistral, Qwen)", color: "#ec4899", icon: "O" },
    { name: "NVIDIA", models: "32 models (Llama, Mistral, DeepSeek, Qwen)", color: "#76b900", icon: "N" },
    { name: "DeepSeek", models: "DeepSeek V3 Chat, DeepSeek R1 Reasoner", color: "#4f46e5", icon: "D" },
    { name: "Built-in AI", models: "TA Mini/Small/Base/Large (free, no key)", color: "#22c55e", icon: "X" },
  ]

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${bg()}
  <text x="40" y="50" fill="#e6edf3" font-family="sans-serif" font-size="22" font-weight="bold">AI Providers — 9 Supported</text>
  <text x="40" y="78" fill="#8b949e" font-family="monospace" font-size="12">Bring Your Own Key · All major models · Streaming · Hinglish</text>

  <rect x="40" y="100" width="1120" height="520" fill="#111827" rx="10" stroke="#2d333b" stroke-width="1"/>

  ${providers.map((p, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = 60 + col * 360
    const y = 120 + row * 155
    return `<rect x="${x}" y="${y}" width="340" height="135" fill="#1a1f2e" rx="10" stroke="#2d333b" stroke-width="1"/>
    <circle cx="${x+28}" cy="${y+30}" r="16" fill={${p.color}}" opacity="0.2"/>
    <text x="${x+28}" y="${y+35}" fill="${p.color}" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">${p.icon}</text>
    <text x="${x+60}" y="${y+36}" fill="#e6edf3" font-family="sans-serif" font-size="16" font-weight="bold">${p.name}</text>
    <text x="${x+20}" y="${y+62}" fill="#8b949e" font-family="monospace" font-size="11">Models:</text>
    <text x="${x+20}" y="${y+82}" fill="#e6edf3" font-family="monospace" font-size="11">${p.models}</text>
    <text x="${x+20}" y="${y+108}" fill="#8b949e" font-family="monospace" font-size="10">${p.name === "Built-in AI" ? "✓ Free, no API key needed" : "🔑 API key required (encrypted storage)"}</text>`
  }).join("\n")}

  ${bottomBar()}
  </svg>`
}

// ========== 8. PREDICTION CARD ==========
function predictionCardSVG() {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${bg()}
  <defs><filter id="blur5"><feGaussianBlur stdDeviation="8"/></filter></defs>
  ${glowCircle(300, 200, 100, "#2563eb")}
  ${glowCircle(800, 300, 80, "#22c55e")}

  <text x="40" y="50" fill="#e6edf3" font-family="sans-serif" font-size="22" font-weight="bold">AI Prediction Card</text>
  <text x="40" y="78" fill="#8b949e" font-family="monospace" font-size="12">Every analysis ends with a structured trade setup card</text>

  <!-- Main card -->
  <rect x="80" y="105" width="540" height="520" fill="#111827" rx="16" stroke="#2563eb" stroke-width="2"/>
  <rect x="80" y="105" width="540" height="45" fill="#1a2332" rx="16"/>
  <rect x="80" y="130" width="540" height="20" fill="#1a2332"/>
  <text x="120" y="135" fill="#2563eb" font-family="monospace" font-size="14" font-weight="bold">TRADE SETUP / PREDICTION CARD</text>

  <text x="120" y="175" fill="#8b949e" font-family="monospace" font-size="12">Market</text>
  <text x="250" y="175" fill="#e6edf3" font-family="monospace" font-size="14">BTCUSDT</text>
  <text x="120" y="200" fill="#8b949e" font-family="monospace" font-size="12">Exchange</text>
  <text x="250" y="200" fill="#e6edf3" font-family="monospace" font-size="14">Binance</text>
  <text x="120" y="225" fill="#8b949e" font-family="monospace" font-size="12">Timeframe</text>
  <text x="250" y="225" fill="#e6edf3" font-family="monospace" font-size="14">4H</text>

  <line x1="120" y1="245" x2="580" y2="245" stroke="#2d333b" stroke-width="1"/>

  <text x="120" y="275" fill="#8b949e" font-family="monospace" font-size="12">Trend</text>
  <rect x="250" y="260" width="100" height="24" fill="#3a2e00" rx="12"/>
  <text x="265" y="277" fill="#eab308" font-family="monospace" font-size="12">🟡 Neutral</text>

  <line x1="120" y1="300" x2="580" y2="300" stroke="#2d333b" stroke-width="1"/>

  <text x="120" y="325" fill="#8b949e" font-family="monospace" font-size="12" font-weight="bold">Indicators</text>
  <text x="120" y="350" fill="#e6edf3" font-family="monospace" font-size="12">RSI: 54.7 (Neutral sentiment)</text>
  <text x="120" y="372" fill="#e6edf3" font-family="monospace" font-size="12">MACD: +124.50 (Bullish)</text>
  <text x="120" y="394" fill="#e6edf3" font-family="monospace" font-size="12">20 SMA: Price Above ($64,820)</text>
  <text x="120" y="416" fill="#e6edf3" font-family="monospace" font-size="12">Key Level: $66,800 (Support)</text>

  <text x="120" y="445" fill="#8b949e" font-family="monospace" font-size="12">Market Structure</text>
  <text x="270" y="445" fill="#e6edf3" font-family="monospace" font-size="12">Higher High — Higher Low (Uptrend)</text>

  <text x="120" y="472" fill="#8b949e" font-family="monospace" font-size="12">Key Levels</text>
  <text x="270" y="472" fill="#22c55e" font-family="monospace" font-size="12">Support: $65,200</text>
  <text x="420" y="472" fill="#ef4444" font-family="monospace" font-size="12">Resistance: $68,500</text>

  <line x1="120" y1="490" x2="580" y2="490" stroke="#2d333b" stroke-width="1"/>

  <text x="120" y="515" fill="#8b949e" font-family="monospace" font-size="12">Trading Plan</text>
  <text x="120" y="538" fill="#e6edf3" font-family="monospace" font-size="12">Entry: $66,800 — $67,000</text>
  <text x="120" y="558" fill="#ef4444" font-family="monospace" font-size="12">Stop Loss: $65,200</text>
  <text x="120" y="578" fill="#22c55e" font-family="monospace" font-size="12">Take Profit 1: $68,500</text>
  <text x="120" y="598" fill="#22c55e" font-family="monospace" font-size="12">Take Profit 2: $69,800</text>

  <!-- Right side details -->
  <rect x="680" y="105" width="480" height="520" fill="#111827" rx="16" stroke="#2d333b" stroke-width="1"/>

  <text x="720" y="145" fill="#8b949e" font-family="monospace" font-size="12">RISK:REWARD</text>
  <rect x="720" y="155" width="200" height="40" fill="#1a2e1a" rx="8"/>
  <text x="760" y="182" fill="#22c55e" font-family="monospace" font-size="24" font-weight="bold">1:2.5</text>

  <text x="720" y="225" fill="#8b949e" font-family="monospace" font-size="12">CONFIDENCE</text>
  <rect x="720" y="240" width="400" height="16" fill="#1f2937" rx="8"/>
  <rect x="720" y="240" width="260" height="16" fill="#eab308" rx="8"/>
  <text x="760" y="275" fill="#eab308" font-family="monospace" font-size="16" font-weight="bold">65%</text>

  <line x1="720" y1="300" x2="1120" y2="300" stroke="#2d333b" stroke-width="1"/>

  <text x="720" y="330" fill="#8b949e" font-family="monospace" font-size="12">REASON</text>
  <text x="720" y="355" fill="#e6edf3" font-family="sans-serif" font-size="12">Price 20 SMA ke upar hai, MACD positive hai,</text>
  <text x="720" y="375" fill="#e6edf3" font-family="sans-serif" font-size="12">RSI neutral zone mein hai. Support $65,200</text>
  <text x="720" y="395" fill="#e6edf3" font-family="sans-serif" font-size="12">hold kar raha hai. Breakout confirmation</text>
  <text x="720" y="415" fill="#e6edf3" font-family="sans-serif" font-size="12">ke baad long entry logical lagti hai.</text>

  <line x1="720" y1="435" x2="1120" y2="435" stroke="#2d333b" stroke-width="1"/>

  <text x="720" y="465" fill="#8b949e" font-family="monospace" font-size="12">VERDICT</text>
  <rect x="720" y="478" width="400" height="36" fill="#1a2332" rx="8" stroke="#2563eb" stroke-width="1"/>
  <text x="740" y="500" fill="#2563eb" font-family="sans-serif" font-size="13">Wait for confirmation before entering long</text>

  <line x1="720" y1="530" x2="1120" y2="530" stroke="#2d333b" stroke-width="1"/>

  <text x="720" y="555" fill="#8b949e" font-family="monospace" font-size="11">⚠️ This is paper trading / educational</text>
  <text x="720" y="575" fill="#8b949e" font-family="monospace" font-size="11">simulation — not financial advice. DYOR.</text>

  ${bottomBar()}
  </svg>`
}

// ========== 9. ARCHITECTURE ==========
function architectureSVG() {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${bg()}
  <text x="40" y="50" fill="#e6edf3" font-family="sans-serif" font-size="22" font-weight="bold">System Architecture</text>
  <text x="40" y="78" fill="#8b949e" font-family="monospace" font-size="12">Next.js 16 Monolith · 14 Routes · 9 AI Providers · 2 Data Sources</text>

  <!-- Client box -->
  <rect x="80" y="110" width="280" height="120" fill="#1a1f2e" rx="12" stroke="#2563eb" stroke-width="1.5"/>
  <text x="120" y="140" fill="#2563eb" font-family="sans-serif" font-size="14" font-weight="bold">Client Browser</text>
  <text x="100" y="165" fill="#8b949e" font-family="monospace" font-size="11">• React 19 / Tailwind v4</text>
  <text x="100" y="182" fill="#8b949e" font-family="monospace" font-size="11">• Lightweight Charts v5</text>
  <text x="100" y="199" fill="#8b949e" font-family="monospace" font-size="11">• Zustand Stores</text>
  <text x="100" y="216" fill="#8b949e" font-family="monospace" font-size="11">• Web Crypto Encryption</text>

  <!-- Arrow -->
  <line x1="360" y1="170" x2="430" y2="170" stroke="#22c55e" stroke-width="2" stroke-dasharray="6,3"/>
  <polygon points="430,165 445,170 430,175" fill="#22c55e"/>

  <!-- Vercel box -->
  <rect x="450" y="110" width="300" height="120" fill="#1a1f2e" rx="12" stroke="#22c55e" stroke-width="1.5"/>
  <text x="490" y="140" fill="#22c55e" font-family="sans-serif" font-size="14" font-weight="bold">Vercel (Edge/Serverless)</text>
  <text x="470" y="165" fill="#8b949e" font-family="monospace" font-size="11">• Next.js 16 API Routes</text>
  <text x="470" y="182" fill="#8b949e" font-family="monospace" font-size="11">• Built-in AI (xsmodel)</text>
  <text x="470" y="199" fill="#8b949e" font-family="monospace" font-size="11">• Stock Proxy API</text>
  <text x="470" y="216" fill="#8b949e" font-family="monospace" font-size="11">• SSE Streaming</text>

  <!-- Arrow down -->
  <line x1="600" y1="230" x2="600" y2="290" stroke="#eab308" stroke-width="2"/>
  <polygon points="595,290 600,305 605,290" fill="#eab308"/>

  <!-- Data sources row -->
  <rect x="80" y="310" width="440" height="100" fill="#1a1f2e" rx="12" stroke="#eab308" stroke-width="1.5"/>
  <text x="120" y="340" fill="#eab308" font-family="sans-serif" font-size="14" font-weight="bold">Data Sources</text>
  <rect x="100" y="355" width="190" height="40" fill="#1f2937" rx="8" stroke="#2d333b"/>
  <text x="120" y="380" fill="#f97316" font-family="monospace" font-size="11">Binance API (Crypto)</text>
  <rect x="310" y="355" width="190" height="40" fill="#1f2937" rx="8" stroke="#2d333b"/>
  <text x="330" y="380" fill="#4285f4" font-family="monospace" font-size="11">Yahoo Finance (Stocks)</text>

  <!-- Arrow right -->
  <line x1="520" y1="360" x2="580" y2="360" stroke="#eab308" stroke-width="2" stroke-dasharray="6,3"/>
  <polygon points="580,355 595,360 580,365" fill="#eab308"/>

  <!-- Storage box -->
  <rect x="600" y="310" width="280" height="100" fill="#1a1f2e" rx="12" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="640" y="340" fill="#a78bfa" font-family="sans-serif" font-size="14" font-weight="bold">Client Storage</text>
  <text x="620" y="365" fill="#8b949e" font-family="monospace" font-size="11">• Encrypted localStorage</text>
  <text x="620" y="382" fill="#8b949e" font-family="monospace" font-size="11">• Zustand Persist</text>
  <text x="620" y="399" fill="#8b949e" font-family="monospace" font-size="11">• No Database Required</text>

  <!-- AI Providers row -->
  <rect x="80" y="440" width="1120" height="80" fill="#1a1f2e" rx="12" stroke="#22c55e" stroke-width="1.5"/>
  <text x="120" y="470" fill="#22c55e" font-family="sans-serif" font-size="14" font-weight="bold">AI Providers</text>
  <rect x="240" y="455" width="110" height="30" fill="#0d1117" rx="6" stroke="#10a37f"/>
  <text x="260" y="475" fill="#10a37f" font-family="monospace" font-size="10">OpenAI</text>
  <rect x="360" y="455" width="110" height="30" fill="#0d1117" rx="6" stroke="#d97706"/>
  <text x="380" y="475" fill="#d97706" font-family="monospace" font-size="10">Anthropic</text>
  <rect x="480" y="455" width="110" height="30" fill="#0d1117" rx="6" stroke="#4285f4"/>
  <text x="500" y="475" fill="#4285f4" font-family="monospace" font-size="10">Google</text>
  <rect x="600" y="455" width="90" height="30" fill="#0d1117" rx="6" stroke="#f97316"/>
  <text x="618" y="475" fill="#f97316" font-family="monospace" font-size="10">Groq</text>
  <rect x="700" y="455" width="120" height="30" fill="#0d1117" rx="6" stroke="#8b5cf6"/>
  <text x="718" y="475" fill="#8b5cf6" font-family="monospace" font-size="10">OpenRouter</text>
  <rect x="830" y="455" width="90" height="30" fill="#0d1117" rx="6" stroke="#ec4899"/>
  <text x="848" y="475" fill="#ec4899" font-family="monospace" font-size="10">Ollama</text>
  <rect x="930" y="455" width="90" height="30" fill="#0d1117" rx="6" stroke="#76b900"/>
  <text x="948" y="475" fill="#76b900" font-family="monospace" font-size="10">NVIDIA</text>
  <rect x="1030" y="455" width="100" height="30" fill="#0d1117" rx="6" stroke="#4f46e5"/>
  <text x="1048" y="475" fill="#4f46e5" font-family="monospace" font-size="10">DeepSeek</text>
  <rect x="1140" y="455" width="100" height="30" fill="#0d1117" rx="6" stroke="#22c55e"/>
  <text x="1158" y="475" fill="#22c55e" font-family="monospace" font-size="10">Built-in AI</text>

  <!-- Data flow arrows -->
  <line x1="220" y1="230" x2="220" y2="310" stroke="#8b949e" stroke-width="1" stroke-dasharray="4,2"/>
  <line x1="220" y1="310" x2="195" y2="310" stroke="#8b949e" stroke-width="1" stroke-dasharray="4,2"/>
  <polygon points="195,305 185,310 195,315" fill="#8b949e"/>

  <line x1="750" y1="230" x2="750" y2="310" stroke="#8b949e" stroke-width="1" stroke-dasharray="4,2"/>
  <line x1="750" y1="310" x2="740" y2="310" stroke="#8b949e" stroke-width="1" stroke-dasharray="4,2"/>
  <polygon points="740,305 730,310 740,315" fill="#8b949e"/>

  ${bottomBar()}
  </svg>`
}

// ========== Write all SVGs ==========
const images = {
  "dashboard.svg": heroSVG,
  "chart.svg": chartSVG,
  "ai-chat.svg": aiChatSVG,
  "screeners.svg": screenersSVG,
  "heatmap.svg": heatmapSVG,
  "portfolio.svg": portfolioSVG,
  "providers.svg": providersSVG,
  "prediction-card.svg": predictionCardSVG,
  "architecture.svg": architectureSVG,
}

for (const [name, fn] of Object.entries(images)) {
  writeFileSync(join(OUT, name), fn())
  console.log(`✓ ${name}`)
}

console.log(`\n✅ ${Object.keys(images).length} SVGs written to ${OUT}`)
