"use client"

import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import DiscordIcon from "@/components/icons/discord-icon"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = String(formData.get("username") || "").trim()
    const email = String(formData.get("email") || "").trim()
    const password = String(formData.get("password") || "")
    const confirmPassword = String(formData.get("confirmPassword") || "")

    // Validaciones básicas
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      setLoading(false)
      return
    }

    try {
      await register(username, email, password)

      setSuccess("¡Cuenta creada exitosamente! Redirigiendo...")

      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err: any) {
      setError(err?.message || "Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#151127] via-[#1C1439] to-[#231D3C] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#833df4]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#833df4]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          href="/login"
          className="group mb-8 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Volver al inicio de sesión
        </Link>

        <Card className="border-[#423D56]/30 bg-[#1B1536]/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#833df4] to-[#833df4]/70">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <div className="h-4 w-4 rounded-sm bg-[#833df4]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Crear Cuenta</CardTitle>
            <CardDescription className="text-white/60">
              Únete a la comunidad de CodeQuest
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-destructive/30 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-white/80">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500/30 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-white/80">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80">
                  Nombre de usuario *
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="mi-usuario"
                  required
                  minLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Correo electrónico *
                </Label>
                <Input id="email" name="email" type="email" placeholder="tu@correo.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Contraseña *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 transition-colors hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">
                  Confirmar contraseña *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 transition-colors hover:text-white/60"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>

              <div className="text-center text-sm text-white/60">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-[#833df4] hover:underline">
                  Inicia sesión
                </Link>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#423D56]/50" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-[#1B1536]/80 px-2 text-white/60">O continúa con</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="flex h-auto w-full flex-wrap border-[#5865F2] bg-[#5865F2] py-3 font-medium text-white transition-all duration-200 hover:bg-[#5865F2]/90"
                  onClick={() => {
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/discord`
                  }}
                >
                  <DiscordIcon className="mr-2 h-5 w-5" />
                  Continuar con Discord
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
