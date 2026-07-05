import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ssrStorage } from "@/lib/ssrStorage"
import { STORAGE_KEYS } from "@/lib/constants"
import type { AIMessage, AIProviderState, AIStreamStatus } from "@/types"

interface PersistedAI {
  messages: AIMessage[]
  providerState: AIProviderState
}

interface AIActions {
  isStreaming: boolean
  streamStatus: AIStreamStatus
  addMessage: (message: AIMessage) => void
  setMessages: (messages: AIMessage[]) => void
  appendToLastAssistant: (content: string) => void
  setIsStreaming: (val: boolean) => void
  setStreamStatus: (status: AIStreamStatus) => void
  updateProviderState: (partial: Partial<AIProviderState>) => void
  clearMessages: () => void
}

type AIStoreState = PersistedAI & AIActions

export const useAIStore = create<AIStoreState>()(
  persist(
    (set) => ({
      messages: [],
      isStreaming: false,
      streamStatus: "idle",
      providerState: {
        provider: "openai",
        model: "gpt-4o-mini",
        apiKey: "",
        temperature: 0.7,
        maxTokens: 4096,
        systemPrompt: "",
      },

      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }))
      },

      setMessages: (messages) => {
        set({ messages })
      },

      appendToLastAssistant: (content) => {
        set((state) => {
          const msgs = [...state.messages]
          for (let i = msgs.length - 1; i >= 0; i--) {
            if (msgs[i].role === "assistant") {
              msgs[i] = { ...msgs[i], content: msgs[i].content + content }
              break
            }
          }
          return { messages: msgs }
        })
      },

      setIsStreaming: (val) => {
        set({ isStreaming: val })
      },

      setStreamStatus: (status) => {
        set({ streamStatus: status })
      },

      updateProviderState: (partial) => {
        set((state) => ({
          providerState: { ...state.providerState, ...partial },
        }))
      },

      clearMessages: () => {
        set({ messages: [] })
      },
    }),
    {
      name: STORAGE_KEYS.AI_MESSAGES,
      storage: createJSONStorage(() => ssrStorage),
      partialize: (state) => ({
        messages: state.messages.slice(-100),
        providerState: state.providerState,
      }),
    }
  )
)
