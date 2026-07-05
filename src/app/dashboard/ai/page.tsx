"use client"

import { AIChat } from "@/components/ai/AIChat"

export default function AIPage() {
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 flex flex-col min-h-0">
        <AIChat />
      </div>
    </div>
  )
}
