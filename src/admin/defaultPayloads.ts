/** Minimal valid CMS payloads for new pages (match Laravel ContentPayloadValidator). */

export const defaultLandingPayload = `{
  "hero": {
    "title": "Title",
    "subtitle": "Subtitle",
    "primaryCta": "Primary",
    "secondaryCta": "Secondary",
    "location": "Riyadh"
  },
  "programs": [
    { "id": "ey", "name": "Program", "description": "Description", "annualFee": "0" }
  ],
  "highlights": [
    { "id": "h1", "title": "Highlight", "description": "Description" }
  ]
}`

export const defaultAboutPayload = `{
  "title": "About",
  "description": "Description",
  "pillars": [
    { "id": "p1", "title": "Pillar", "description": "Text" }
  ]
}`

export const defaultAdmissionsPayload = `{
  "title": "Admissions",
  "description": "Description",
  "steps": [
    { "id": "s1", "title": "Step", "description": "Text" }
  ]
}`

export const defaultContactPayload = `{
  "title": "Contact",
  "description": "Description",
  "phone": "0500000000",
  "email": "info@example.com",
  "address": "Address"
}`

export function templateForSlug(slug: string): string {
  switch (slug) {
    case "landing-page":
      return defaultLandingPayload
    case "about-page":
      return defaultAboutPayload
    case "admissions-page":
      return defaultAdmissionsPayload
    case "contact-page":
      return defaultContactPayload
    default:
      return "{}"
  }
}
