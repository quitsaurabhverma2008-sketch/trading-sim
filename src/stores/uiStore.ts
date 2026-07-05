import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ssrStorage } from "@/lib/ssrStorage"

type SidebarView = "watchlist" | "portfolio" | "none"
type PanelView = "chart" | "ai" | "split"

interface PersistedUI {
  sidebarOpen: boolean
  aiPanelOpen: boolean
  panelView: PanelView
  theme: "light" | "dark" | "system"
}

interface UIActions {
  sidebarView: SidebarView
  orderPanelOpen: boolean
  toggleSidebar: () => void
  setSidebarView: (view: SidebarView) => void
  setSidebarOpen: (open: boolean) => void
  toggleAIPanel: () => void
  setAIPanelOpen: (open: boolean) => void
  setPanelView: (view: PanelView) => void
  setOrderPanelOpen: (open: boolean) => void
  toggleOrderPanel: () => void
  setTheme: (theme: "light" | "dark" | "system") => void
}

type UIState = PersistedUI & UIActions

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarView: "watchlist",
      aiPanelOpen: false,
      panelView: "split",
      orderPanelOpen: false,
      theme: "dark",

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarView: (view) => set({ sidebarView: view }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleAIPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
      setAIPanelOpen: (open) => set({ aiPanelOpen: open }),
      setPanelView: (view) => set({ panelView: view }),
      setOrderPanelOpen: (open) => set({ orderPanelOpen: open }),
      toggleOrderPanel: () => set((s) => ({ orderPanelOpen: !s.orderPanelOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "ts_ui_state",
      storage: createJSONStorage(() => ssrStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        aiPanelOpen: state.aiPanelOpen,
        panelView: state.panelView,
        theme: state.theme,
      }),
    }
  )
)
