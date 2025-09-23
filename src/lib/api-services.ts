import { api } from "./api"
import { type ListPostsQuery } from "./api-types"
import type {
  User,
  Post,
  Comment,
  Category,
  Tag,
  Reaction,
  View,
  Bookmark,
  Follow,
  LoginDto,
  RegisterDto,
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  UpdateCommentDto,
  CreateReactionDto,
  DeleteReactionDto,
  CreateViewDto,
  CreateBookmarkDto,
  DeleteBookmarkDto,
  CreateFollowDto,
  DeleteFollowDto,
  PaginatedResponse,
  ListCommentsQuery,
  ListUsersQuery,
  ListCategoriesQuery,
  ListTagsQuery,
  ListReactionsQuery,
  ListViewsQuery,
  ListBookmarksQuery,
  ListFollowsQuery,
} from "./api-types"

// Helper function to build query parameters safely
const buildQueryParams = (params: Record<string, any>): URLSearchParams => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v.toString()))
      } else {
        searchParams.set(key, value.toString())
      }
    }
  })

  return searchParams
}

export type SearchPostsQuery = {
  page?: number
  limit?: number
  search?: string
  // Prefer slug filters to match index
  categorySlug?: string
  tagSlug?: string
  // Back-compat numeric ids (not recommended)
  categoryId?: number
  tagId?: number
  authorId?: string
  status?: "draft" | "published" | "archived"
  sortBy?: "created_at" | "updated_at" | "title"
  sortOrder?: "asc" | "desc"
}

