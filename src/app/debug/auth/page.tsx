"use client"

import { useEffect, useState } from "react"

import { useAuth } from "@/lib/auth-context"

export default function DebugAuthPage() {
  const { user, loading } = useAuth()
  const [tokens, setTokens] = useState<{ accessToken: string | null; refreshToken: string | null }>(
    { accessToken: null, refreshToken: null }
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = window.localStorage.getItem("cq_access_token")
      const refreshToken = window.localStorage.getItem("cq_refresh_token")
      setTokens({ accessToken, refreshToken })
    }
  }, [])

  const testAPI = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      )
      if (response.ok) {
        const userData = await response.json()
        console.log("API Response:", userData)
      } else {
        console.error("API Error:", response.status, await response.text())
      }
    } catch (error) {
      console.error("Network Error:", error)
    }
  }

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold">Auth Debug</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Estado de Auth Context:</h2>
        <p>Loading: {loading.toString()}</p>
        <p>User: {user ? `${user.username} (${user.user_id})` : "null"}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Tokens en localStorage:</h2>
        <p>
          Access Token: {tokens.accessToken ? `${tokens.accessToken.substring(0, 50)}...` : "null"}
        </p>
        <p>
          Refresh Token:{" "}
          {tokens.refreshToken ? `${tokens.refreshToken.substring(0, 50)}...` : "null"}
        </p>
      </div>

      <button
        onClick={testAPI}
        className="rounded bg-blue-500 px-4 py-2 text-white"
        disabled={!tokens.accessToken}
      >
        Test API Call
      </button>
    </div>
  )
}
