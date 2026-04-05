import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { env } from "../config/env"
import { fetchCmsPageBundle } from "../services/structuredCmsClient"
import type { Locale } from "../types/cms"
import { pathToCmsSlugCandidates } from "../utils/pathToCmsSlug"

export type CmsSeoOverride = {
  title?: string
  description?: string
}

/**
 * Tries structured CMS pages for the current path (multiple slugs for `/`: home, landing-page).
 */
export function usePathCmsSeo(pathKey: string): CmsSeoOverride | null {
  const { i18n } = useTranslation()
  const locale = (i18n.language.startsWith("ar") ? "ar" : "en") as Locale
  const slugs = useMemo(() => pathToCmsSlugCandidates(pathKey), [pathKey])
  const [override, setOverride] = useState<CmsSeoOverride | null>(null)

  useEffect(() => {
    if (slugs.length === 0 || !env.apiBaseUrl) {
      setOverride(null)
      return
    }

    let cancelled = false
    ;(async () => {
      for (const slug of slugs) {
        const bundle = await fetchCmsPageBundle(slug, locale)
        if (cancelled) {
          return
        }
        if (bundle && !bundle.fallback && bundle.page) {
          const p = bundle.page
          const title = (p.meta_title?.trim() || p.title?.trim()) || ""
          const description = p.meta_description?.trim() || ""
          const next: CmsSeoOverride = {}
          if (title) {
            next.title = title
          }
          if (description) {
            next.description = description
          }
          setOverride(Object.keys(next).length ? next : null)
          return
        }
      }
      if (!cancelled) {
        setOverride(null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [slugs, locale])

  return override
}
