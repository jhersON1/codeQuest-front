// app/auth/callback/page.tsx

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { useAuth } from "@/lib/auth-context"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleOAuthCallback } = useAuth() // 👈 Obtén la nueva función

  useEffect(() => {
    const processCallback = async () => {
      const accessToken = searchParams.get("accessToken")
      const refreshToken = searchParams.get("refreshToken")

      if (accessToken && refreshToken) {
        try {
          // Llama a la función del AuthProvider para que maneje todo
          await handleOAuthCallback({ accessToken, refreshToken })
          // Redirige al inicio una vez que el estado del usuario esté actualizado
          router.push("/")
        } catch (error) {
          console.error("Error al procesar el callback de OAuth:", error)
          router.push("/login")
        }
      } else {
        console.error("Callback sin tokens, redirigiendo a /login.")
        router.push("/login")
      }
    }

    processCallback()
  }, [router, searchParams, handleOAuthCallback])

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <p>Finalizando inicio de sesión...</p>
    </div>
  )
}
