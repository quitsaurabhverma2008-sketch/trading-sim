import { NextRequest, NextResponse } from "next/server"

const KRONOS_API = process.env.KRONOS_API_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model, candlestick_data, pred_len = 24, temperature = 1.0, top_p = 0.9 } = body

    if (!candlestick_data || !Array.isArray(candlestick_data) || candlestick_data.length === 0) {
      return NextResponse.json({ error: "candlestick_data array required (OHLCV)" }, { status: 400 })
    }

    const payload = {
      df: candlestick_data.slice(-512),
      pred_len,
      model: model || "kronos-small",
      T: temperature,
      top_p,
    }

    const res = await fetch(`${KRONOS_API}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      const err = await res.text().catch(() => "Unknown error")
      return NextResponse.json({ error: `Kronos error (${res.status}): ${err}` }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json({ prediction: data, model: payload.model })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
