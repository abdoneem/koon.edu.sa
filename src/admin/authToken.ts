/** localStorage key for admin session JSON (inline edit listens for cross-tab updates). */
export const ADMIN_SESSION_STORAGE_KEY = "koon_admin_session"

/** Fired on `window` after `setAdminSession` updates localStorage (same-tab sync). */
export const ADMIN_SESSION_CHANGED_EVENT = "koon-admin-session-changed"
const SESSION_KEY = ADMIN_SESSION_STORAGE_KEY
/** @deprecated migrated into session JSON */
const LEGACY_TOKEN_KEY = "koon_admin_token"

export type AdminSession = {
  token: string
  permissions: string[]
  roles: string[]
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_TOKEN_KEY)
      if (legacy) {
        const migrated: AdminSession = { token: legacy, permissions: [], roles: [] }
        localStorage.removeItem(LEGACY_TOKEN_KEY)
        localStorage.setItem(SESSION_KEY, JSON.stringify(migrated))
        return migrated
      }
      return null
    }
    const parsed = JSON.parse(raw) as AdminSession
    if (parsed && typeof parsed.token === "string") {
      return {
        token: parsed.token,
        permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
        roles: Array.isArray(parsed.roles) ? parsed.roles : [],
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

export function setAdminSession(session: AdminSession | null): void {
  if (!session) {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
  } else {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: session.token,
        permissions: session.permissions,
        roles: session.roles,
      }),
    )
    localStorage.removeItem(LEGACY_TOKEN_KEY)
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT))
  }
}

export function getAdminToken(): string | null {
  return getAdminSession()?.token ?? null
}

/** @deprecated Prefer setAdminSession — only clears or sets token-only session for logout compatibility */
export function setAdminToken(token: string | null): void {
  if (!token) {
    setAdminSession(null)
    return
  }
  const cur = getAdminSession()
  setAdminSession({
    token,
    permissions: cur?.permissions ?? [],
    roles: cur?.roles ?? [],
  })
}

export function hasAdminPermission(permission: string): boolean {
  return getAdminSession()?.permissions.includes(permission) ?? false
}
