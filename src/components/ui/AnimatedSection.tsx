"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { animate } from "animejs"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "fade"
  duration?: number
  distance?: number
  once?: boolean
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 600,
  distance = 30,
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const fromMap: Record<string, { opacity?: number; translateY?: number; translateX?: number }> = {
      up: { opacity: 0, translateY: distance },
      down: { opacity: 0, translateY: -distance },
      left: { opacity: 0, translateX: distance },
      right: { opacity: 0, translateX: -distance },
      fade: { opacity: 0 },
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (once && hasAnimated.current) return
            hasAnimated.current = true

            animate(el, {
              ...fromMap[direction],
              opacity: 1,
              translateX: 0,
              translateY: 0,
              duration,
              delay,
              easing: "easeOutCubic",
            })

            if (once) observer.unobserve(el)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [direction, distance, duration, delay, once])

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
