"use client"

import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts()

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
