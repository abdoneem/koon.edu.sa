/** Maps public SPA paths to legacy `content_pages.slug` rows (en/ar). */
export function contentPageSlugFromPublicPath(pathname: string): string | null {
  const p = pathname.replace(/\/$/, "") || "/"
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
