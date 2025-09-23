// app/discord/callback/page.tsx

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { useAuth } from "@/lib/auth-context"

export default function DiscordCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleOAuthCallback } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const accessToken = searchParams.get("accessToken")
        const refreshToken = searchParams.get("refreshToken")

        console.log("Discord callback tokens received:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        })

        // Debug: Verificar que los tokens se pueden decodificar
        if (accessToken) {
          try {
            const tokenParts = accessToken.split(".")
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]))
              console.log("AccessToken payload:", payload)
            }
          } catch (e) {
            console.warn("No se pudo decodificar el access token:", e)
          }
        }

        if (accessToken && refreshToken) {
          console.log("Procesando OAuth callback...")

          // Verificar tokens antes de llamar al callback
          console.log("Tokens que se enviarán al handleOAuthCallback:", {
            accessToken: accessToken.substring(0, 50) + "...",
            refreshToken: refreshToken.substring(0, 50) + "...",
          })

          // Llama a la función del AuthProvider para que maneje todo
          await handleOAuthCallback({ accessToken, refreshToken })
          console.log("OAuth callback completado exitosamente")

          // Verificar que el usuario se estableció antes de redirigir
          console.log("Verificando estado después del callback...")
          await new Promise((resolve) => setTimeout(resolve, 1000))

          console.log("Redirigiendo al inicio")
          router.push("/")
        } else {
          const errorMsg = "Callback sin tokens válidos"
          console.error(errorMsg, { accessToken, refreshToken })
          setError(errorMsg)
          setTimeout(() => router.push("/login"), 3000)
        }
      } catch (error) {
        console.error("Error al procesar el callback de OAuth:", error)
        setError("Error al procesar el callback de autenticación")
        setTimeout(() => router.push("/login"), 3000)
      } finally {
        setProcessing(false)
      }
    }

    processCallback()
  }, [router, searchParams, handleOAuthCallback])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#151127] via-[#1C1439] to-[#231D3C]">
      <div className="text-center">
        {processing && (
          <div className="space-y-4">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#833df4] border-t-transparent"></div>
            <p className="text-white">Finalizando inicio de sesión con Discord...</p>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="text-red-400">
              <p className="font-medium">Error de autenticación</p>
              <p className="text-sm">{error}</p>
            </div>
            <p className="text-sm text-white/70">Redirigiendo al login en unos segundos...</p>
          </div>
        )}
      </div>
    </div>
  )
}
