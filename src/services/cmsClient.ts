import { env } from "../config/env"
import type {
  AboutPageContent,
  AdmissionsPageContent,
  ContactPageContent,
  LandingPageContent,
  Locale,
} from "../types/cms"

async function fetchCmsContent<T>(path: string, locale: Locale): Promise<T | null> {
  if (!env.apiBaseUrl) {
    return null
  }

  const response = await fetch(`${env.apiBaseUrl}${path}?locale=${locale}`)

  if (!response.ok) {
    throw new Error(`Failed to load content from ${path}`)
  }

  return (await response.json()) as T
}

export async function fetchLandingPageContent(
  locale: Locale,
): Promise<LandingPageContent | null> {
  return fetchCmsContent<LandingPageContent>("/api/content/landing-page", locale)
}

export async function fetchAboutPageContent(
  locale: Locale,
): Promise<AboutPageContent | null> {
  return fetchCmsContent<AboutPageContent>("/api/content/about-page", locale)
}

export async function fetchAdmissionsPageContent(
  locale: Locale,
): Promise<AdmissionsPageContent | null> {
  return fetchCmsContent<AdmissionsPageContent>("/api/content/admissions-page", locale)
}

export async function fetchContactPageContent(
  locale: Locale,
): Promise<ContactPageContent | null> {
  return fetchCmsContent<ContactPageContent>("/api/content/contact-page", locale)
}
