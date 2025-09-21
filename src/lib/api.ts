export type Tokens = { accessToken: string | null; refreshToken: string | null }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

let accessToken: string | null = null

function getStoredTokens(): Tokens {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null }
  try {
    const at = window.localStorage.getItem("cq_access_token")
    const rt = window.localStorage.getItem("cq_refresh_token")
    return { accessToken: at, refreshToken: rt }
  } catch {
    return { accessToken: null, refreshToken: null }
  }
}

export function setTokens(tokens: Tokens) {
  if (typeof window === "undefined") return
  accessToken = tokens.accessToken
  if (tokens.accessToken) window.localStorage.setItem("cq_access_token", tokens.accessToken)
  else window.localStorage.removeItem("cq_access_token")
  if (tokens.refreshToken) window.localStorage.setItem("cq_refresh_token", tokens.refreshToken)
  else window.localStorage.removeItem("cq_refresh_token")
}

export function clearTokens() {
  setTokens({ accessToken: null, refreshToken: null })
}

async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken } = getStoredTokens()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshToken}` },
    })
    if (!res.ok) return false
    const data = (await res.json()) as { accessToken?: string; refreshToken?: string }
    if (data.accessToken) {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken ?? refreshToken })
      accessToken = data.accessToken
      return true
    }
    return false
  } catch {
    return false
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: boolean }
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`
  const headers = new Headers(init?.headers)
  if (init?.auth !== false) {
    if (!accessToken) accessToken = getStoredTokens().accessToken
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`)
  }
  const res = await fetch(url, { ...init, headers })
  if (res.status === 401 && init?.auth !== false) {
    const ok = await refreshAccessToken()
    if (ok) {
      const headers2 = new Headers(init?.headers)
      const at = getStoredTokens().accessToken
      if (at) headers2.set("Authorization", `Bearer ${at}`)
      const res2 = await fetch(url, { ...init, headers: headers2 })
      if (!res2.ok) throw new Error(await safeText(res2))
      if (res2.status === 204) return undefined as unknown as T
      const text2 = await res2.text()
      if (!text2) return undefined as unknown as T
      try {
        return JSON.parse(text2) as T
      } catch {
        throw new Error(text2)
      }
    }
  }
  if (!res.ok) throw new Error(await safeText(res))
  if (res.status === 204) return undefined as unknown as T
  // Some endpoints (e.g., DELETE) may return 200 with empty body
  const text = await res.text()
  if (!text) return undefined as unknown as T
  try {
    return JSON.parse(text) as T
  } catch {
    // If not valid JSON, return text as error-like value
    throw new Error(text)
  }
}

async function safeText(res: Response) {
  try {
    const t = await res.text()
    return t || res.statusText
  } catch {
    return res.statusText
  }
}

export const api = {
  get: <T>(path: string, auth = true) => apiFetch<T>(path, { method: "GET", auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    apiFetch<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      auth,
    }),
  // Multipart/form-data POST (no automatic JSON headers)
  postForm: <T>(path: string, formData: FormData, auth = true) =>
    apiFetch<T>(path, {
      method: "POST",
      body: formData,
      auth,
    }),
  patch: <T>(path: string, body?: unknown, auth = true) =>
    apiFetch<T>(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      auth,
    }),
  del: <T>(path: string, body?: unknown, auth = true) =>
    apiFetch<T>(path, {
      method: "DELETE",
      // Only set JSON header if a body is provided; avoid empty JSON parsing errors
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      auth,
    }),
}
