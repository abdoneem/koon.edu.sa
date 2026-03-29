import { env } from "../config/env"
import { getAdminToken } from "./authToken"

function apiBase(): string {
  return env.apiBaseUrl.replace(/\/$/, "")
}

export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  /* Laravel treats API clients as JSON-only when Accept includes application/json;
   * otherwise validation/errors may redirect back to the SPA Referer (broken CORS). */
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  const token = getAdminToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  return fetch(`${apiBase()}${path}`, { ...init, headers })
}
