"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { tagsApi } from "@/lib/api-services"
import type { Tag } from "@/lib/api-types"

export default function TagsPage() {
  const [items, setItems] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await tagsApi.list({ page: 1, limit: 20 })
        setItems(res.data)
      } catch (e: any) {
        setError(e?.message || "No se pudieron cargar los tags")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="text-muted-foreground">Cargando...</div>
  if (error) return <div className="text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Tags</h1>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <li key={t.tag_id} className="rounded-md border border-border bg-card p-4">
            <Link
              href={`/search?tag=${t.slug}`}
              className="font-medium text-primary hover:underline"
            >
              {t.name}
            </Link>
            <div className="text-xs text-muted-foreground">#{t.slug}</div>
            {t._count?.posts !== undefined && (
              <div className="mt-2 text-xs text-muted-foreground">{t._count.posts} posts</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
