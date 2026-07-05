"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { APP_NAME } from "@/lib/constants"
import { guestLogin, login, register } from "@/lib/auth"
import { TrendingUp, User, Key, Loader2 } from "lucide-react"
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <CardTitle className="text-lg">{APP_NAME}</CardTitle>
          <CardDescription className="text-xs">
            AI-Powered Paper Trading Simulator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="default"
            className="w-full gap-2"
            onClick={handleGuest}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
            Continue as Guest
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
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
                className="h-9 text-sm"
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
                className="h-9 text-sm"
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
