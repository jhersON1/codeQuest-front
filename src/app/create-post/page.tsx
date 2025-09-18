"use client"

import { ArrowLeft, Save, Eye, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { postsApi, categoriesApi, tagsApi, uploadsApi } from "@/lib/api-services"
import type { Category, Tag, CreatePostDto } from "@/lib/api-types"
import { useAuth } from "@/lib/auth-context"

export default function CreatePostPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [categoryIds, setCategoryIds] = useState<number[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [_status, _setStatus] = useState<"draft" | "published">("draft")

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          categoriesApi.list({ page: 1, limit: 50 }),
          tagsApi.list({ page: 1, limit: 50 }),
        ])
        setCategories(categoriesRes.data)
        setTags(tagsRes.data)
      } catch (error) {
        console.error("Error loading categories and tags:", error)
      }
    }

    loadData()
  }, [])

  if (authLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Acceso requerido</h1>
          <p className="mb-4 text-muted-foreground">Debes iniciar sesión para crear posts</p>
          <Link href="/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent, submitStatus: "draft" | "published") => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (!title.trim()) {
      setError("El título es requerido")
      setLoading(false)
      return
    }

    if (!body.trim()) {
      setError("El contenido del post es requerido")
      setLoading(false)
      return
    }

    const postData: CreatePostDto = {
      title: title.trim(),
      body: body.trim(),
      excerpt: excerpt.trim() || undefined,
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      tagIds: selectedTags.length > 0 ? selectedTags : undefined,
      status: submitStatus,
      publishedAt: submitStatus === "published" ? new Date().toISOString() : undefined,
    }

    try {
      // If a cover image is selected, upload it first
      if (coverFile) {
        const res = await uploadsApi.uploadImage(coverFile)
        if (res?.url) {
          postData.featuredImageUrl = res.url
        }
      }
      const createdPost = await postsApi.create(postData)
      setSuccess(
        submitStatus === "published"
          ? "¡Post publicado exitosamente!"
          : "¡Post guardado como borrador!"
      )

      setTimeout(() => {
        router.push(`/posts/${createdPost.slug}`)
      }, 2000)
    } catch (err: any) {
      setError(err?.message || "Error al crear el post")
    } finally {
      setLoading(false)
    }
  }

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Crear Post</h1>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-destructive/30 bg-destructive/10">
          <AlertDescription className="text-white/80">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/30 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-white/80">{success}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Contenido del Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Escribe un título atractivo..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Resumen (opcional)</Label>
                  <Input
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Breve descripción del post..."
                  />
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <Label htmlFor="cover">Imagen de portada (opcional)</Label>
                  <input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setCoverFile(file)
                      if (file) setCoverPreview(URL.createObjectURL(file))
                      else setCoverPreview(null)
                    }}
                    className="w-full text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-foreground file:hover:bg-muted/80"
                  />
                  {coverPreview && (
                    <div className="mt-2">
                      <img
                        src={coverPreview}
                        alt="Vista previa"
                        className="max-h-56 w-auto rounded-md border border-border object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Contenido *</Label>
                  <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Escribe el contenido de tu post..."
                    rows={15}
                    className="w-full resize-none rounded-md border border-border bg-card p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Actions */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Publicar</CardTitle>
                <CardDescription>Guarda como borrador o publica inmediatamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={(e) => handleSubmit(e, "draft")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Guardando..." : "Guardar Borrador"}
                </Button>

                <Button
                  type="button"
                  className="w-full"
                  onClick={(e) => handleSubmit(e, "published")}
                  disabled={loading}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {loading ? "Publicando..." : "Publicar"}
                </Button>
              </CardContent>
            </Card>

            {/* Category */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Categorías</CardTitle>
                <CardDescription>
                  Selecciona las categorías que mejor describan tu post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category.category_id}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(category.category_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCategoryIds((prev) => [...prev, category.category_id])
                          } else {
                            setCategoryIds((prev) =>
                              prev.filter((id) => id !== category.category_id)
                            )
                          }
                        }}
                        className="rounded border-border bg-card text-primary focus:ring-primary focus:ring-offset-background"
                      />
                      <span className="text-sm text-foreground">{category.name}</span>
                    </label>
                  ))}
                </div>

                {categoryIds.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {categoryIds.map((categoryId) => {
                      const category = categories.find((c) => c.category_id === categoryId)
                      return category ? (
                        <span
                          key={categoryId}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                        >
                          {category.name}
                        </span>
                      ) : null
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Selecciona los tags que mejor describan tu post</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {tags.map((tag) => (
                    <label key={tag.tag_id} className="flex cursor-pointer items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.tag_id)}
                        onChange={() => handleTagToggle(tag.tag_id)}
                        className="rounded border-border bg-card text-primary focus:ring-primary focus:ring-offset-background"
                      />
                      <span className="text-sm text-foreground">{tag.name}</span>
                    </label>
                  ))}
                </div>

                {selectedTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {selectedTags.map((tagId) => {
                      const tag = tags.find((t) => t.tag_id === tagId)
                      return tag ? (
                        <span
                          key={tagId}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                        >
                          {tag.name}
                        </span>
                      ) : null
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
