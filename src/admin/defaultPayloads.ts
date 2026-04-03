/** Minimal valid CMS payloads for new pages (match Laravel ContentPayloadValidator). */

/** Required keys match `ContentPayloadValidator` landing-page. All other keys are optional; omit or use [] to fall back to site defaults in the React bundle. */
export const defaultLandingPayload = `{
  "hero": {
    "title": "Title",
    "subtitle": "Subtitle",
    "primaryCta": "Primary",
    "secondaryCta": "Secondary",
    "location": "Riyadh",
    "trustLine": "Optional short trust line under the hero"
  },
  "programs": [
    { "id": "ey", "name": "Program", "description": "Description", "annualFee": "0" }
  ],
  "highlights": [
    { "id": "h1", "title": "Highlight", "description": "Description" }
  ],
  "stats": [
    { "value": "1", "label": "Stat label" }
  ],
  "news": [
    { "id": "n1", "title": "News title", "excerpt": "Short excerpt", "date": "2026/01/01" }
  ],
  "gallery": [
    { "id": "g1", "src": "https://example.com/image.jpg", "alt": "Alt", "caption": "Caption" }
  ],
  "partners": [
    { "id": "p1", "name": "Partner name", "abbreviation": "P" }
  ],
  "admissionSteps": [
    { "id": "s1", "title": "Step", "description": "Details" }
  ],
  "articleCards": [
    { "id": "a1", "title": "Article", "excerpt": "Excerpt", "meta": "Meta" }
  ],
  "articlesSectionLead": "Optional lead above article cards",
  "excellence": {
    "title": "Optional title",
    "body": "Optional body",
    "bullets": ["Point one", "Point two"]
  },
  "virtualTour": { "note": "Optional note for virtual tour block" },
  "mediaTicker": ["Line 1", "Line 2"],
  "policyBullets": ["Policy bullet one"]
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
