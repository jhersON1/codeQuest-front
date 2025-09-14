import { ArrowUp, ArrowDown, MessageSquare, Share, Bookmark } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Post {
  id: number
  title: string
  content: string
  author: string
  community: string
  upvotes: number
  comments: number
  timeAgo: string
  image?: string | null
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="border-border bg-card transition-colors hover:border-primary/50">
      <div className="flex">
        <div className="flex flex-col items-center bg-muted/30 p-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <span className="my-1 text-sm font-semibold text-foreground">{post.upvotes}</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{post.community}</span>
            <span>•</span>
            <span>Por {post.author}</span>
            <span>•</span>
            <span>{post.timeAgo}</span>
          </div>

          <h2 className="mb-2 cursor-pointer text-lg font-semibold text-foreground transition-colors hover:text-primary">
            {post.title}
          </h2>

          <p className="mb-3 line-clamp-3 text-muted-foreground">{post.content}</p>

          {post.image && (
            <div className="mb-3">
              <img
                src={post.image || "/placeholder.svg"}
                alt="Post image"
                className="h-auto max-w-full rounded-lg border border-border"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {post.comments} comentarios
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              <Share className="mr-2 h-4 w-4" />
              Compartir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
