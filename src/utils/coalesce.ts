export function coalesceArray<T>(primary: T[] | undefined | null, fallback: T[]): T[] {
  if (Array.isArray(primary) && primary.length > 0) {
    return primary
  }
  return fallback
}

export function coalesceString(primary: string | undefined | null, fallback: string): string {
  const p = typeof primary === "string" ? primary.trim() : ""
  return p.length > 0 ? primary!.trim() : fallback
}
