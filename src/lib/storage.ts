const ENCRYPTION_KEY_STORE = "ts_enc_key"

async function getEncryptionKey(): Promise<CryptoKey> {
  let stored = localStorage.getItem(ENCRYPTION_KEY_STORE)
  if (!stored) {
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
    stored = JSON.stringify(await crypto.subtle.exportKey("jwk", key))
    localStorage.setItem(ENCRYPTION_KEY_STORE, stored)
  }
  return crypto.subtle.importKey("jwk", JSON.parse(stored), { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded)
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)
  return btoa(String.fromCharCode(...combined))
}

async function decrypt(ciphertext: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data)
    return new TextDecoder().decode(decrypted)
  } catch {
    return ciphertext
  }
}

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith("ts_") && k !== ENCRYPTION_KEY_STORE) {
          keysToRemove.push(k)
        }
      }
      if (keysToRemove.length > 0) {
        keysToRemove.forEach((k) => localStorage.removeItem(k))
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch {
        }
      }
    }
  }
}

function removeItem(key: string): void {
  localStorage.removeItem(key)
}

export const storage = {
  get: getItem,
  set: setItem,
  remove: removeItem,
  async getEncrypted<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try {
      const decrypted = await decrypt(raw)
      return JSON.parse(decrypted) as T
    } catch {
      return null
    }
  },
  async setEncrypted<T>(key: string, value: T): Promise<void> {
    const encrypted = await encrypt(JSON.stringify(value))
    localStorage.setItem(key, encrypted)
  },
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("TradeSim", 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains("candles")) {
        db.createObjectStore("candles", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("tradeHistory")) {
        db.createObjectStore("tradeHistory", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("orders")) {
        db.createObjectStore("orders", { keyPath: "id" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function dbGet<T>(store: string, id: string): Promise<T | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly")
    const req = tx.objectStore(store).get(id)
    req.onsuccess = () => resolve(req.result?.data ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function dbSet<T>(store: string, id: string, data: T): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite")
    const req = tx.objectStore(store).put({ id, data })
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function dbDelete(store: string, id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite")
    const req = tx.objectStore(store).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function dbGetAll<T>(store: string): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly")
    const req = tx.objectStore(store).getAll()
    req.onsuccess = () => resolve(req.result.map((r: { data: T }) => r.data))
    req.onerror = () => reject(req.error)
  })
}
