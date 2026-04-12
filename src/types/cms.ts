export type Locale = "en" | "ar"

export interface CmsMedia {
  url: string
  alt?: string
}

export interface HeroContent {
  title: string
  subtitle: string
  primaryCta: string
  secondaryCta: string
  location: string
  backgroundImage?: CmsMedia
  /** Short trust line under hero copy (homepage). */
  trustLine?: string
}

export interface ProgramContent {
  id?: string
  name: string
  description: string
  annualFee: string
}

export interface HighlightContent {
  id?: string
  title: string
  description: string
}

/** Homepage “Why KOON” intro + vision/mission/philosophy strip + accordion (optional in API). */
export interface WhyKoonLandingContent {
  eyebrow?: string
  title?: string
  lead?: string
  visionLabel?: string
  visionText?: string
  missionLabel?: string
  missionText?: string
  philosophyLabel?: string
  philosophyText?: string
  accordionSummary?: string
  accordionLead?: string
}

/** Optional homepage sections — same shape as `HomePageBundle` slices; omitted in API = use i18n/defaults. */
export interface LandingPageContent {
  hero: HeroContent
  programs: ProgramContent[]
  highlights: HighlightContent[]
  stats?: { value: string; label: string }[]
  news?: {
    id: string
    slug?: string
    title: string
    excerpt: string
    date?: string
    publishedAt?: string
    image?: string
    body?: string
  }[]
  gallery?: { id: string; src: string; alt: string; caption: string; mediaKind?: "image" | "video" }[]
  partners?: { id: string; name: string; abbreviation: string }[]
  admissionSteps?: { id: string; title: string; description: string }[]
  articleCards?: { id: string; slug?: string; title: string; excerpt: string; meta: string; publishedAt?: string; body?: string }[]
  articlesSectionLead?: string
  /** Optional override for the articles teaser section `<h2>`. */
  articlesSectionTitle?: string
  /** Optional headings above the programs grid (fallback: `homePage.*` i18n). */
  programsSection?: { eyebrow?: string; title?: string; lead?: string }
  whyKoon?: WhyKoonLandingContent
  excellence?: { title?: string; subtitle?: string; body?: string; bullets?: string[] }
  virtualTour?: { note?: string }
  mediaTicker?: string[]
  policyBullets?: string[]
}

export interface AboutPageContent {
  title: string
  description: string
  pillars: { id: string; title: string; description: string }[]
}

export interface AdmissionsPageContent {
  title: string
  description: string
  steps: { id: string; title: string; description: string }[]
}

export interface ContactPageContent {
  title: string
  description: string
  phone: string
  email: string
  address: string
}
