import { adminFetch } from "../admin/adminApi"
import type { Locale } from "../types/cms"

function root(locale: Locale): string {
  return `/api/admin/content-pages/landing/${locale}`
}

export async function getLandingCollection(locale: Locale, collection: string): Promise<Response> {
  return adminFetch(`${root(locale)}/collections/${collection}`)
}

export async function putLandingCollection(locale: Locale, collection: string, data: unknown[]): Promise<Response> {
  return adminFetch(`${root(locale)}/collections/${collection}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  })
}

export async function getLandingItem(locale: Locale, collection: string, itemId: string): Promise<Response> {
  return adminFetch(`${root(locale)}/collections/${collection}/items/${encodeURIComponent(itemId)}`)
}

export async function patchLandingItem(
  locale: Locale,
  collection: string,
  itemId: string,
  body: Record<string, unknown>,
): Promise<Response> {
  return adminFetch(`${root(locale)}/collections/${collection}/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function postLandingItem(
  locale: Locale,
  collection: string,
  body: Record<string, unknown>,
): Promise<Response> {
  return adminFetch(`${root(locale)}/collections/${collection}/items`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function deleteLandingItem(locale: Locale, collection: string, itemId: string): Promise<Response> {
  return adminFetch(`${root(locale)}/collections/${collection}/items/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  })
}

export async function patchLandingExcellence(
  locale: Locale,
  body: { title?: string; subtitle?: string; body?: string; bullets?: string[] },
): Promise<Response> {
  return adminFetch(`${root(locale)}/inline/excellence`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function patchLandingProgramsSection(
  locale: Locale,
  body: { eyebrow: string; title: string; lead: string },
): Promise<Response> {
  return adminFetch(`${root(locale)}/inline/programs-section`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function patchLandingVirtualTour(locale: Locale, note: string | null): Promise<Response> {
  return adminFetch(`${root(locale)}/inline/virtual-tour`, {
    method: "PATCH",
    body: JSON.stringify({ note }),
  })
}

export async function patchLandingArticlesLead(
  locale: Locale,
  body: { articlesSectionLead: string; articlesSectionTitle: string },
): Promise<Response> {
  return adminFetch(`${root(locale)}/inline/articles-lead`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export type LandingWhyKoonPatch = {
  eyebrow?: string | null
  title?: string | null
  lead?: string | null
  visionLabel?: string | null
  visionText?: string | null
  missionLabel?: string | null
  missionText?: string | null
  philosophyLabel?: string | null
  philosophyText?: string | null
  accordionSummary?: string | null
  accordionLead?: string | null
}

export async function patchLandingWhyKoon(locale: Locale, body: LandingWhyKoonPatch): Promise<Response> {
  return adminFetch(`${root(locale)}/inline/why-koon`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}
