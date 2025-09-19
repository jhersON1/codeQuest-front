"use client"

import { useEffect, useState } from "react"

import { PostCard } from "@/features/post/post-card"
import { postsApi } from "@/lib/api-services"
import type { Post } from "@/lib/api-types"

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await postsApi.list({ page: 1, limit: 10 })
        setPosts(res.data)
      } catch (e: any) {
        setError(e?.message || "No se pudieron cargar los posts")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="text-muted-foreground">Cargando...</div>
  if (error) return <div className="text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Inicio</h1>
      </div>

      {posts.map((post) => (
        <PostCard key={post.post_id} post={post} />
      ))}
    </div>
  )
}
