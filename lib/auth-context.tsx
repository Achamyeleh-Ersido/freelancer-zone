"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock users database (in real app, this would be in your database)
  const mockUsers = [
    {
      id: "user-1",
      email: "client@example.com",
      password: "password123",
      name: "John Doe",
      role: "client" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "admin-1",
      email: "admin@example.com",
      password: "admin123",
      name: "Admin User",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "freelancer-1",
      email: "freelancer@example.com",
      password: "freelancer123",
      name: "Jane Smith",
      role: "freelancer" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem("auth-user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("auth-user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock authentication (in real app, this would be an API call)
      const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)
        localStorage.setItem("auth-user", JSON.stringify(userWithoutPassword))
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = mockUsers.find((u) => u.email === email)
      if (existingUser) {
        return false
      }

      // Create new user (in real app, this would be an API call)
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        name,
        role: "client" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Add to mock database
      mockUsers.push({ ...newUser, password })

      setUser(newUser)
      localStorage.setItem("auth-user", JSON.stringify(newUser))
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth-user")
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
