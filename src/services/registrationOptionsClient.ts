import { env } from "../config/env"
import type { RegistrationOptionsPayload } from "../types/registrationOptions"

export async function fetchRegistrationOptions(): Promise<RegistrationOptionsPayload> {
  const base = env.apiBaseUrl?.replace(/\/$/, "")
  if (!base) {
    throw new Error("VITE_API_BASE_URL is not set")
  }
  const res = await fetch(`${base}/api/registration-options`, {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    throw new Error("registration-options failed")
  }
  return (await res.json()) as RegistrationOptionsPayload
}
