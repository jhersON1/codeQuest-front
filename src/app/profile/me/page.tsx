"use client"

import {
  User,
  Settings,
  BookOpen,
  Heart,
  Eye,
  Edit3,
  Trash2,
  Plus,
  BookmarkIcon,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { postsApi, commentsApi, bookmarksApi, reactionsApi } from "@/lib/api-services"
import type { Post, Comment, Bookmark, Reaction } from "@/lib/api-types"
import { useAuth } from "@/lib/auth-context"

export default function ProfileMePage() {
  const { user, loading: authLoading } = useAuth()

  const [activeTab, setActiveTab] = useState("posts")
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [_myComments, setMyComments] = useState<Comment[]>([])
  const [myBookmarks, setMyBookmarks] = useState<Bookmark[]>([])
  const [_myReactions, setMyReactions] = useState<Reaction[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && activeTab) {
      loadTabData(activeTab)
    }
  }, [user, activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadTabData = async (tab: string) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      switch (tab) {
        case "posts":
          const postsRes = await postsApi.listMine({ page: 1, limit: 20 })
          setMyPosts(postsRes.data)
          break
        case "comments":
          const commentsRes = await commentsApi.listMine({ page: 1, limit: 20 })
          setMyComments(commentsRes.data)
          break
        case "bookmarks":
          const bookmarksRes = await bookmarksApi.listMine({ page: 1, limit: 20 })
          setMyBookmarks(bookmarksRes.data)
          break
        case "reactions":
          const reactionsRes = await reactionsApi.listMine({ page: 1, limit: 20 })
          setMyReactions(reactionsRes.data)
          break
      }
    } catch (err: any) {
      setError(err?.message || `Error al cargar ${tab}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este post?")) return

    try {
      await postsApi.delete(postId)
      setMyPosts((prev) => prev.filter((post) => post.post_id !== postId))
    } catch (err: any) {
      setError(err?.message || "Error al eliminar el post")
    }
  }

  const handleRemoveBookmark = async (bookmarkId: number) => {
    try {
      await bookmarksApi.deleteById(bookmarkId)
      setMyBookmarks((prev) => prev.filter((bookmark) => bookmark.bookmark_id !== bookmarkId))
    } catch (err: any) {
      setError(err?.message || "Error al eliminar el marcador")
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "author":
        return "Autor"
      case "subscriber":
        return "Suscriptor"
      default:
        return role
    }
  }

  const _getReactionEmoji = (type: string) => {
    switch (type) {
      case "like":
        return "👍"
      case "dislike":
        return "👎"
      case "love":
        return "❤️"
      case "laugh":
        return "😂"
      case "wow":
        return "😮"
      case "sad":
        return "😢"
      case "angry":
        return "😠"
      default:
        return type
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name || user.username}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {user.display_name || user.username}
                </h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/profile/edit">
                <Settings className="mr-2 h-4 w-4" />
                Editar perfil
              </Link>
            </Button>
          </div>
          {user.bio && <p className="mt-4 text-muted-foreground">{user.bio}</p>}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-destructive/30 bg-destructive/10">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 flex space-x-1 rounded-lg bg-muted p-1">
            {[
              { id: "posts", label: "Posts", icon: BookOpen },
              { id: "comments", label: "Comentarios", icon: Heart },
              { id: "bookmarks", label: "Guardados", icon: BookmarkIcon },
              { id: "reactions", label: "Reacciones", icon: Heart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Mis Posts</h2>
                <Button asChild>
                  <Link href="/create-post">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Post
                  </Link>
                </Button>
              </div>

              {(() => {
                if (loading) {
                  return (
                    <div className="py-8 text-center text-muted-foreground">Cargando posts...</div>
                  )
                }
                if (myPosts.length === 0) {
                  return (
                    <div className="py-8 text-center">
                      <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 text-lg font-medium">No tienes posts aún</h3>
                      <p className="mb-4 text-muted-foreground">
                        ¡Crea tu primer post y comparte tus ideas!
                      </p>
                      <Button asChild>
                        <Link href="/create-post">Crear mi primer post</Link>
                      </Button>
                    </div>
                  )
                }
                return (
                  <div className="space-y-4">
                    {myPosts.map((post) => (
                      <Card key={post.post_id} className="border-border">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <Link href={`/posts/${post.slug}`} className="hover:underline">
                                  <h3 className="text-lg font-semibold">{post.title}</h3>
                                </Link>
                                <span
                                  className={`inline-block rounded-full px-2 py-1 text-xs ${
                                    post.status === "published"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {(() => {
                                    if (post.status === "published") return "Publicado"
                                    if (post.status === "draft") return "Borrador"
                                    return "Archivado"
                                  })()}
                                </span>
                              </div>

                              {post.excerpt && (
                                <p className="mb-3 line-clamp-2 text-muted-foreground">
                                  {post.excerpt}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formatDate(post.created_at)}</span>
                                {post._count && (
                                  <>
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-4 w-4" />
                                      {post._count.views || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Heart className="h-4 w-4" />
                                      {post.likeCount || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="h-4 w-4" />
                                      {post.commentCount || 0}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="ml-4 flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/posts/${post.slug}/edit`}>
                                  <Edit3 className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePost(post.post_id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {activeTab === "bookmarks" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Posts Guardados</h2>

              {(() => {
                if (loading) {
                  return (
                    <div className="py-8 text-center text-muted-foreground">
                      Cargando guardados...
                    </div>
                  )
                }
                if (myBookmarks.length === 0) {
                  return (
                    <div className="py-8 text-center">
                      <BookmarkIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 text-lg font-medium">No tienes posts guardados</h3>
                      <p className="text-muted-foreground">
                        Guarda posts interesantes para leerlos más tarde
                      </p>
                    </div>
                  )
                }
                return (
                  <div className="space-y-4">
                    {myBookmarks.map((bookmark) => (
                      <Card key={bookmark.bookmark_id} className="border-border">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Link
                                href={`/posts/${bookmark.post.slug}`}
                                className="font-semibold hover:underline"
                              >
                                {bookmark.post.title}
                              </Link>
                              {bookmark.post.excerpt && (
                                <p className="mt-2 line-clamp-2 text-muted-foreground">
                                  {bookmark.post.excerpt}
                                </p>
                              )}
                              <div className="mt-2 text-sm text-muted-foreground">
                                Por{" "}
                                {bookmark.post.author.display_name || bookmark.post.author.username}{" "}
                                • {formatDate(bookmark.created_at)}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveBookmark(bookmark.bookmark_id)}
                              className="ml-4"
                            >
                              <BookmarkIcon className="h-4 w-4 fill-current" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
