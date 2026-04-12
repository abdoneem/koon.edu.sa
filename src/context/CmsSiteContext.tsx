import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { env } from "../config/env"
import { fetchCmsSettings } from "../services/structuredCmsClient"
import type { Locale } from "../types/cms"
import { type CmsSiteResolved, buildCmsSiteResolved } from "../utils/cmsSiteResolve"

const CmsSiteContext = createContext<CmsSiteResolved | null>(null)

export function CmsSiteProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const [raw, setRaw] = useState<Record<string, string | null | undefined>>({})

  const isAdmin = pathname.startsWith("/admin")

  useEffect(() => {
    if (!env.apiBaseUrl || isAdmin) {
      return
    }
    let cancelled = false
    ;(async () => {
      const data = await fetchCmsSettings()
      if (cancelled || !data?.settings) {
        return
      }
      setRaw(data.settings)
    })()
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const locale: Locale = i18n.language.startsWith("ar") ? "ar" : "en"
  const value = useMemo(
    () => buildCmsSiteResolved(isAdmin ? {} : raw, t, locale),
    [raw, t, locale, isAdmin],
  )

  return <CmsSiteContext.Provider value={value}>{children}</CmsSiteContext.Provider>
}

export function useCmsSite(): CmsSiteResolved {
  const ctx = useContext(CmsSiteContext)
  if (!ctx) {
    throw new Error("useCmsSite must be used within CmsSiteProvider")
  }
  return ctx
}
