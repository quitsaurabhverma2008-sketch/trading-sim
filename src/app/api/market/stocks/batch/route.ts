import { NextRequest, NextResponse } from "next/server"

const YAHOO_HOSTS = ["query2.finance.yahoo.com", "query1.finance.yahoo.com"]

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get("symbols")
  if (!symbolsParam) return NextResponse.json({ quotes: [] })

  const symbols = symbolsParam.split(",").filter(Boolean).map((s) => s.trim().toUpperCase())
  const result: Record<string, { price: number; changePercent: number } | null> = {}

  const batches: string[][] = []
  for (let i = 0; i < symbols.length; i += 20) {
    batches.push(symbols.slice(i, i + 20))
  }

  await Promise.all(
    batches.map(async (batch) => {
      const joined = batch.join(",")
      for (const host of YAHOO_HOSTS) {
        try {
          const url = `https://${host}/v7/finance/quote?symbols=${encodeURIComponent(joined)}`
          const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 60 } })
          if (!res.ok) continue
          const data = await res.json()
          const items = data?.quoteResponse?.result ?? []
          for (const item of items) {
            const sym = (item.symbol as string)?.toUpperCase()
            if (sym && item.regularMarketPrice != null) {
              result[sym] = {
                price: item.regularMarketPrice as number,
                changePercent: (item.regularMarketChangePercent as number) * 100,
              }
            }
          }
          break
        } catch { continue }
      }
    })
  )

  return NextResponse.json({ quotes: result })
}
