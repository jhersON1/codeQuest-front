// app/discord/callback/page.tsx

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"

import { useAuth } from "@/lib/auth-context"

export default function DiscordCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleOAuthCallback } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(true)
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Evitar múltiples ejecuciones
    if (hasProcessed.current) return

    const processCallback = async () => {
      hasProcessed.current = true

      try {
        const accessToken = searchParams.get("accessToken")
        const refreshToken = searchParams.get("refreshToken")

        if (accessToken && refreshToken) {
          console.log("Procesando OAuth callback...")
          await handleOAuthCallback({ accessToken, refreshToken })
          console.log("OAuth callback completado")
          router.push("/")
        } else {
          setError("Tokens no válidos")
          setTimeout(() => router.push("/login"), 2000)
        }
      } catch (error) {
        console.error("Error OAuth:", error)
        setError("Error al procesar autenticación")
        setTimeout(() => router.push("/login"), 2000)
      } finally {
        setProcessing(false)
      }
    }

    processCallback()
  }, []) // Sin dependencias para evitar re-ejecuciones

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#151127] via-[#1C1439] to-[#231D3C]">
      <div className="text-center">
        {processing && (
          <div className="space-y-4">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#833df4] border-t-transparent"></div>
            <p className="text-white">Finalizando inicio de sesión...</p>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="text-red-400">
              <p className="font-medium">Error de autenticación</p>
              <p className="text-sm">{error}</p>
            </div>
            <p className="text-sm text-white/70">Redirigiendo...</p>
          </div>
        )}
      </div>
    </div>
  )
}
