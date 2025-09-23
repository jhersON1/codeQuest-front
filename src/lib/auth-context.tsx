"use client"

import { createContext, useContext, useEffect, useState } from "react"

import { clearTokens, setTokens } from "@/lib/api"
import { authApi } from "@/lib/api-services"
import type { User } from "@/lib/api-types"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (
    username: string,
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  handleOAuthCallback: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password })
    setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })
    await loadUser()
  }
  const handleOAuthCallback = async (tokens: { accessToken: string; refreshToken: string }) => {
    try {
      console.log("OAuth: guardando tokens y cargando usuario")
      setTokens(tokens)
      const userData = await authApi.getCurrentUser()
      setUser(userData)
      console.log("OAuth: usuario establecido", userData.username)
    } catch (error) {
      console.error("OAuth error:", error)
      clearTokens()
      setUser(null)
      throw error
    }
  }

  const register = async (
    username: string,
    email: string,
    password: string,
    displayName?: string
  ) => {
    const response = await authApi.register({
      username,
      email,
      password,
      display_name: displayName,
    })
    setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })
    await loadUser()
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
    } finally {
      clearTokens()
      setUser(null)
    }
  }

  const loadUser = async () => {
    try {
      const storedTokens = getStoredTokens()
      if (storedTokens.accessToken) {
        const userData = await authApi.getCurrentUser()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error loading user:", error)
      clearTokens()
      setUser(null)
    }
  }

  const refreshAuth = async () => {
    try {
      await loadUser()
    } catch (error) {
      console.error("Error refreshing auth:", error)
      logout()
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedTokens = getStoredTokens()
        if (storedTokens.refreshToken) {
          await loadUser()
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshAuth,
        handleOAuthCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

function getStoredTokens() {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null }
  try {
    const accessToken = window.localStorage.getItem("cq_access_token")
    const refreshToken = window.localStorage.getItem("cq_refresh_token")
    return { accessToken, refreshToken }
  } catch {
    return { accessToken: null, refreshToken: null }
  }
}