// Auth API
export const authApi = {
  login: (data: LoginDto) =>
    api.post<{ accessToken: string; refreshToken: string }>("/auth/login", data, false),

  register: (data: RegisterDto) =>
    api.post<{ accessToken: string; refreshToken: string }>("/auth/register", data, false),

  // Refresh, logout need refresh token in Authorization header
  refresh: async () => {
    const rt =
      typeof window !== "undefined" ? window.localStorage.getItem("cq_refresh_token") : null
    if (!rt) throw new Error("Missing refresh token")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${rt}` },
    })
    if (!res.ok) throw new Error(await res.text())
    return (await res.json()) as { accessToken: string; refreshToken: string }
  },

  logout: async () => {
    const rt =
      typeof window !== "undefined" ? window.localStorage.getItem("cq_refresh_token") : null
    if (!rt) return { revoked: 0 }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const res = await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${rt}` },
    })
    if (!res.ok) throw new Error(await res.text())
    return (await res.json()) as { revoked: number }
  },

  logoutAll: () => api.post<{ revoked: number }>("/auth/logout-all"),

  getCurrentUser: () => api.get<User>("/auth/me"),

  discordLogin: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/discord`
  },
}

// Posts API
export const postsApi = {
  list: (query?: ListPostsQuery) => {
    const q = query || {}

    // Normalize single values to arrays for backend
    const categoryIds = q.categoryIds ?? (q.categoryId != null ? [q.categoryId] : undefined)
    const tagIds = q.tagIds ?? (q.tagId != null ? [q.tagId] : undefined)

    const params = buildQueryParams({
      page: q.page ?? 1,
      limit: Math.min(q.limit ?? 10, 50),
      search: q.search,
      status: q.status,
      sort: q.sort,
      // Arrays/slugs supported by backend DTO
      categoryIds,
      categorySlugs: q.categorySlugs,
      tagIds,
      tagSlugs: q.tagSlugs,
    })

    return api.get<PaginatedResponse<Post>>(`/posts?${params.toString()}`, false)
  },

  getBySlug: (slug: string) => api.get<Post>(`/posts/${slug}`, false),

  create: (data: CreatePostDto) => api.post<Post>("/posts", data),

  update: (id: number, data: UpdatePostDto) => api.patch<Post>(`/posts/${id}`, data),

  delete: (id: number) => api.del<{ deleted: boolean }>(`/posts/${id}`),

  listMine: (query?: ListPostsQuery) => {
    const params = buildQueryParams({
      page: query?.page ?? 1,
      limit: Math.min(query?.limit ?? 10, 50),
      search: query?.search,
      status: query?.status,
      sort: query?.sort,
    })

    return api.get<PaginatedResponse<Post>>(`/posts/me?${params.toString()}`)
  },
}

// Search API
export const searchApi = {
  searchPosts: async (query: SearchPostsQuery = {}): Promise<PaginatedResponse<Post>> => {
    const params = buildQueryParams(query)

    return await api.get<PaginatedResponse<Post>>(`/search?${params.toString()}`, false)
  },
}

// Uploads API
export const uploadsApi = {
  uploadImage: async (file: File) => {
    const fd = new FormData()
    fd.append("file", file)
    return api.postForm<{
      filename: string
      url: string
      path: string
      size: number
      mimeType: string
      ext: string
    }>("/uploads", fd, true)
  },
}

// Comments API
export const commentsApi = {
  list: (query?: ListCommentsQuery) => {
    const params = buildQueryParams({
      page: query?.page ?? 1,
      limit: Math.min(query?.limit ?? 20, 50),
      postId: query?.postId,
      authorId: query?.authorId,
      parentCommentId: query?.parentCommentId,
      status: query?.status,
      sort: query?.sort,
    })

    return api.get<PaginatedResponse<Comment>>(`/comments?${params.toString()}`, false)
  },

  create: (data: CreateCommentDto) => api.post<Comment>("/comments", data),

  update: (id: number, data: UpdateCommentDto) => api.patch<Comment>(`/comments/${id}`, data),

  delete: (id: number) => api.del<{ deleted: boolean }>(`/comments/${id}`),

  listMine: (query?: ListCommentsQuery) => {
    const params = buildQueryParams({
      page: query?.page ?? 1,
      limit: Math.min(query?.limit ?? 20, 50),
      status: query?.status,
      sort: query?.sort,
    })

    return api.get<PaginatedResponse<Comment>>(`/comments/me/mine?${params.toString()}`)
  },
}

// Users API
export const usersApi = {
  list: (query?: ListUsersQuery) => {
    const params = buildQueryParams({
      page: query?.page ?? 1,
      limit: Math.min(query?.limit ?? 20, 50),
      search: query?.search,
      role: query?.role,
      sortBy: query?.sortBy,
      sortOrder: query?.sortOrder,
    })

    return api.get<PaginatedResponse<User>>(`/users?${params.toString()}`, false)
  },

  getById: (id: string) => api.get<User>(`/users/${id}`, false),

  getByUsername: (username: string) => api.get<User>(`/users/by-username/${username}`, false),

  update: (id: string, data: Partial<User>) => api.patch<User>(`/users/${id}`, data),

  delete: (id: string) => api.del<{ deleted: boolean }>(`/users/${id}`),
}

// Categories API
export const categoriesApi = {
  list: (query?: ListCategoriesQuery) => {
    const params = buildQueryParams({
      page: query?.page ?? 1,
      limit: Math.min(query?.limit ?? 20, 50),
      search: query?.search,
      sortBy: query?.sortBy,
      sortOrder: query?.sortOrder,
    })

    return api.get<PaginatedResponse<Category>>(`/categories?${params.toString()}`, false)
  },

  getBySlug: (slug: string) => api.get<Category>(`/categories/${slug}`, false),

  create: (data: { name: string; description?: string }) => api.post<Category>("/categories", data),

  update: (id: number, data: { name?: string; description?: string }) =>
    api.patch<Category>(`/categories/${id}`, data),

  delete: (id: number) => api.del<{ deleted: boolean }>(`/categories/${id}`),
}

// Tags API
export const tagsApi = {
  list: (query?: ListTagsQuery) => {
    const params = buildQueryParams({
      page: query?.page ?? 1,
      limit: Math.min(query?.limit ?? 20, 50),
      search: query?.search,
      sortBy: query?.sortBy,
      sortOrder: query?.sortOrder,
    })

    return api.get<PaginatedResponse<Tag>>(`/tags?${params.toString()}`, false)
  },

  getBySlug: (slug: string) => api.get<Tag>(`/tags/${slug}`, false),

  create: (data: { name: string }) => api.post<Tag>("/tags", data),

  update: (id: number, data: { name?: string }) => api.patch<Tag>(`/tags/${id}`, data),

  delete: (id: number) => api.del<{ deleted: boolean }>(`/tags/${id}`),
}

// Reactions API
export const reactionsApi = {
  list: (query?: ListReactionsQuery) => {
    const params = new URLSearchParams()
    if (query?.page) params.set("page", query.page.toString())
    if (query?.limit) params.set("limit", query.limit.toString())
    if (query?.entityType) params.set("entityType", query.entityType)
    if (query?.entityId) params.set("entityId", query.entityId.toString())
    if (query?.userId) params.set("userId", query.userId)
    if (query?.type) params.set("type", query.type)

    return api.get<PaginatedResponse<Reaction>>(`/reactions?${params.toString()}`, false)
  },

  create: (data: CreateReactionDto) => api.post<Reaction>("/reactions", data),

  deleteById: (id: number) => api.del<{ deleted: boolean }>(`/reactions/${id}`),

  deleteByCombo: (data: DeleteReactionDto) => api.del<{ deleted: boolean }>("/reactions", data),

  listMine: (query?: ListReactionsQuery) => {
    const params = new URLSearchParams()
    if (query?.page) params.set("page", query.page.toString())
    if (query?.limit) params.set("limit", query.limit.toString())
    if (query?.entityType) params.set("entityType", query.entityType)
    if (query?.entityId) params.set("entityId", query.entityId.toString())
    if (query?.type) params.set("type", query.type)

    return api.get<PaginatedResponse<Reaction>>(`/me/reactions?${params.toString()}`)
  },
}

// Views API
export const viewsApi = {
  list: (query?: ListViewsQuery) => {
    const params = new URLSearchParams()
    if (query?.page) params.set("page", query.page.toString())
    if (query?.limit) params.set("limit", query.limit.toString())
    if (query?.entityType) params.set("entityType", query.entityType)
    if (query?.entityId) params.set("entityId", query.entityId.toString())
    if (query?.viewerUserId) params.set("viewerUserId", query.viewerUserId)

    return api.get<PaginatedResponse<View>>(`/views?${params.toString()}`, false)
  },

  create: (data: CreateViewDto) => api.post<View>("/views", data, false),

  listMine: (query?: ListViewsQuery) => {
    const params = new URLSearchParams()
    if (query?.page) params.set("page", query.page.toString())
    if (query?.limit) params.set("limit", query.limit.toString())
    if (query?.entityType) params.set("entityType", query.entityType)
    if (query?.entityId) params.set("entityId", query.entityId.toString())

    return api.get<PaginatedResponse<View>>(`/me/views?${params.toString()}`)
  },
}

// Bookmarks API
export const bookmarksApi = {
  list: (query?: ListBookmarksQuery) => {
    const params = buildQueryParams({
      page: query?.page ?? 1,
      limit: Math.min(query?.limit ?? 20, 50),
      userId: query?.userId,
    })

    return api.get<PaginatedResponse<Bookmark>>(`/bookmarks?${params.toString()}`, false)
  },

  create: (data: CreateBookmarkDto) => api.post<Bookmark>("/bookmarks", data),

  deleteById: (id: number) => api.del<{ deleted: boolean }>(`/bookmarks/${id}`),

  deleteByCombo: (data: DeleteBookmarkDto) => api.del<{ deleted: boolean }>("/bookmarks", data),

  listMine: (query?: ListBookmarksQuery) => {
    const params = buildQueryParams({
      page: query?.page ?? 1,
      limit: Math.min(query?.limit ?? 20, 50),
    })

    return api.get<PaginatedResponse<Bookmark>>(`/bookmarks/me?${params.toString()}`)
  },
}

// Follows API
export const followsApi = {
  list: (query?: ListFollowsQuery) => {
    const params = buildQueryParams({
      page: query?.page ?? 1,
      limit: Math.min(query?.limit ?? 20, 50),
      followerUserId: query?.followerUserId,
      entityType: query?.entityType,
      entityId: query?.entityId,
    })

    return api.get<PaginatedResponse<Follow>>(`/follows?${params.toString()}`, false)
  },

  create: (data: CreateFollowDto) => api.post<Follow>("/follows", data),

  deleteById: (id: number) => api.del<{ deleted: boolean }>(`/follows/${id}`),

  deleteByCombo: (data: DeleteFollowDto) => api.del<{ deleted: boolean }>("/follows", data),

  listMine: (query?: ListFollowsQuery) => {
    const params = new URLSearchParams()
    if (query?.page) params.set("page", query.page.toString())
    if (query?.limit) params.set("limit", query.limit.toString())
    if (query?.entityType) params.set("entityType", query.entityType)
    if (query?.entityId) params.set("entityId", query.entityId.toString())

    return api.get<PaginatedResponse<Follow>>(`/follows/me?${params.toString()}`)
  },
}
