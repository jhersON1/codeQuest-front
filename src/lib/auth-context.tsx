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
    console.log("Login tradicional iniciado para:", username)
    const response = await authApi.login({ username, password })
    console.log("Login response received:", {
      hasAccessToken: !!response.accessToken,
      hasRefreshToken: !!response.refreshToken,
    })

    setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })

    await loadUser()
    console.log("Login tradicional completado")
  }
  const handleOAuthCallback = async (tokens: { accessToken: string; refreshToken: string }) => {
    try {
      console.log("Iniciando OAuth callback con tokens:", {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
      })

      // Establecer loading temporalmente
      setLoading(true)

      // 1. Guarda los tokens recibidos
      setTokens(tokens)

      // 2. Pequeña pausa para asegurar que los tokens se guardaron
      await new Promise((resolve) => setTimeout(resolve, 100))

      // 3. Carga los datos del usuario para actualizar el estado global
      console.log("Cargando datos del usuario...")
      const userData = await authApi.getCurrentUser()
      console.log("Datos del usuario obtenidos:", {
        userId: userData.user_id,
        username: userData.username,
      })

      // 4. Actualizar el estado del usuario
      setUser(userData)
      console.log("Usuario OAuth establecido exitosamente")
    } catch (error) {
      console.error("Error en handleOAuthCallback:", error)
      // Si hay error, limpia los tokens y no dejes al usuario en estado inconsistente
      clearTokens()
      setUser(null)
      throw error
    } finally {
      // Siempre establecer loading como false al final
      setLoading(false)
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
      console.log("loadUser: iniciando carga de usuario...")
      const storedTokens = getStoredTokens()
      console.log("loadUser: tokens almacenados:", {
        hasAccessToken: !!storedTokens.accessToken,
        hasRefreshToken: !!storedTokens.refreshToken,
      })

      if (storedTokens.accessToken) {
        // Obtener información real del usuario desde el backend
        console.log("loadUser: obteniendo datos del usuario desde API...")
        const userData = await authApi.getCurrentUser()
        console.log("loadUser: datos del usuario obtenidos:", {
          userId: userData.user_id,
          username: userData.username,
        })
        setUser(userData)
        console.log("loadUser: estado del usuario actualizado")
      } else {
        console.log("loadUser: no hay access token, estableciendo usuario como null")
        setUser(null)
      }
    } catch (error) {
      console.error("loadUser: Error cargando usuario:", error)
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
