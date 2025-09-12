"use client"

import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import type React from "react"
import { useState } from "react"

import DiscordIcon from "@/components/icons/discord-icon"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Iniciando sesión")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#151127] via-[#1C1439] to-[#231D3C] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#833df4]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#833df4]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Volver a CodeQuest
        </Link>

        <Card className="border-[#423D56]/30 bg-[#1B1536]/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#833df4] to-[#833df4]/70">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <div className="h-4 w-4 rounded-sm bg-[#833df4]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Iniciar Sesión</CardTitle>
            <CardDescription className="text-white/60">
              Accede a tu cuenta de CodeQuest para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-[#833df4]/30 bg-[#833df4]/10">
              <AlertCircle className="h-4 w-4 text-[#833df4]" />
              <AlertDescription className="text-white/80">
                <strong>Demo:</strong> admin@codequest.com / admin123 (Admin) | user@codequest.com /
                user123 (Usuario)
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Correo electrónico
                </Label>
                <Input id="email" type="email" placeholder="tu@email.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
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

              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>

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
                    console.log("Iniciar sesión con Discord")
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
