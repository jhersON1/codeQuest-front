"use client"

import { MessageSquare, Share, Bookmark, Heart, Eye, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { reactionsApi, bookmarksApi } from "@/lib/api-services"
import type { Post } from "@/lib/api-types"
import { useAuth } from "@/lib/auth-context"

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState<number>(post.likeCount || 0)
  const [likeBusy, setLikeBusy] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // Sync initial liked state from API so the UI reflects server truth
  useEffect(() => {
    let cancelled = false
    const sync = async () => {
      try {
        if (user) {
          const res = await reactionsApi.listMine({
            page: 1,
            limit: 1,
            entityType: "post",
            entityId: post.post_id,
            type: "like",
          })
          if (!cancelled) setIsLiked((res.data?.length || 0) > 0)
        } else if (!cancelled) {
          setIsLiked(false)
        }
      } catch {
        // ignore; keep default false
      }
    }
    sync()
    return () => {
      cancelled = true
    }
  }, [user, post.post_id])

  const handleLike = async () => {
    if (!user) return
    if (likeBusy) return
    setActionMessage(null)
    setLikeBusy(true)
    const startedLiked = isLiked

    try {
      if (isLiked) {
        // Optimistic update
        setIsLiked(false)
        setLikeCount((c) => Math.max(0, c - 1))
        await reactionsApi.deleteByCombo({
          entityType: "post",
          entityId: post.post_id,
          type: "like",
        })
        setActionMessage("Like eliminado")
      } else {
        // Optimistic update
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
        // Swallow not-found when unliking — state is already correct
        setActionMessage(null)
      }
    } finally {
      setLikeBusy(false)
    }
  }

  const handleBookmark = async () => {
    if (!user) return
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
    const url = `${window.location.origin}/posts/${post.slug}`

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

  const formatDate = (date: string) => {
    return new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(
      Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day"
    )
  }

  return (
    <Card className="border-border bg-card transition-colors hover:border-primary/50">
      <div className="space-y-3 p-4">
        {/* Author info */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.display_name || post.author.username}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                <User className="h-3 w-3 text-primary" />
              </div>
            )}
            <span className="font-medium text-foreground">
              {post.author?.display_name || post.author?.username || "Usuario"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            {post.category && (
              <Link
                href={`/categories/${post.category.slug}`}
                className="transition-colors hover:text-primary"
              >
                {post.category.name}
              </Link>
            )}
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>

        {/* Post content */}
        <div>
          <Link href={`/posts/${post.slug}`} className="group block">
            <h2 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h2>
          </Link>

          {post.featured_image_url && (
            <Link href={`/posts/${post.slug}`}>
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="mb-3 h-48 w-full rounded-md object-cover"
              />
            </Link>
          )}

          {post.excerpt ? (
            <p className="mb-3 line-clamp-3 text-muted-foreground">{post.excerpt}</p>
          ) : (
            <>
              {/* Si no hay resumen, mostramos un fallback breve del contenido */}
              <p className="mb-3 line-clamp-3 text-muted-foreground">
                {post.body.length > 150 ? post.body.substring(0, 150) + "..." : post.body}
              </p>
            </>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.tag_id}
                  href={`/tags/${tag.slug}`}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/20"
                >
                  #{tag.name}
                </Link>
              ))}
              {post.tags.length > 3 && (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  +{post.tags.length - 3} más
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border pt-2">
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

            <Link href={`/posts/${post.slug}#comments`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {post.commentCount || 0}
              </Button>
            </Link>

            {post._count?.views && (
              <div className="flex items-center gap-1 px-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                {post._count.views}
              </div>
            )}
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

        {/* Action message */}
        {actionMessage && (
          <div className="rounded bg-muted/50 px-2 py-1 text-center text-xs text-muted-foreground">
            {actionMessage}
          </div>
        )}
      </div>
    </Card>
  )
}
