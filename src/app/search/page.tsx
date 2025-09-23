"use client"

import { Search } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostCard } from "@/features/post/post-card"
import { searchApi, postsApi } from "@/lib/api-services"
import type { Category, PaginatedResponse, Post, Tag } from "@/lib/api-types"

type SearchResult = {
  posts: Post[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const initialQuery = searchParams.get("q") || ""
  const initialCategory = searchParams.get("category") || ""
  const initialTag = searchParams.get("tag") || ""

  const [query, setQuery] = useState(initialQuery)
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult>({ posts: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(!!initialQuery)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    initialCategory || undefined
  )
  const [selectedTag, setSelectedTag] = useState<string | undefined>(initialTag || undefined)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (initialQuery || initialCategory || initialTag) {
      performSearch(initialQuery)
    }
  }, [initialQuery, initialCategory, initialTag])

  // Keep selected filters in sync with URL params
  useEffect(() => {
    setSelectedCategory(initialCategory || undefined)
  }, [initialCategory])
  useEffect(() => {
    setSelectedTag(initialTag || undefined)
  }, [initialTag])

  useEffect(() => {
    import("@/lib/api-services").then(({ categoriesApi, tagsApi }) => {
      categoriesApi.list({ limit: 50 }).then((res: PaginatedResponse<Category>) => {
        setCategories(Array.isArray(res.data) ? res.data : [])
      })
      tagsApi.list({ limit: 50 }).then((res: PaginatedResponse<Tag>) => {
        setTags(Array.isArray(res.data) ? res.data : [])
      })
    })
  }, [])

  const performSearch = async (searchQuery: string, nextCategory?: string, nextTag?: string) => {
    const q = searchQuery.trim()
    const cat = nextCategory ?? selectedCategory
    const tag = nextTag ?? selectedTag

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      if (q) {
        const postsRes = await searchApi.searchPosts({
          search: q,
          limit: 20,
          categorySlug: cat,
          tagSlug: tag,
        })
        setResults({ posts: postsRes?.data ?? [] })
      } else {
        const listRes = await postsApi.list({
          page: 1,
          limit: 20,
          categorySlugs: cat ? [cat] : undefined,
          tagSlugs: tag ? [tag] : undefined,
          sort: "published_at_desc",
        })
        setResults({ posts: listRes?.data ?? [] })
      }
    } catch (e: any) {
      setError(e?.message || "Error al realizar la búsqueda")
      setResults({ posts: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchInput.trim()
    setQuery(q)
    setHasSearched(true)
    performSearch(q)

    // Update URL (include filters)
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (selectedCategory) params.set("category", selectedCategory)
    if (selectedTag) params.set("tag", selectedTag)
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl)
  }

  const applyFilterChange = (nextCategory?: string, nextTag?: string) => {
    const q = searchInput.trim()
    setHasSearched(true)
    performSearch(q, nextCategory, nextTag)
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    // Always use the provided next values as the new source of truth
    if (nextCategory) params.set("category", nextCategory)
    if (nextTag) params.set("tag", nextTag)
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl)
  }

  const totalResults = results.posts.length

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Buscar</h1>

        <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
          <Search className="mr-2 ml-2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar posts, usuarios..."
            className="flex-1 py-3 pl-2"
          />
          <Button type="submit" size="sm" className="w-28" disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-28"
            onClick={() => setShowFilters((v) => !v)}
          >
            Filtros
          </Button>
        </form>

        {showFilters && (
          <div className="mt-2 flex gap-4 rounded-lg border bg-background p-4 shadow-md">
            <div className="w-1/2">
              <label className="mb-1 block text-sm">Categoría</label>
              <select
                className="w-full rounded border bg-[#231d3c] px-2 py-1 text-white"
                value={selectedCategory ?? ""}
                onChange={(e) => {
                  const next = e.target.value || undefined
                  setSelectedCategory(next)
                  applyFilterChange(next, selectedTag)
                }}
              >
                <option value="">Todas (sin filtro)</option>
                {categories
                  .filter((cat) => cat && cat.slug)
                  .map((cat, idx) => (
                    <option key={cat.slug ?? idx} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="w-1/2">
              <label className="mb-1 block text-sm">Tag</label>
              <select
                className="w-full rounded border bg-[#231d3c] px-2 py-1 text-white"
                value={selectedTag ?? ""}
                onChange={(e) => {
                  const next = e.target.value || undefined
                  setSelectedTag(next)
                  applyFilterChange(selectedCategory, next)
                }}
              >
                <option value="">Todos (sin filtro)</option>
                {tags
                  .filter((tag) => tag && tag.slug)
                  .map((tag, idx) => (
                    <option key={tag.slug ?? idx} value={tag.slug}>
                      {tag.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-6">
          {(() => {
            if (loading) {
              return (
                <div className="py-8 text-center">
                  <div className="text-muted-foreground">Buscando...</div>
                </div>
              )
            }
            if (error) {
              return (
                <div className="py-8 text-center">
                  <div className="text-destructive">{error}</div>
                </div>
              )
            }
            return (
              <>
                {/* Search summary */}
                <div className="text-sm text-muted-foreground">
                  {totalResults > 0 ? (
                    <>
                      Se encontraron {totalResults} resultados para &quot;{query}&quot;
                    </>
                  ) : (
                    <>No se encontraron resultados para &quot;{query}&quot;</>
                  )}
                </div>

                {/* Posts Results */}
                {results.posts.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">
                      Posts ({results.posts.length})
                    </h2>
                    <div className="space-y-4">
                      {results.posts.map((post) => (
                        <PostCard key={post.post_id} post={post} />
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {totalResults === 0 && (
                  <div className="py-12 text-center">
                    <div className="mb-4 text-muted-foreground">
                      No se encontraron resultados para tu búsqueda.
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Intenta con términos diferentes o más específicos.
                    </div>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {/* Initial state */}
      {!hasSearched && (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <div className="text-muted-foreground">
            Introduce un término de búsqueda para comenzar
          </div>
        </div>
      )}
    </div>
  )
}
