/**
 * Maps public routes to structured CMS page slugs (GET /api/pages/{slug}).
 * Publish a page with the same slug + locale in admin to drive SEO (and optional sections later).
 */
export function pathToCmsSlugCandidates(pathKey: string): string[] {
  const key = pathKey.replace(/\/$/, "") || "/"
  if (key.startsWith("/admin")) {
    return []
  }
  if (key === "/") {
    return ["home", "landing-page"]
  }
  return [key.slice(1).replace(/\//g, "-")]
}

/** First candidate slug (for hooks that take a single explicit slug). */
export function pathToCmsSlug(pathKey: string): string | null {
  const c = pathToCmsSlugCandidates(pathKey)
  return c[0] ?? null
}
