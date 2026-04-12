import { getAdminSession } from "../admin/authToken"

/** Public-site inline editing: requires staff session + both permissions. */
export function canUseInlineEdit(): boolean {
  const s = getAdminSession()
  if (!s?.token) {
    return false
  }
  return s.permissions.includes("inline_edit") && s.permissions.includes("content_pages_manage")
}
