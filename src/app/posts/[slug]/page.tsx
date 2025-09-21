"use client"

import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Bookmark,
  Share,
  Eye,
  User,
  Calendar,
  Tag,
  Folder,
  Send,
  Edit3,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PostCard } from "@/features/post/post-card"
import { postsApi, commentsApi, reactionsApi, bookmarksApi, viewsApi } from "@/lib/api-services"
import type { Post, Comment, CreateCommentDto, UpdateCommentDto } from "@/lib/api-types"
import { useAuth } from "@/lib/auth-context"

export default function PostDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const slug = params?.slug as string
  const router = useRouter()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Interaction states
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [likeCount, setLikeCount] = useState<number>(0)
  const [likeBusy, setLikeBusy] = useState(false)

  // Comment form states
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editCommentText, setEditCommentText] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)

  // Related posts
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [_relatedLoading, setRelatedLoading] = useState(false)

  useEffect(() => {
    if (slug) {
      loadPost()
    }
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (post) {
      registerView()
      loadComments()
      loadRelated()
      // Sync if I already liked/bookmarked this post
      syncMyReaction()
    }
  }, [post]) // eslint-disable-line react-hooks/exhaustive-deps

  const syncMyReaction = async () => {
    try {
      if (!user || !post) return
      const res = await reactionsApi.listMine({
        page: 1,
        limit: 1,
        entityType: "post",
        entityId: post.post_id,
        type: "like",
      })
      setIsLiked((res.data?.length || 0) > 0)
    } catch {
      // silent
    }
  }

  const loadPost = async () => {
    try {
      const postData = await postsApi.getBySlug(slug)
      setPost(postData)
      setLikeCount(postData.likeCount || 0)
    } catch (err: any) {
      setError(err?.message || "Post no encontrado")
    } finally {
      setLoading(false)
    }
  }

  const loadRelated = async () => {
    if (!post) return
    setRelatedLoading(true)
    try {
      const categoryId = post.category?.category_id
      let data: Post[] = []
      if (categoryId) {
        const res = await postsApi.list({ page: 1, limit: 6, categoryId })
        data = res.data
      } else if (post.tags && post.tags.length > 0) {
        // fallback por primer tag
        const res = await postsApi.list({ page: 1, limit: 6, tagId: post.tags[0].tag_id })
        data = res.data
      }
      setRelatedPosts(data.filter((p) => p.post_id !== post.post_id))
    } catch (err) {
      // silencioso
      console.error("Error loading related posts:", err)
    } finally {
      setRelatedLoading(false)
    }
  }

  const loadComments = async () => {
    if (!post) return

    setCommentsLoading(true)
    try {
      const commentsData = await commentsApi.list({
        postId: post.post_id,
        page: 1,
        limit: 50,
        sort: "created_at_asc",
      })
      setComments(commentsData.data)
    } catch (err) {
      console.error("Error loading comments:", err)
    } finally {
      setCommentsLoading(false)
    }
  }

  const registerView = async () => {
    if (!post) return

    try {
      await viewsApi.create({
        entityType: "post",
        entityId: post.post_id,
      })
    } catch (err) {
      // Views are optional, don't show error to user
      console.error("Error registering view:", err)
    }
  }

  const handleLike = async () => {
    if (!user || !post || likeBusy) return

    setActionMessage(null)
    setLikeBusy(true)
    const startedLiked = isLiked
    try {
      if (isLiked) {
        // Optimistic update first
        setIsLiked(false)
        setLikeCount((c) => Math.max(0, c - 1))
        await reactionsApi.deleteByCombo({
          entityType: "post",
          entityId: post.post_id,
          type: "like",
        })
        setActionMessage("Like eliminado")
      } else {
        // Optimistic update first
        setIsLiked(true)
        setLikeCount((c) => c + 1)
        await reactionsApi.create({
          entityType: "post",
          entityId: post.post_id,
          type: "like",
        })
        setActionMessage("¡Te gusta este post!")
      }

      setTimeout(() => setActionMessage(null), 3000)
    } catch (error: any) {
      const msg = String(error?.message || "Error")
      const notFound = /404|no encontrada|not found/i.test(msg)
      if (!notFound) {
        // Revert optimistic update for other errors
        if (startedLiked) {
          // We tried to unlike; restore like
          setIsLiked(true)
          setLikeCount((c) => c + 1)
        } else {
          // We tried to like; remove like
          setIsLiked(false)
          setLikeCount((c) => Math.max(0, c - 1))
        }
        setActionMessage(msg || "Error al procesar la reaccion")
        setTimeout(() => setActionMessage(null), 3000)
      } else {
        // Swallow not-found when unliking — state already reflects backend
        setActionMessage(null)
      }
    } finally {
      setLikeBusy(false)
    }
  }

  const handleBookmark = async () => {
    if (!user || !post) return

    setActionMessage(null)
    try {
      if (isBookmarked) {
        await bookmarksApi.deleteByCombo({ postId: post.post_id })
        setIsBookmarked(false)
        setActionMessage("Eliminado de guardados")
      } else {
        await bookmarksApi.create({ postId: post.post_id })
        setIsBookmarked(true)
        setActionMessage("Guardado en marcadores")
      }

      setTimeout(() => setActionMessage(null), 3000)
    } catch (error: any) {
      setActionMessage(error?.message || "Error al guardar")
      setTimeout(() => setActionMessage(null), 3000)
    }
  }

  const handleShare = async () => {
    if (!post) return

    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.body.substring(0, 100) + "...",
          url: url,
        })
      } catch (_error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setActionMessage("Enlace copiado al portapapeles")
        setTimeout(() => setActionMessage(null), 3000)
      } catch (_error) {
        console.error("Error copying to clipboard:", _error)
      }
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !post || !newComment.trim()) return

    setCommentLoading(true)
    try {
      const commentData: CreateCommentDto = {
        postId: post.post_id,
        body: newComment.trim(),
        parentCommentId: replyTo || undefined,
      }

      const createdComment = await commentsApi.create(commentData)

      // Add comment to list
      setComments((prev) => [...prev, createdComment])
      setNewComment("")
      setReplyTo(null)
      setActionMessage("Comentario publicado")
      setTimeout(() => setActionMessage(null), 3000)
    } catch (error: any) {
      setActionMessage(error?.message || "Error al publicar comentario")
      setTimeout(() => setActionMessage(null), 3000)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleEditComment = async (commentId: number) => {
    if (!editCommentText.trim()) return

    setCommentLoading(true)
    try {
      const updateData: UpdateCommentDto = {
        body: editCommentText.trim(),
      }

      const updatedComment = await commentsApi.update(commentId, updateData)

      // Update comment in list
      setComments((prev) =>
        prev.map((comment) => (comment.comment_id === commentId ? updatedComment : comment))
      )

      setEditingComment(null)
      setEditCommentText("")
      setActionMessage("Comentario actualizado")
      setTimeout(() => setActionMessage(null), 3000)
    } catch (error: any) {
      setActionMessage(error?.message || "Error al actualizar comentario")
      setTimeout(() => setActionMessage(null), 3000)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) return

    try {
      await commentsApi.delete(commentId)
      setComments((prev) => prev.filter((comment) => comment.comment_id !== commentId))
      setActionMessage("Comentario eliminado")
      setTimeout(() => setActionMessage(null), 3000)
    } catch (error: any) {
      setActionMessage(error?.message || "Error al eliminar comentario")
      setTimeout(() => setActionMessage(null), 3000)
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.comment_id)
    setEditCommentText(comment.body)
  }

  const cancelEdit = () => {
    setEditingComment(null)
    setEditCommentText("")
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const canManagePost =
    !!user && !!post && (user.role === "admin" || user.user_id === post.author?.user_id)

  const handleDeletePost = async () => {
    if (!post || deleteBusy) return
    if (!confirm("¿Eliminar este post?")) return
    try {
      setDeleteBusy(true)
      await postsApi.delete(post.post_id)
      setActionMessage("Post eliminado")
      setTimeout(() => setActionMessage(null), 2000)
      router.push("/")
    } catch (e: any) {
      setActionMessage(e?.message || "No se pudo eliminar")
      setTimeout(() => setActionMessage(null), 3000)
    } finally {
      setDeleteBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-muted-foreground">Cargando post...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Post no encontrado</h1>
          <p className="mb-4 text-muted-foreground">{error || "El post que buscas no existe"}</p>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Volver al inicio
        </Link>

        {canManagePost && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/posts/${post.slug}/edit`}>
                <Edit3 className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={handleDeletePost}
              disabled={deleteBusy}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteBusy ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        )}
      </div>

      {/* Action Message */}
      {actionMessage && (
        <Alert className="border-primary/30 bg-primary/10">
          <AlertDescription>{actionMessage}</AlertDescription>
        </Alert>
      )}

      {/* Post Content */}
      <article className="space-y-6">
        <Card className="border-border bg-card">
          <CardContent className="space-y-6 pt-6">
            {/* Post Header */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">{post.title}</h1>

              {/* Post Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {post.author?.avatar_url ? (
                      <img
                        src={post.author.avatar_url}
                        alt={post.author.display_name || post.author.username}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <span className="font-medium text-foreground">
                      {post.author?.display_name || post.author?.username || "Usuario"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {post._count?.views && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post._count.views}
                    </div>
                  )}
                </div>
              </div>

              {/* Category and Tags */}
              <div className="flex items-center gap-3">
                {post.category && (
                  <div className="flex items-center gap-1">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <Link
                      href={`/categories/${post.category.slug}`}
                      className="text-primary hover:underline"
                    >
                      {post.category.name}
                    </Link>
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag.tag_id}
                          href={`/tags/${tag.slug}`}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/20"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Featured image */}
            {post.featured_image_url && (
              <div>
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="max-h-[480px] w-full rounded-md object-cover"
                />
              </div>
            )}

            {/* Post Body */}
            <div className="prose prose-slate max-w-none">
              {post.body.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed text-foreground">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={!user}
                  className={`text-muted-foreground hover:bg-primary/10 hover:text-primary ${
                    isLiked ? "text-red-500 hover:text-red-600" : ""
                  }`}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  {likeCount}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  onClick={() =>
                    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {post.commentCount || 0}
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
                >
                  <Share className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  disabled={!user}
                  className={`text-muted-foreground hover:bg-primary/10 hover:text-primary ${
                    isBookmarked ? "text-yellow-500 hover:text-yellow-600" : ""
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Otros posts de interés</h2>
            <div className="space-y-4">
              {relatedPosts.slice(0, 3).map((rp) => (
                <PostCard key={rp.post_id} post={rp} />
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div id="comments" className="space-y-6">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Comentarios ({comments.length})
              </h2>

              {/* Comment Form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-6 space-y-4">
                  {replyTo && (
                    <div className="text-sm text-muted-foreground">
                      Respondiendo a comentario...{" "}
                      <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="text-primary hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="comment">Tu comentario</Label>
                    <textarea
                      id="comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="¿Qué opinas sobre este post?"
                      rows={4}
                      className="w-full resize-none rounded-md border border-border bg-card p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={commentLoading}>
                    <Send className="mr-2 h-4 w-4" />
                    {commentLoading ? "Publicando..." : "Publicar comentario"}
                  </Button>
                </form>
              ) : (
                <div className="mb-6 rounded-lg bg-muted/50 p-4 text-center">
                  <p className="mb-2 text-muted-foreground">Inicia sesión para comentar</p>
                  <Button asChild>
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {commentsLoading && (
                  <div className="py-4 text-center text-muted-foreground">
                    Cargando comentarios...
                  </div>
                )}
                {!commentsLoading && comments.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p>Aún no hay comentarios. ¡Sé el primero en comentar!</p>
                  </div>
                )}
                {!commentsLoading &&
                  comments.length > 0 &&
                  comments.map((comment) => (
                    <div
                      key={comment.comment_id}
                      className="space-y-3 border-l-2 border-border pl-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {comment.author?.avatar_url ? (
                            <img
                              src={comment.author.avatar_url}
                              alt={comment.author.display_name || comment.author.username}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                          )}
                          <span className="font-medium text-foreground">
                            {comment.author?.display_name || comment.author?.username || "Usuario"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>

                        {user && comment.author && comment.author.user_id === user.user_id && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(comment)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.comment_id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {editingComment === comment.comment_id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-md border border-border bg-card p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditComment(comment.comment_id)}
                              disabled={commentLoading}
                            >
                              Guardar
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-foreground">{comment.body}</p>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </article>
    </div>
  )
}
