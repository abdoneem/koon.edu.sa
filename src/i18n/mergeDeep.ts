/** Shallow-safe deep merge for i18n resource objects (objects recurse; arrays replace). */
export function mergeDeep<T extends Record<string, unknown>>(base: T, patch: Partial<T>): T {
  const out = { ...base }
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const pv = patch[key]
    const bv = out[key]
    if (
      pv !== undefined &&
      pv !== null &&
      typeof pv === "object" &&
      !Array.isArray(pv) &&
      typeof bv === "object" &&
      bv !== null &&
      !Array.isArray(bv)
    ) {
      out[key] = mergeDeep(bv as Record<string, unknown>, pv as Record<string, unknown>) as T[keyof T]
    } else if (pv !== undefined) {
      out[key] = pv as T[keyof T]
    }
  }
  return out
}
