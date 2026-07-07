"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePortfolioStore } from "@/stores/portfolioStore"
import { DEFAULT_DEMO_BALANCE } from "@/lib/constants"

export default function DemoPage() {
  const router = useRouter()
  const { resetPortfolio } = usePortfolioStore()

  useEffect(() => {
    resetPortfolio()
    router.replace("/dashboard")
  }, [resetPortfolio, router])

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-muted-foreground">Starting demo with ${DEFAULT_DEMO_BALANCE.toLocaleString()} virtual balance...</p>
      </div>
    </div>
  )
}
