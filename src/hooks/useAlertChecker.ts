"use client"

import { useEffect, useRef } from "react"
import { useAlertsStore } from "@/stores/alertsStore"
import { useMarketStore } from "@/stores/marketStore"

export function useAlertChecker() {
  const alerts = useAlertsStore((s) => s.items)
  const markTriggered = useAlertsStore((s) => s.markTriggered)
  const realtimePrices = useMarketStore((s) => s.realtimePrices)
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const active = alerts.filter((a) => !a.triggered)

    for (const alert of active) {
      if (notifiedRef.current.has(alert.id)) continue

      const currentPrice = realtimePrices[alert.symbol]
      if (!currentPrice) continue

      let triggered = false
      if (alert.direction === "above" && currentPrice >= alert.price) {
        triggered = true
      } else if (alert.direction === "below" && currentPrice <= alert.price) {
        triggered = true
      }

      if (triggered) {
        notifiedRef.current.add(alert.id)
        markTriggered(alert.id)

        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(`Price Alert: ${alert.symbol}`, {
            body: `${alert.symbol} is ${alert.direction === "above" ? "above" : "below"} $${alert.price} (now $${currentPrice.toFixed(2)})`,
            icon: "/favicon.ico",
          })
        }
      }
    }

    return () => {}
  }, [alerts, realtimePrices, markTriggered])
}
