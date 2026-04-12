import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { env } from "../config/env"
import { getHomePageBundleDefaults } from "../content/homePageBundleDefaults"
import { fetchLandingPageContent } from "../services/cmsClient"
import type { LandingPageContent } from "../types/cms"
import type { Locale } from "../types/cms"
import { mergeLandingIntoBundle } from "../types/homePageBundle"

export function useHomePageBundle() {
  const { i18n } = useTranslation()
  const locale: Locale = i18n.language.startsWith("ar") ? "ar" : "en"
  const defaults = useMemo(() => getHomePageBundleDefaults(locale), [locale])

  const [cms, setCms] = useState<LandingPageContent | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const refetch = useCallback(() => {
    setReloadToken((n) => n + 1)
  }, [])

  useEffect(() => {
    let active = true
    setError(null)

    if (!env.apiBaseUrl) {
      setCms(null)
      return
    }

    setCms(undefined)

    fetchLandingPageContent(locale)
      .then((data) => {
        if (!active) {
          return
        }
        setCms(data)
      })
      .catch(() => {
        if (!active) {
          return
        }
        setError("cms_unavailable")
        setCms(null)
      })

    return () => {
      active = false
    }
  }, [locale, reloadToken])

  const bundle = useMemo(() => {
    if (cms === undefined) {
      return defaults
    }
    return mergeLandingIntoBundle(cms, defaults)
  }, [cms, defaults])

  const hasLiveCms = Boolean(cms)
  const isLoading = cms === undefined && Boolean(env.apiBaseUrl)

  return { bundle, hasLiveCms, isLoading, error, locale, refetch }
}
