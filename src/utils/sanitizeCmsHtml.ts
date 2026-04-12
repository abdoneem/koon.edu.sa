import DOMPurify from "dompurify"

/** Safe HTML for public CMS page body (admin-trusted content, still sanitized). */
export function sanitizeCmsBodyHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  })
}
