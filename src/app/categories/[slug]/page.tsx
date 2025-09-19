"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { PostCard } from "@/features/post/post-card"
import { categoriesApi, postsApi } from "@/lib/api-services"
import type { Category, Post } from "@/lib/api-types"

export default function CategoryDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryRes, _postsRes] = await Promise.all([
          categoriesApi.getBySlug(slug),
          postsApi.list({ page: 1, limit: 20, categoryId: undefined }), // We'll need to get categoryId first
        ])

        setCategory(categoryRes)

        // Now get posts with the category ID
        const postsWithCategory = await postsApi.list({
          page: 1,
          limit: 20,
          categoryId: categoryRes.category_id,
        })
        setPosts(postsWithCategory.data)
      } catch (e: any) {
        setError(e?.message || "Error al cargar la categoría")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadData()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Categoría no encontrada</h1>
          <p className="mb-4 text-muted-foreground">
            {error || "La categoría que buscas no existe"}
          </p>
          <Link href="/categories">
            <Button>Ver todas las categorías</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/categories"
          className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Categorías
        </Link>
      </div>

      {/* Category Info */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-muted-foreground">{category.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>/{category.slug}</span>
          {category._count?.posts !== undefined && <span>{category._count.posts} posts</span>}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Posts en {category.name}</h2>

        {posts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No hay posts en esta categoría aún.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.post_id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
