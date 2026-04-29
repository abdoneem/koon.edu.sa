import { useOutletContext } from "react-router-dom"
import type { PublicLocaleOutletContext } from "../components/LocaleLayout"
import type { PublicLocale } from "../i18n/localeRouting"
import { withLocalePath } from "../i18n/localeRouting"

const FALLBACK_LANG: PublicLocale = "ar"

/**
 * Locale + `href()` for public routes under `/en` or `/ar`.
 * Outside that tree (e.g. admin), falls back to Arabic paths to avoid bare `/foo` links.
 */
export function usePublicLocale(): PublicLocaleOutletContext {
  const ctx = useOutletContext<PublicLocaleOutletContext | undefined>()
  if (ctx?.lang === "en" || ctx?.lang === "ar") {
    return ctx
  }
  return {
    lang: FALLBACK_LANG,
    href: (path: string) => withLocalePath(FALLBACK_LANG, path),
  }
}
