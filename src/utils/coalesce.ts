export function coalesceArray<T>(primary: T[] | undefined | null, fallback: T[]): T[] {
  if (Array.isArray(primary) && primary.length > 0) {
    return primary
  }
  return fallback
}

/**
 * When landing CMS JSON loaded from API, show DB-backed slice.
 * Otherwise keep legacy behavior: site i18n arrays override seeded defaults when non-empty.
 */
export function cmsOrI18nArray<T>(hasLiveCms: boolean, bundleSlice: T[], i18nPrimary: T[] | undefined | null): T[] {
  return hasLiveCms ? bundleSlice : coalesceArray(i18nPrimary, bundleSlice)
}

export function coalesceString(primary: string | undefined | null, fallback: string): string {
  const p = typeof primary === "string" ? primary.trim() : ""
  return p.length > 0 ? primary!.trim() : fallback
}
