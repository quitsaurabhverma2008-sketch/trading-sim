"use client"

import { useEffect, useRef, useState } from "react"
import { animate } from "animejs"

export function useAnimatedCounter(
  targetValue: number,
  duration = 800,
  decimals = 0,
  enabled = true
) {
  const [displayValue, setDisplayValue] = useState(targetValue)
  const animRef = useRef<ReturnType<typeof animate> | null>(null)
  const prevTarget = useRef(targetValue)

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(targetValue)
      return
    }
    if (prevTarget.current === targetValue) return

    animRef.current?.pause()

    const obj = { val: prevTarget.current }
    animRef.current = animate(obj, {
      val: [prevTarget.current, targetValue],
      duration,
      easing: "easeOutCubic",
      update: () => setDisplayValue(obj.val),
      complete: () => setDisplayValue(targetValue),
    })

    prevTarget.current = targetValue

    return () => { animRef.current?.pause() }
  }, [targetValue, duration, enabled])

  return Number(displayValue.toFixed(decimals))
}
