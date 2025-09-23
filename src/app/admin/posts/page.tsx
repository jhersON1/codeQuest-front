"use client"

import { Edit3, Search as SearchIcon, Trash2, Plus, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { postsApi } from "@/lib/api-services"
import type { Post } from "@/lib/api-types"
import { useAuth } from "@/lib/auth-context"

export default function AdminPostsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [items, setItems] = useState<Post[]>([])
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canAccess = !!user && user.role === "admin"

  const getStatusLabel = (status: Post["status"]) => {
    switch (status) {
      case "published":
        return "Publicado"
      case "draft":
        return "Borrador"
      default:
        return "Archivado"
    }
  }

  // Nota: usamos un ternario anidado como estaba originalmente

  useEffect(() => {
    if (!loading) {
      if (!user) return // wait for login UI
      if (!canAccess) return
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, page])

  const load = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await postsApi.list({
        page,
        limit,
        search: query || undefined,
        // posts list usa una sola clave `sort`
        // opciones: 'published_at_desc' | 'published_at_asc' | 'created_at_desc' | 'created_at_asc'
        sort: "created_at_desc",
      })
      setItems(res.data)
      setTotal(res.meta.total)
    } catch (e: any) {
      setError(e?.message || "Error al cargar posts")
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (postId: number) => {
    if (!confirm("¿Eliminar este post?")) return
    try {
      await postsApi.delete(postId)
      setItems((prev) => prev.filter((p) => p.post_id !== postId))
    } catch (e: any) {
      alert(e?.message || "No se pudo eliminar")
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    await load()
  }

  if (loading) {
    return <div className="p-6 text-muted-foreground">Cargando...</div>
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <ShieldAlert className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold text-foreground">Acceso restringido</h1>
        <p className="text-muted-foreground">Inicia sesión para continuar</p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <ShieldAlert className="mx-auto mb-2 h-10 w-10 text-destructive" />
        <h1 className="mb-2 text-2xl font-bold text-foreground">No autorizado</h1>
        <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Administración · Posts</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/create-post">
              <Plus className="mr-2 h-4 w-4" /> Nuevo post
            </Link>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, autor..."
          className="pl-9"
        />
      </form>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {items.map((post) => (
          <Card key={post.post_id} className="border-border">
            <CardContent className="flex items-start justify-between gap-4 pt-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/posts/${post.slug}`} className="font-semibold hover:underline">
                    {post.title}
                  </Link>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {getStatusLabel(post.status)}
                  </span>
                </div>
                {post.excerpt && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                )}
                <div className="mt-1 text-xs text-muted-foreground">
                  Por {post.author?.display_name || post.author?.username} ·{" "}
                  {new Date(post.created_at).toLocaleDateString("es-ES")}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/posts/${post.slug}/edit`)}
                >
                  <Edit3 className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(post.post_id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Página {page} de {totalPages} · {total} posts
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || busy}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || busy}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
