import { stripLocaleFromPath } from "../i18n/localeRouting"

/** Maps public SPA paths to legacy `content_pages.slug` rows (en/ar). */
export function contentPageSlugFromPublicPath(pathname: string): string | null {
  const { pathWithoutLocale } = stripLocaleFromPath(pathname)
  const p = pathWithoutLocale.replace(/\/$/, "") || "/"
  if (p === "/") {
    return "landing-page"
  }
  if (p === "/about") {
    return "about-page"
  }
  if (p === "/contact") {
    return "contact-page"
  }
  if (p === "/admissions") {
    return "admissions-page"
  }
  return null
}
