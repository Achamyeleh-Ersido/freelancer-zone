"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { useAuth } from "@/lib/auth-context"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/tickets")
    }
  }, [user, router])

  const handleAuthSuccess = () => {
    router.push("/tickets")
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      {isLogin ? (
        <LoginForm onSuccess={handleAuthSuccess} onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  )
}
