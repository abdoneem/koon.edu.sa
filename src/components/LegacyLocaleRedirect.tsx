import { useTranslation } from "react-i18next"
import { Navigate, useLocation } from "react-router-dom"
import { i18nLangToPublicLocale, withLocalePath } from "../i18n/localeRouting"

/**
 * Sends legacy unprefixed public URLs (`/about`) to `/en/...` or `/ar/...`
 * using the active i18n language (localStorage / detector).
 */
export function LegacyLocaleRedirect() {
  const { i18n } = useTranslation()
  const location = useLocation()
  const lang = i18nLangToPublicLocale(i18n.language)
  const pathOnly = location.pathname.replace(/\/$/, "") || "/"
  const target = withLocalePath(lang, pathOnly === "/" ? "/" : pathOnly) + location.search + location.hash
  return <Navigate to={target} replace />
}
