/** Laravel JSON: `{ message?: string, errors?: Record<string, string[]> }` */
export function formatApiError(data: unknown, fallback: string): string {
  if (typeof data !== "object" || data === null) {
    return fallback
  }
  const o = data as Record<string, unknown>
  if (typeof o.message === "string" && o.message.trim() !== "") {
    return o.message
  }
  if (o.errors && typeof o.errors === "object" && o.errors !== null) {
    const parts: string[] = []
    for (const v of Object.values(o.errors as Record<string, unknown>)) {
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === "string") {
        parts.push(v[0])
      } else if (typeof v === "string") {
        parts.push(v)
      }
    }
    if (parts.length > 0) {
      return parts.join(" ")
    }
  }
  return fallback
}

const USER_API_ERROR_CODES: Record<string, string> = {
  cannot_remove_own_users_manage: "admin.users.cannotRemoveOwnUsersManage",
  cannot_delete_own_account: "admin.users.cannotDeleteOwnAccount",
  users_manage_required: "admin.users.usersManageRequired",
}

/** Maps known `code` fields from Admin User API to admin i18n; otherwise same as {@link formatApiError}. */
export function formatUserApiError(data: unknown, fallback: string, t: (key: string) => string): string {
  if (typeof data === "object" && data !== null && "code" in data) {
    const code = (data as { code?: string }).code
    if (code && USER_API_ERROR_CODES[code]) {
      return t(USER_API_ERROR_CODES[code])
    }
  }
  return formatApiError(data, fallback)
}
