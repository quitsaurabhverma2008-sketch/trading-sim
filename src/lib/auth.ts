import { storage } from "@/lib/storage"
import { generateId } from "@/lib/utils"
import { STORAGE_KEYS } from "@/lib/constants"
import type { UserSession } from "@/types"

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const existing = await storage.getEncrypted<UserSession>(STORAGE_KEYS.SESSION)
  if (existing) {
    const isCorrect = existing.email === email
    if (!isCorrect) {
      return { success: false, error: "Invalid credentials" }
    }
  }

  const session: UserSession = {
    token: generateId() + generateId(),
    email,
    displayName: email.split("@")[0],
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  }

  await storage.setEncrypted(STORAGE_KEYS.SESSION, session)
  return { success: true }
}

export async function register(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const existing = await storage.getEncrypted<UserSession>(STORAGE_KEYS.SESSION)
  if (existing) {
    await logout()
  }

  const session: UserSession = {
    token: generateId() + generateId(),
    email,
    displayName: email.split("@")[0],
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  }

  await storage.setEncrypted(STORAGE_KEYS.SESSION, session)
  return { success: true }
}

export async function guestLogin(): Promise<UserSession> {
  const session: UserSession = {
    token: generateId() + generateId(),
    email: `guest-${generateId().slice(0, 8)}@tradesim.local`,
    displayName: "Guest Trader",
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  }

  await storage.setEncrypted(STORAGE_KEYS.SESSION, session)
  return session
}

export async function logout(): Promise<void> {
  storage.remove(STORAGE_KEYS.SESSION)
}

export async function getSession(): Promise<UserSession | null> {
  const session = await storage.getEncrypted<UserSession>(STORAGE_KEYS.SESSION)
  if (!session) return null
  if (Date.now() > session.expiresAt) {
    storage.remove(STORAGE_KEYS.SESSION)
    return null
  }
  return session
}

export function useAuth() {
  return {
    async login(email: string, password: string) {
      return login(email, password)
    },
    async register(email: string, password: string) {
      return register(email, password)
    },
    async guestLogin() {
      return guestLogin()
    },
    async logout() {
      return logout()
    },
    async getSession() {
      return getSession()
    },
    isLoggedIn() {
      return getSession().then((s) => s !== null)
    },
  }
}
