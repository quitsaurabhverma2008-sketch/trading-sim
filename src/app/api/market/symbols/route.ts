import { NextResponse } from "next/server"
import { STOCK_SYMBOLS } from "@/lib/stockSymbols"

const BINANCE_REST_BASE = "https://api.binance.com"

let cachedCryptoSymbols: { symbol: string; baseAsset: string; name: string; precision: number }[] = []
let lastFetch = 0
const CACHE_TTL = 300_000

async function fetchCryptoSymbols(): Promise<{ symbol: string; baseAsset: string; name: string; precision: number }[]> {
  const now = Date.now()
  if (cachedCryptoSymbols.length > 0 && now - lastFetch < CACHE_TTL) {
    return cachedCryptoSymbols
  }

  const res = await fetch(`${BINANCE_REST_BASE}/api/v3/exchangeInfo`)
  if (!res.ok) throw new Error(`Binance exchangeInfo error: ${res.status}`)
  const data = await res.json()

  const nameMap: Record<string, string> = {
    BTC: "Bitcoin", ETH: "Ethereum", SOL: "Solana", BNB: "BNB", XRP: "XRP",
    ADA: "Cardano", DOGE: "Dogecoin", AVAX: "Avalanche", DOT: "Polkadot",
    LINK: "Chainlink", MATIC: "Polygon", ATOM: "Cosmos", UNI: "Uniswap",
    ARB: "Arbitrum", OP: "Optimism", LTC: "Litecoin", FIL: "Filecoin",
    NEAR: "NEAR Protocol", APT: "Aptos", SUI: "Sui", HBAR: "Hedera",
    ICP: "Internet Computer", ALGO: "Algorand", AXS: "Axie Infinity",
    SAND: "The Sandbox", MANA: "Decentraland", EOS: "EOS", THETA: "Theta",
    GRT: "The Graph", FTM: "Fantom", STX: "Stacks",
    INJ: "Injective", MKR: "Maker", AAVE: "Aave", COMP: "Compound",
    RUNE: "THORChain", CHZ: "Chiliz", BAT: "Basic Attention Token",
    ZIL: "Zilliqa", ENJ: "Enjin", ONE: "Harmony", HOT: "Holo",
    IOST: "IOST", CELR: "Celer Network", ANKR: "Ankr", BAND: "Band Protocol",
    NKN: "NKN", ARPA: "ARPA", TRB: "Tellor", FET: "Fetch.ai",
    AGIX: "SingularityNET", OCEAN: "Ocean Protocol", RLC: "iExec RLC",
    NANO: "Nano", IOTX: "IoTeX", KSM: "Kusama", ZEC: "Zcash",
    DASH: "Dash", XMR: "Monero", ETC: "Ethereum Classic",
    WAVES: "Waves", KAVA: "Kava", OMG: "OMG Network",
    CELO: "Celo", MINA: "Mina", FLOW: "Flow", FTT: "FTX Token",
    LDO: "Lido DAO", RPL: "Rocket Pool", FXS: "Frax Share",
    YFI: "yearn.finance", SUSHI: "SushiSwap", CAKE: "PancakeSwap",
    DYDX: "dYdX", GALA: "GALA", IMX: "Immutable", ENS: "Ethereum Name Service",
    REN: "Ren", CKB: "Nervos Network", SC: "Siacoin",
    TFUEL: "Theta Fuel", TOMO: "TomoChain",
    CVC: "Civic", POWR: "Powerledger", STORJ: "Storj",
    SKL: "SKALE", UMA: "UMA", PERP: "Perpetual Protocol",
    BICO: "Biconomy", POLS: "Polkastarter", SUPER: "SuperFarm",
    TRU: "TrueFi", ALPHA: "Alpha Venture DAO", BADGER: "Badger DAO",
    DNT: "district0x", LRC: "Loopring", ZRX: "0x",
    KNC: "Kyber Network", BAL: "Balancer", CVX: "Convex Finance",
    SPELL: "Spell Token", JOE: "Trader Joe",
    PENDLE: "Pendle", GMX: "GMX", RDNT: "Radiant Capital",
    MAV: "Maverick Protocol", ARKM: "Arkham", BLUR: "Blur",
    TIA: "Celestia", SEI: "Sei", ORDI: "Ordinals", SATS: "Sats",
    RATS: "Rats", PEPE: "Pepe", WIF: "dogwifhat", BONK: "Bonk",
    FLOKI: "Floki", MEME: "Memecoin", AIOZ: "AIOZ Network",
  }

  cachedCryptoSymbols = data.symbols
    .filter((s: { status: string; quoteAsset: string }) => s.status === "TRADING" && s.quoteAsset === "USDT")
    .map((s: { symbol: string; baseAsset: string; quoteAsset: string; filters: { filterType: string; tickSize: string }[] }) => {
      const tickFilter = s.filters?.find((f: { filterType: string }) => f.filterType === "LOT_SIZE" || f.filterType === "PRICE_FILTER")
      const tickSize = tickFilter?.tickSize ?? "0.01"
      const precision = Math.max(0, -Math.floor(Math.log10(parseFloat(tickSize))))
      return {
        symbol: s.symbol,
        baseAsset: s.baseAsset,
        name: nameMap[s.baseAsset] ?? s.baseAsset,
        precision,
      }
    })
    .sort((a: { symbol: string }, b: { symbol: string }) => a.symbol.localeCompare(b.symbol))

  lastFetch = now
  return cachedCryptoSymbols
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") ?? "all"
  const search = searchParams.get("search") ?? ""
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "50")

  try {
    const [cryptoSymbols] = await Promise.all([fetchCryptoSymbols()])

    let all = type === "stocks" ? STOCK_SYMBOLS : type === "crypto" ? cryptoSymbols : [...cryptoSymbols, ...STOCK_SYMBOLS]

    if (search) {
      const q = search.toLowerCase()
      all = all.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          ("name" in s && (s as { name: string }).name?.toLowerCase().includes(q)) ||
          ("baseAsset" in s && (s as { baseAsset: string }).baseAsset?.toLowerCase().includes(q))
      )
    }

    const total = all.length
    const items = limit >= 2000 ? all : all.slice((page - 1) * limit, (page - 1) * limit + limit)

    return NextResponse.json({ items, total, page: 1, limit: total })
  } catch (error) {
    console.error("Symbols API error:", error)
    return NextResponse.json(
      { items: [], total: 0, page, limit, error: "Failed to fetch symbols" },
      { status: 500 }
    )
  }
}
