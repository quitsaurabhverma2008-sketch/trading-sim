"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { APP_NAME } from "@/lib/constants"
import { guestLogin, login, register } from "@/lib/auth"
import { MarketParticles } from "@/components/three/MarketParticles"
import { PriceGlobe } from "@/components/three/PriceGlobe"
import { TrendingUp, User, Key, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register" | "guest">("guest")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleGuest() {
    setLoading(true)
    await guestLogin()
    toast.success("Logged in as guest")
    router.push("/dashboard")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Enter email and password")
      return
    }
    setLoading(true)

    const fn = mode === "login" ? login : register
    const result = await fn(email, password)

    if (result.success) {
      toast.success(mode === "login" ? "Logged in" : "Account created")
      router.push("/dashboard")
    } else {
      toast.error(result.error ?? "Authentication failed")
    }
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <MarketParticles count={100} speed={0.3} interactive={true} />

      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 blur-3xl animate-aurora" />
      </div>

      <Card className="relative w-full max-w-sm bg-background/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <PriceGlobe size={80} />
          </div>
          <CardTitle className="text-lg font-bold">
            <span className="text-gradient">{APP_NAME}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            AI-Powered Paper Trading Simulator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="default"
            className="w-full gap-2 h-10 relative overflow-hidden group"
            onClick={handleGuest}
            disabled={loading}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="relative">Continue as Guest</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                placeholder="demo@tradesim.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-sm bg-background/50"
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-sm bg-background/50"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="outline"
                className="flex-1"
                size="sm"
                onClick={() => setMode("login")}
                disabled={loading}
              >
                <Key className="h-3.5 w-3.5 mr-1" />
                Login
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="flex-1"
                size="sm"
                onClick={() => setMode("register")}
                disabled={loading}
              >
                Register
              </Button>
            </div>
          </form>

          <p className="text-[10px] text-muted-foreground text-center">
            Paper trading simulator — educational use only. No real money involved.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
