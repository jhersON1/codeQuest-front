"use client"

import { Search, Plus, MessageSquare, Bell, Menu, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

export function Header() {
  const { user, logout, loading } = useAuth()
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  if (!isClient) {
    return (
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <span className="text-lg font-bold text-primary-foreground">CQ</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">CodeQuest</span>
            </div>
          </div>
          <div className="mx-8 hidden max-w-xl flex-1 md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en CodeQuest..."
                className="rounded-full border-border/50 bg-muted/50 py-3 pr-4 pl-12 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </form>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-32"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <span className="text-lg font-bold text-primary-foreground">CQ</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">CodeQuest</span>
          </div>
        </div>

        <div className="mx-8 hidden max-w-xl flex-1 md:block">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Buscar en CodeQuest..."
              className="rounded-full border-border/50 bg-muted/50 py-3 pr-4 pl-12 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {user && (
            <Link href="/create-post">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {user && !loading ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                {user.display_name || user.username}
              </span>
              <Button
                variant="outline"
                className="border-english-violet/50 bg-dark-purple/30 text-white transition-all duration-200 hover:bg-dark-purple/50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/register">
                <Button variant="ghost" className="text-white/70 hover:text-white">
                  Registrarse
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-english-violet/50 bg-dark-purple/30 text-white transition-all duration-200 hover:bg-dark-purple/50"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
