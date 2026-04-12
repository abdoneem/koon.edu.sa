export type SiteNavItem = {
  id: string
  label: string
  href: string
  openInNewTab?: boolean
  children?: SiteNavItem[]
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v)
}

function sanitizeItem(raw: unknown, depth: number): SiteNavItem | null {
  if (depth > 5 || !isPlainObject(raw)) {
    return null
  }
  const id = typeof raw.id === "string" ? raw.id.trim() : ""
  const label = typeof raw.label === "string" ? raw.label.trim() : ""
  const href = typeof raw.href === "string" ? raw.href.trim() : ""
  if (!id || !label || !href || id.length > 64 || label.length > 200 || href.length > 500) {
    return null
  }
  const openInNewTab = raw.openInNewTab === true
  let children: SiteNavItem[] | undefined
  if (Array.isArray(raw.children) && raw.children.length > 0) {
    const kids = raw.children.map((c) => sanitizeItem(c, depth + 1)).filter((x): x is SiteNavItem => x !== null)
    if (kids.length > 0) {
      children = kids
    }
  }
  return { id, label, href, ...(openInNewTab ? { openInNewTab: true } : {}), ...(children ? { children } : {}) }
}

/** Parse JSON from CMS settings; returns null if invalid or empty. */
export function parseSiteNavTreeJson(raw: string | null | undefined): SiteNavItem[] | null {
  if (raw == null || typeof raw !== "string") {
    return null
  }
  const s = raw.trim()
  if (!s) {
    return null
  }
  try {
    const data = JSON.parse(s) as unknown
    if (!Array.isArray(data) || data.length === 0) {
      return null
    }
    const items = data.map((row) => sanitizeItem(row, 1)).filter((x): x is SiteNavItem => x !== null)
    return items.length > 0 ? items : null
  } catch {
    return null
  }
}
