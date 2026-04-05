import { env } from "../config/env"
import type { Locale } from "../types/cms"
import type { CmsPageBundleResponse, CmsSettingsApiResponse } from "../types/structuredCms"

export async function fetchCmsSettings(): Promise<CmsSettingsApiResponse | null> {
  if (!env.apiBaseUrl) {
    return null
  }
  try {
    const res = await fetch(`${env.apiBaseUrl.replace(/\/$/, "")}/api/settings`, {
      headers: { Accept: "application/json" },
    })
    if (!res.ok) {
      return null
    }
    return (await res.json()) as CmsSettingsApiResponse
  } catch {
    return null
  }
}

export async function fetchCmsPageBundle(slug: string, locale: Locale): Promise<CmsPageBundleResponse | null> {
  if (!env.apiBaseUrl) {
    return null
  }
  try {
    const base = env.apiBaseUrl.replace(/\/$/, "")
    const res = await fetch(`${base}/api/pages/${encodeURIComponent(slug)}?locale=${locale}`, {
      headers: { Accept: "application/json" },
    })
    if (!res.ok) {
      return null
    }
    return (await res.json()) as CmsPageBundleResponse
  } catch {
    return null
  }
}
