"use client"

import { User, Edit, Mail, Calendar, Shield } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PostCard } from "@/features/post/post-card"
import { postsApi, commentsApi, bookmarksApi } from "@/lib/api-services"
import type { Post, Comment, Bookmark } from "@/lib/api-types"
import { useAuth } from "@/lib/auth-context"

type TabType = "posts" | "comments" | "bookmarks"

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>("posts")
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !authLoading) {
      loadData()
    }
  }, [user, authLoading, activeTab])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      switch (activeTab) {
        case "posts":
          const postsRes = await postsApi.listMine({ page: 1, limit: 20 })
          setPosts(postsRes.data)
          break
        case "comments":
          const commentsRes = await commentsApi.listMine({ page: 1, limit: 20 })
          setComments(commentsRes.data)
          break
        case "bookmarks":
          const bookmarksRes = await bookmarksApi.listMine({ page: 1, limit: 20 })
          setBookmarks(bookmarksRes.data)
          break
      }
    } catch (err: any) {
      setError(err?.message || `Error al cargar ${activeTab}`)
    } finally {
      setLoading(false)
    }
  }

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
          <p className="mb-4 text-muted-foreground">Debes iniciar sesión para ver tu perfil</p>
          <Link href="/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  }

  const getRoleDisplay = (role: string) => {
    const roles = {
      admin: { label: "Administrador", color: "text-red-400" },
      author: { label: "Autor", color: "text-green-400" },
      subscriber: { label: "Suscriptor", color: "text-blue-400" },
    }
    return roles[role as keyof typeof roles] || { label: role, color: "text-muted-foreground" }
  }

  const roleInfo = getRoleDisplay(user.role)

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name || user.username}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-primary-foreground" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-foreground">
                    {user.display_name || user.username}
                  </CardTitle>
                  <CardDescription className="text-base">@{user.username}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar perfil
                </Button>
              </div>

              {user.bio && <p className="text-muted-foreground">{user.bio}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Miembro desde {formatDate(user.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span className={roleInfo.color}>{roleInfo.label}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { key: "posts", label: "Mis Posts", count: posts.length },
            { key: "comments", label: "Mis Comentarios", count: comments.length },
            { key: "bookmarks", label: "Guardados", count: bookmarks.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-1 text-xs">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {(() => {
          if (loading) {
            return (
              <div className="py-8 text-center text-muted-foreground">Cargando {activeTab}...</div>
            )
          }
          if (error) {
            return <div className="py-8 text-center text-destructive">{error}</div>
          }
          return (
            <>
              {activeTab === "posts" && (
                <>
                  {posts.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="mb-4 text-muted-foreground">Aún no has creado ningún post</p>
                      <Link href="/create-post">
                        <Button>Crear tu primer post</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <PostCard key={post.post_id} post={post} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === "comments" && (
                <>
                  {comments.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">Aún no has hecho ningún comentario</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <Card key={comment.comment_id} className="border-border bg-card">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">
                                Comentario en:{" "}
                                <Link
                                  href={`/posts/${comment.post.slug}`}
                                  className="text-primary hover:underline"
                                >
                                  {comment.post.title}
                                </Link>
                              </div>
                              <p className="text-foreground">{comment.body}</p>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(comment.created_at)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === "bookmarks" && (
                <>
                  {bookmarks.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No has guardado ningún post</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookmarks.map((bookmark) => (
                        <PostCard key={bookmark.bookmark_id} post={bookmark.post} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}
