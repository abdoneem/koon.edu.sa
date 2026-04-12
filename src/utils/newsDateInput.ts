const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Map stored news `date` to `input type="date"` value, or "" if not representable. */
export function toDateInputValue(raw: string | undefined | null): string {
  const s = (raw ?? "").trim()
  if (!s) {
    return ""
  }
  if (ISO_DATE.test(s)) {
    return s
  }
  const t = Date.parse(s)
  if (!Number.isNaN(t)) {
    const d = new Date(t)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }
  return ""
}

/** Map ISO or parseable time to `input type="datetime-local"` (local, no seconds). */
export function toDatetimeLocalInputValue(raw: string | undefined | null): string {
  const s = (raw ?? "").trim()
  if (!s) {
    return ""
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)) {
    return s.slice(0, 16)
  }
  const t = Date.parse(s)
  if (!Number.isNaN(t)) {
    const d = new Date(t)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return ""
}

/** User-visible label for news/article dates; keeps unknown strings as-is. */
export function formatNewsDateForDisplay(raw: string | undefined | null, locale: string): string {
  const s = (raw ?? "").trim()
  if (!s) {
    return ""
  }
  if (ISO_DATE.test(s)) {
    const [y, m, d] = s.split("-").map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(locale, { dateStyle: "medium" })
  }
  const t = Date.parse(s)
  if (!Number.isNaN(t)) {
    return new Date(t).toLocaleDateString(locale, { dateStyle: "medium" })
  }
  return s
}

/** Valid `datetime` attribute when possible; omit invalid values. */
export function newsDateTimeAttr(raw: string | undefined | null): string | undefined {
  const str = (raw ?? "").trim()
  if (!str) {
    return undefined
  }
  if (ISO_DATE.test(str)) {
    return str
  }
  const t = Date.parse(str)
  if (!Number.isNaN(t)) {
    return new Date(t).toISOString()
  }
  return undefined
}

/** Send datetime-local or ISO to API as ISO string, or null if empty. */
export function publishedAtToApi(raw: string | undefined | null): string | null {
  const s = (raw ?? "").trim()
  if (!s) {
    return null
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)) {
    return new Date(s).toISOString()
  }
  return s
}
