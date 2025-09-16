import Link from "next/link"

import { Header } from "@/components/ui/header"

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Navegar</h3>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="/" className="text-foreground hover:text-primary hover:underline">
                  Inicio
                </Link>
                <Link
                  href="/categories"
                  className="text-foreground hover:text-primary hover:underline"
                >
                  Categorías
                </Link>
                <Link href="/tags" className="text-foreground hover:text-primary hover:underline">
                  Tags
                </Link>
                <Link href="/search" className="text-foreground hover:text-primary hover:underline">
                  Buscar
                </Link>
              </nav>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Tu Cuenta</h3>
              <nav className="flex flex-col gap-2 text-sm">
                <Link
                  href="/profile"
                  className="text-foreground hover:text-primary hover:underline"
                >
                  Mi Perfil
                </Link>
                <Link
                  href="/create-post"
                  className="text-foreground hover:text-primary hover:underline"
                >
                  Crear Post
                </Link>
              </nav>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
        <aside className="hidden w-80 shrink-0 xl:block">
          <div className="sticky top-24">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Información</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  CodeQuest es una comunidad de desarrolladores donde puedes compartir conocimiento,
                  hacer preguntas y conectar con otros programadores.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
