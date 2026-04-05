import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { env } from "../config/env"
import { fetchCmsPageBundle } from "../services/structuredCmsClient"
import type { Locale } from "../types/cms"
import type { CmsPageBundleResponse, CmsPageBundleSection } from "../types/structuredCms"
import { pathToCmsSlugCandidates } from "../utils/pathToCmsSlug"

/**
 * First published structured CMS page matching the URL path (same slug rules as SEO).
 */
export function useCmsPageForPath(pathKey: string) {
  const { i18n } = useTranslation()
  const locale = (i18n.language.startsWith("ar") ? "ar" : "en") as Locale
  const slugs = useMemo(() => pathToCmsSlugCandidates(pathKey), [pathKey])
  const [bundle, setBundle] = useState<CmsPageBundleResponse | null>(null)
  const [loading, setLoading] = useState(Boolean(slugs.length && env.apiBaseUrl))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slugs.length === 0 || !env.apiBaseUrl) {
      setBundle(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        let last: CmsPageBundleResponse | null = null
        for (const slug of slugs) {
          const res = await fetchCmsPageBundle(slug, locale)
          if (cancelled) {
            return
          }
          last = res
          if (res && !res.fallback && res.page) {
            setBundle(res)
            setLoading(false)
            return
          }
        }
        if (!cancelled) {
          setBundle(last)
        }
      } catch {
        if (!cancelled) {
          setError("cms_page_load_failed")
          setBundle(null)
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
  }, [slugs, locale])

  const active = Boolean(bundle && !bundle.fallback && bundle.page)
  const sections: CmsPageBundleSection[] = active && bundle?.sections ? [...bundle.sections].sort((a, b) => a.order - b.order) : []

  return {
    bundle,
    loading,
    error,
    active,
    page: active && bundle?.page ? bundle.page : null,
    sections,
  }
}
