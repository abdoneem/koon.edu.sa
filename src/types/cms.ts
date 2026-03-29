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

export interface LandingPageContent {
  hero: HeroContent
  programs: ProgramContent[]
  highlights: HighlightContent[]
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
