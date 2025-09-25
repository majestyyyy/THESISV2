"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useSeamlessAuth } from "@/lib/hooks/use-seamless-auth"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  timeUntilExpiry: number
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  setUser: (user: User | null) => void
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  timeUntilExpiry: 0,
  signOut: async () => {},
  refreshSession: async () => {},
  setUser: () => {},
  error: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useSeamlessAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
