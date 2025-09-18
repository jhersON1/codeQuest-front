import Link from "next/link"

import Header from "@/components/ui/header"
import { categoriesApi, tagsApi } from "@/lib/api-services"
import type { Category, Tag, PaginatedResponse } from "@/lib/api-types"

export default async function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Fetch public data for a Reddit-like sidebar
  let categories: Category[] = []
  let tags: Tag[] = []
  try {
    const [catsRes, tagsRes] = await Promise.all([
      categoriesApi.list({ page: 1, limit: 100 }),
      tagsApi.list({ page: 1, limit: 100 }),
    ])
    categories = (catsRes as PaginatedResponse<Category>).data ?? []
    tags = (tagsRes as PaginatedResponse<Tag>).data ?? []
  } catch {
    // keep empty lists if API is not reachable; avoid crashing the layout
  }

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
                <Link href="/search" className="text-foreground hover:text-primary hover:underline">
                  Buscar
                </Link>
              </nav>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Categorías</h3>
              <nav className="flex max-h-80 flex-col gap-2 overflow-y-auto text-sm">
                {categories.length ? (
                  categories.map((c) => (
                    <Link
                      key={c.category_id}
                      href={`/categories/${c.slug}`}
                      className="truncate text-foreground hover:text-primary hover:underline"
                      title={c.name}
                    >
                      {c.name}
                    </Link>
                  ))
                ) : (
                  <span className="text-muted-foreground">No hay categorías</span>
                )}
              </nav>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Tags</h3>
              <nav className="flex max-h-80 flex-col gap-2 overflow-y-auto text-sm">
                {tags.length ? (
                  tags.map((t) => (
                    <Link
                      key={t.tag_id}
                      href={`/tags/${t.slug}`}
                      className="truncate text-foreground hover:text-primary hover:underline"
                      title={t.name}
                    >
                      #{t.name}
                    </Link>
                  ))
                ) : (
                  <span className="text-muted-foreground">No hay tags</span>
                )}
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
