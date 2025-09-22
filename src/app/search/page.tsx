"use client"

import { Search } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostCard } from "@/features/post/post-card"
import { searchApi } from "@/lib/api-services"
import type { Category, PaginatedResponse, Post, Tag } from "@/lib/api-types"

type SearchResult = {
  posts: Post[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult>({ posts: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(!!initialQuery)
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)
  const [selectedTag, setSelectedTag] = useState<number | undefined>(undefined)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

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

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const [postsRes] = await Promise.all([
        searchApi.searchPosts({
          search: searchQuery.trim(),
          limit: 20,
          categoryId: selectedCategory,
          tagId: selectedTag,
        }),
      ])

      if (!postsRes) {
        setResults({
          posts: [],
        })
      }

      setResults({
        posts: postsRes.data,
      })
    } catch (e: any) {
      setError(e?.message || "Error al realizar la búsqueda")
      setResults({ posts: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setQuery(searchInput.trim())
      performSearch(searchInput.trim())

      // Update URL
      const newUrl = `/search?q=${encodeURIComponent(searchInput.trim())}`
      window.history.pushState({}, "", newUrl)
    }
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
                onChange={(e) =>
                  setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)
                }
              >
                <option value="">Todas</option>
                {categories
                  .filter((cat) => cat && cat.category_id != null)
                  .map((cat, idx) => (
                    <option key={cat.category_id ?? idx} value={cat.category_id}>
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
                onChange={(e) =>
                  setSelectedTag(e.target.value ? Number(e.target.value) : undefined)
                }
              >
                <option value="">Todos</option>
                {tags
                  .filter((tag) => tag && tag.tag_id != null)
                  .map((tag, idx) => (
                    <option key={tag.tag_id ?? idx} value={tag.tag_id}>
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
