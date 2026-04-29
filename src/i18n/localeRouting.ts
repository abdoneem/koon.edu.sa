export const PUBLIC_LOCALES = ["en", "ar"] as const
export type PublicLocale = (typeof PUBLIC_LOCALES)[number]

export function isPublicLocale(s: string | undefined): s is PublicLocale {
  return s === "en" || s === "ar"
}

/** Preferred locale segment for URLs from an i18next language string. */
export function i18nLangToPublicLocale(lng: string): PublicLocale {
  return lng.startsWith("ar") ? "ar" : "en"
}

/**
 * Prefix a public path with `/en` or `/ar`. `path` is a site path like `/`, `/about`, `/news/1`.
 */
export function withLocalePath(lang: PublicLocale, path: string): string {
  const p = path.trim()
  if (!p || p === "/") {
    return `/${lang}`
  }
  const normalized = p.startsWith("/") ? p : `/${p}`
  return `/${lang}${normalized}`
}

/**
 * Split `/en/about` → `{ locale: 'en', pathWithoutLocale: '/about' }`.
 * Unprefixed paths return `locale: null` and the original path (normalized).
 */
export function stripLocaleFromPath(pathname: string): { locale: PublicLocale | null; pathWithoutLocale: string } {
  const raw = pathname.split(/[?#]/)[0] ?? pathname
  const clean = raw.replace(/\/$/, "") || "/"
  const m = clean.match(/^\/(en|ar)(\/.*|)$/)
  if (!m) {
    return { locale: null, pathWithoutLocale: clean }
  }
  const rest = m[2] && m[2].length > 1 ? m[2] : "/"
  const pathWithoutLocale = (rest.replace(/\/$/, "") || "/") as string
  return { locale: m[1] as PublicLocale, pathWithoutLocale }
}

/** Swap `/en/foo` → `/ar/foo`. Unprefixed input is treated as locale-agnostic and gets `next` prepended. */
export function swapLocaleInPath(pathname: string, next: PublicLocale): string {
  const { locale, pathWithoutLocale } = stripLocaleFromPath(pathname)
  if (locale) {
    return withLocalePath(next, pathWithoutLocale)
  }
  const tail = pathname.split(/[?#]/)[0] ?? pathname
  const normalized = tail.replace(/\/$/, "") || "/"
  return withLocalePath(next, normalized === "/" ? "/" : normalized)
}
