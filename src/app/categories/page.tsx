"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { categoriesApi } from "@/lib/api-services"
import type { Category } from "@/lib/api-types"

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await categoriesApi.list({ page: 1, limit: 20 })
        setItems(res.data)
      } catch (e: any) {
        setError(e?.message || "No se pudieron cargar las categorías")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="text-muted-foreground">Cargando...</div>
  if (error) return <div className="text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Categorías</h1>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <li key={c.category_id} className="rounded-md border border-border bg-card p-4">
            <Link
              href={`/search?category=${c.slug}`}
              className="font-medium text-primary hover:underline"
            >
              {c.name}
            </Link>
            <div className="text-xs text-muted-foreground">/{c.slug}</div>
            {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
            {c._count?.posts !== undefined && (
              <div className="mt-2 text-xs text-muted-foreground">{c._count.posts} posts</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
