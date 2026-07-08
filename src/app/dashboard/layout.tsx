"use client"

import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { MarketParticles } from "@/components/three/MarketParticles"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts()

  return (
    <div className="flex flex-col h-screen">
      <MarketParticles count={80} speed={0.2} />
      <Header />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
