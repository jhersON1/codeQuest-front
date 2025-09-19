"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { PostCard } from "@/features/post/post-card"
import { tagsApi, postsApi } from "@/lib/api-services"
import type { Tag, Post } from "@/lib/api-types"

export default function TagDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [tag, setTag] = useState<Tag | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tagRes, _postsRes] = await Promise.all([
          tagsApi.getBySlug(slug),
          postsApi.list({ page: 1, limit: 20, tagId: undefined }), // We'll need to get tagId first
        ])

        setTag(tagRes)

        // Now get posts with the tag ID
        const postsWithTag = await postsApi.list({
          page: 1,
          limit: 20,
          tagId: tagRes.tag_id,
        })
        setPosts(postsWithTag.data)
      } catch (e: any) {
        setError(e?.message || "Error al cargar el tag")
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

  if (error || !tag) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Tag no encontrado</h1>
          <p className="mb-4 text-muted-foreground">{error || "El tag que buscas no existe"}</p>
          <Link href="/tags">
            <Button>Ver todos los tags</Button>
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
          href="/tags"
          className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Tags
        </Link>
      </div>

      {/* Tag Info */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">#{tag.name}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>#{tag.slug}</span>
          {tag._count?.posts !== undefined && <span>{tag._count.posts} posts</span>}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Posts con #{tag.name}</h2>

        {posts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No hay posts con este tag aún.</p>
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
