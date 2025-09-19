// Tipos para el API
export interface User {
  user_id: string
  username: string
  email: string
  display_name?: string
  avatar_url?: string
  bio?: string
  role: "subscriber" | "author" | "admin"
  created_at: string
  updated_at: string
}

export interface Post {
  post_id: number
  title: string
  slug: string
  excerpt?: string
  body: string
  status: "draft" | "published" | "archived"
  featured_image_url?: string
  author: User
  category?: Category
  tags?: Tag[]
  created_at: string
  updated_at: string
  commentCount?: number
  likeCount?: number
  _count?: {
    comments: number
    reactions: number
    views: number
    bookmarks: number
  }
}

export interface Comment {
  comment_id: number
  body: string
  author: User
  post: Post
  parent_comment_id?: number
  parent_comment?: Comment
  replies?: Comment[]
  created_at: string
  updated_at: string
  _count?: {
    reactions: number
    replies: number
  }
}

export interface Category {
  category_id: number
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
  _count?: {
    posts: number
  }
}

export interface Tag {
  tag_id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
  _count?: {
    posts: number
  }
}

export interface Reaction {
  reaction_id: number
  type: "like" | "dislike" | "love" | "laugh" | "wow" | "sad" | "angry"
  entity_type: "post" | "comment"
  entity_id: number
  user: User
  created_at: string
}

export interface View {
  view_id: number
  entity_type: "post"
  entity_id: number
  viewer_user_id?: string
  created_at: string
}

export interface Bookmark {
  bookmark_id: number
  post: Post
  user: User
  created_at: string
}

export interface Follow {
  follow_id: number
  entity_type: "user" | "category" | "tag"
  entity_id: number | string
  follower: User
  created_at: string
}

// DTOs para requests
export interface LoginDto {
  username: string
  password: string
}

export interface RegisterDto {
  username: string
  email: string
  password: string // minimum 8 characters
  display_name?: string
}

export interface CreatePostDto {
  title: string
  body: string
  excerpt?: string
  categoryIds?: number[]
  tagIds?: number[]
  status?: "draft" | "published"
  publishedAt?: string
  featuredImageUrl?: string
}

export interface UpdatePostDto {
  title?: string
  body?: string
  excerpt?: string
  categoryIds?: number[]
  tagIds?: number[]
  status?: "draft" | "published"
  publishedAt?: string
  featuredImageUrl?: string
}

export interface CreateCommentDto {
  postId: number
  body: string
  parentCommentId?: number
}

export interface UpdateCommentDto {
  body: string
}

export interface CreateReactionDto {
  entityType: "post" | "comment"
  entityId: number
  type: "like" | "dislike" | "love" | "laugh" | "wow" | "sad" | "angry"
}

export interface DeleteReactionDto {
  entityType: "post" | "comment"
  entityId: number
  type: "like" | "dislike" | "love" | "laugh" | "wow" | "sad" | "angry"
}

export interface CreateViewDto {
  entityType: "post"
  entityId: number
}

export interface CreateBookmarkDto {
  postId: number
}

export interface DeleteBookmarkDto {
  postId: number
}

export interface CreateFollowDto {
  entityType: "user" | "category" | "tag"
  entityId: number | string
}

export interface DeleteFollowDto {
  entityType: "user" | "category" | "tag"
  entityId: number | string
}

// Tipos para respuestas paginadas
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    hasNextPage: boolean
  }
}

// Query parameters para listados
export interface ListPostsQuery {
  page?: number
  limit?: number
  search?: string
  categoryId?: number
  tagId?: number
  authorId?: string
  status?: "draft" | "published" | "archived"
  sortBy?: "created_at" | "updated_at" | "title"
  sortOrder?: "asc" | "desc"
}

export interface ListCommentsQuery {
  page?: number
  limit?: number
  postId?: number
  authorId?: string
  parentCommentId?: number
  status?: "approved" | "pending" | "spam"
  sort?: "created_at_desc" | "created_at_asc"
}

export interface ListUsersQuery {
  page?: number
  limit?: number
  search?: string
  role?: "subscriber" | "author" | "admin"
  sortBy?: "created_at" | "updated_at" | "username"
  sortOrder?: "asc" | "desc"
}

export interface ListCategoriesQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: "name" | "created_at"
  sortOrder?: "asc" | "desc"
}

export interface ListTagsQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: "name" | "created_at"
  sortOrder?: "asc" | "desc"
}

export interface ListReactionsQuery {
  page?: number
  limit?: number
  entityType?: "post" | "comment"
  entityId?: number
  userId?: string
  type?: "like" | "dislike" | "love" | "laugh" | "wow" | "sad" | "angry"
}

export interface ListViewsQuery {
  page?: number
  limit?: number
  entityType?: "post"
  entityId?: number
  viewerUserId?: string
}

export interface ListBookmarksQuery {
  page?: number
  limit?: number
  userId?: string
}

export interface ListFollowsQuery {
  page?: number
  limit?: number
  followerUserId?: string
  entityType?: "user" | "category" | "tag"
  entityId?: number | string
}
