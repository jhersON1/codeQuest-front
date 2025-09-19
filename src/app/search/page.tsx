"use client"

import { Search } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostCard } from "@/features/post/post-card"
import { postsApi, usersApi } from "@/lib/api-services"
import type { Post, User } from "@/lib/api-types"

type SearchResult = {
  posts: Post[]
  users: User[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult>({ posts: [], users: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(!!initialQuery)

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const [postsRes, usersRes] = await Promise.all([
        postsApi.list({ search: searchQuery.trim(), limit: 20 }),
        usersApi.list({ search: searchQuery.trim(), limit: 10 }),
      ])

      setResults({
        posts: postsRes.data,
        users: usersRes.data,
      })
    } catch (e: any) {
      setError(e?.message || "Error al realizar la búsqueda")
      setResults({ posts: [], users: [] })
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

  const totalResults = results.posts.length + results.users.length

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Buscar</h1>

        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar posts, usuarios..."
            className="py-3 pr-20 pl-12"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute top-1/2 right-2 -translate-y-1/2 transform"
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </form>
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

                {/* Users Results */}
                {results.users.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">
                      Usuarios ({results.users.length})
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {results.users.map((user) => (
                        <div
                          key={user.user_id}
                          className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
                        >
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.display_name || user.username}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                                <span className="text-sm font-medium text-primary">
                                  {(user.display_name || user.username).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-foreground">
                                {user.display_name || user.username}
                              </div>
                              <div className="text-sm text-muted-foreground">@{user.username}</div>
                              {user.bio && (
                                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                  {user.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
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
