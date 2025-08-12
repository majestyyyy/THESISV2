"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, AuthState } from "@/lib/auth"

const AuthContext = createContext<
  AuthState & {
    setUser: (user: User | null) => void
  }
>({
  user: null,
  loading: true,
  setUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("ai-gir-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const updateUser = (newUser: User | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem("ai-gir-user", JSON.stringify(newUser))
    } else {
      localStorage.removeItem("ai-gir-user")
    }
  }

  return <AuthContext.Provider value={{ user, loading, setUser: updateUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
