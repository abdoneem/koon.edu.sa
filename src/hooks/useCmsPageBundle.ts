import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { env } from "../config/env"
import { fetchCmsPageBundle } from "../services/structuredCmsClient"
import type { Locale } from "../types/cms"
import type { CmsPageBundleResponse } from "../types/structuredCms"

/**
 * Loads GET /api/pages/{slug} for the current UI language.
 * Pass null to skip fetching.
 */
export function useCmsPageBundle(slug: string | null) {
  const { i18n } = useTranslation()
  const locale = (i18n.language.startsWith("ar") ? "ar" : "en") as Locale
  const [data, setData] = useState<CmsPageBundleResponse | null>(null)
  const [loading, setLoading] = useState(Boolean(slug && env.apiBaseUrl))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug || !env.apiBaseUrl) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const bundle = await fetchCmsPageBundle(slug, locale)
        if (cancelled) {
          return
        }
        setData(bundle)
      } catch {
        if (!cancelled) {
          setError("cms_page_load_failed")
          setData(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [slug, locale])

  const active = Boolean(data && !data.fallback && data.page)

  return {
    data,
    loading,
    error,
    active,
    page: active ? data!.page! : null,
    sections: active ? data!.sections : [],
  }
}
