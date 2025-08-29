"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { dataService } from "@/backend/services/data-service"
import type { User } from "@/backend/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await dataService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if user exists
      let user = await dataService.getUserByEmail(email)

      // If user doesn't exist, create a demo user
      if (!user) {
        user = await dataService.createUser({
          name: email.split("@")[0],
          email,
          role: "client",
        })
      }

      await dataService.setCurrentUser(user.id)
      setUser(user)
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = await dataService.getUserByEmail(email)
      if (existingUser) {
        return false
      }

      const newUser = await dataService.createUser({
        name,
        email,
        role: "client",
      })

      await dataService.setCurrentUser(newUser.id)
      setUser(newUser)
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await dataService.clearCurrentUser()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
