"use client"

import { AIChat } from "@/components/ai/AIChat"

export default function AIPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        <AIChat />
      </div>
    </div>
  )
}
