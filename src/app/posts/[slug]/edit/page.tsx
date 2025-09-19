"use client"

import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { categoriesApi, postsApi, tagsApi } from "@/lib/api-services"
import type { Category, Tag, Post, UpdatePostDto } from "@/lib/api-types"
import { useAuth } from "@/lib/auth-context"

export default function EditPostPage() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [selectedTags, setSelectedTags] = useState<number[]>([])

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [p, cs, ts] = await Promise.all([
          postsApi.getBySlug(slug),
          categoriesApi.list({ page: 1, limit: 100 }),
          tagsApi.list({ page: 1, limit: 200 }),
        ])
        setPost(p)
        setTitle(p.title)
        setBody(p.body)
        setExcerpt(p.excerpt || "")
        setCategoryId(p.category?.category_id)
        setSelectedTags(p.tags?.map((t) => t.tag_id) || [])
        setCategories(cs.data)
        setTags(ts.data)
      } catch (e: any) {
        setError(e?.message || "No se pudo cargar el post")
      } finally {
        setLoading(false)
      }
    }
    if (slug) load()
  }, [slug])

  const canEdit =
    !!user && !!post && (user.role === "admin" || user.user_id === post.author?.user_id)

  const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
    e.preventDefault()
    if (!post) return
    setSaving(true)
    setError(null)
    const payload: UpdatePostDto = {
      title: title.trim() || undefined,
      body: body.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      categoryIds: categoryId ? [categoryId] : undefined,
      tagIds: selectedTags.length ? selectedTags : undefined,
      status: publish ? "published" : undefined,
      publishedAt: publish ? new Date().toISOString() : undefined,
    }
    try {
      const updated = await postsApi.update(post.post_id, payload)
      router.push(`/posts/${updated.slug}`)
    } catch (e: any) {
      setError(e?.message || "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = (id: number) => {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!post || !user) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground">No disponible</h1>
        <p className="text-muted-foreground">Inicia sesión y verifica el post.</p>
      </div>
    )
  }

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground">No autorizado</h1>
        <p className="text-muted-foreground">Solo el autor o un administrador puede editar.</p>
        <div className="mt-4">
          <Button asChild>
            <Link href={`/posts/${post.slug}`}>Volver al post</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/posts/${post.slug}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Editar post</h1>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Contenido</CardTitle>
              <CardDescription>Edita el contenido del post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Extracto</Label>
                <Input id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Contenido</Label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={14}
                  className="w-full resize-y rounded-md border border-border bg-card p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>Guarda cambios o publica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button type="submit" className="w-full" disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> {saving ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="outline"
                disabled={saving}
                onClick={(e) => handleSubmit(e as any, true)}
              >
                <Eye className="mr-2 h-4 w-4" /> Publicar
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Categoría</CardTitle>
              <CardDescription>Selecciona una categoría</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-md border border-border bg-card p-2 text-foreground"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Selecciona los tags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {tags.map((t) => (
                  <label key={t.tag_id} className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(t.tag_id)}
                      onChange={() => toggleTag(t.tag_id)}
                      className="rounded border-border bg-card text-primary focus:ring-primary focus:ring-offset-background"
                    />
                    <span className="text-sm text-foreground">{t.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
