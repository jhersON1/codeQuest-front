"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TagRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  useEffect(() => {
    if (slug) {
      router.replace(`/search?tag=${encodeURIComponent(slug)}`)
    }
  }, [slug, router])

  return null
}
