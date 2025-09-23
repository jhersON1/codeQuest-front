"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CategoryRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  useEffect(() => {
    if (slug) {
      router.replace(`/search?category=${encodeURIComponent(slug)}`)
    }
  }, [slug, router])

  return null
}
