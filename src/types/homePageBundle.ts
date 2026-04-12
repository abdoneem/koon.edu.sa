import type { HeroContent, HighlightContent, ProgramContent, LandingPageContent, WhyKoonLandingContent } from "./cms"

/** Merged “Why KOON” block: always complete strings (defaults + CMS). */
export interface HomeWhyKoonIntro {
  eyebrow: string
  title: string
  lead: string
  visionLabel: string
  visionText: string
  missionLabel: string
  missionText: string
  philosophyLabel: string
  philosophyText: string
  accordionSummary: string
  accordionLead: string
}

export interface HomeStat {
  value: string
  label: string
}

export interface HomeNewsItem {
  id: string
  slug?: string
  title: string
  excerpt: string
  date?: string
  publishedAt?: string
  /** Optional cover; fallback uses bundled imagery by id. */
  image?: string
  body?: string
}

export interface HomeGalleryItem {
  id: string
  src: string
  alt: string
  caption: string
  /** Card badge: image vs video */
  mediaKind?: "image" | "video"
}

export interface HomePartner {
  id: string
  name: string
  abbreviation: string
}

export interface HomeAdmissionStep {
  id: string
  title: string
  description: string
}

export interface HomeArticleCard {
  id: string
  slug?: string
  title: string
  excerpt: string
  meta: string
  publishedAt?: string
  body?: string
}

/** Full homepage payload: CMS fields + editorial sections; always complete via defaults. */
export interface HomeProgramsSection {
  eyebrow: string
  title: string
  lead: string
}

export interface HomePageBundle {
  hero: HeroContent & { trustLine?: string }
  stats: HomeStat[]
  programs: ProgramContent[]
  /** Optional CMS headings for the programs block (empty strings = use i18n on the page). */
  programsSection: HomeProgramsSection
  highlights: HighlightContent[]
  news: HomeNewsItem[]
  gallery: HomeGalleryItem[]
  partners: HomePartner[]
  admissionSteps: HomeAdmissionStep[]
  articleCards: HomeArticleCard[]
  /** Shown when `articlesTeaser.body` is empty. */
  articlesSectionLead: string
  /** Optional CMS override for articles section `<h2>`. */
  articlesSectionTitle: string
  whyKoon: HomeWhyKoonIntro
  excellence: { title: string; subtitle: string; body: string; bullets: string[] }
  virtualTour: { note: string }
  mediaTicker: string[]
  /** Shown when `admissionsPage.policiesBullets` is empty in i18n. */
  policyBullets: string[]
}

function pickArray<T>(cms: T[] | undefined | null, fallback: T[]): T[] {
  return cms && cms.length > 0 ? cms : fallback
}

function pickString(primary: string | undefined | null, fallback: string): string {
  const s = typeof primary === "string" ? primary.trim() : ""
  return s.length > 0 ? s : fallback
}

function mergeWhyKoon(wk: WhyKoonLandingContent | undefined | null, defaults: HomeWhyKoonIntro): HomeWhyKoonIntro {
  if (!wk || typeof wk !== "object") {
    return defaults
  }
  return {
    eyebrow: pickString(wk.eyebrow, defaults.eyebrow),
    title: pickString(wk.title, defaults.title),
    lead: pickString(wk.lead, defaults.lead),
    visionLabel: pickString(wk.visionLabel, defaults.visionLabel),
    visionText: pickString(wk.visionText, defaults.visionText),
    missionLabel: pickString(wk.missionLabel, defaults.missionLabel),
    missionText: pickString(wk.missionText, defaults.missionText),
    philosophyLabel: pickString(wk.philosophyLabel, defaults.philosophyLabel),
    philosophyText: pickString(wk.philosophyText, defaults.philosophyText),
    accordionSummary: pickString(wk.accordionSummary, defaults.accordionSummary),
    accordionLead: pickString(wk.accordionLead, defaults.accordionLead),
  }
}

function mergeGalleryItems(
  cmsItems: LandingPageContent["gallery"],
  defaults: HomeGalleryItem[],
): HomeGalleryItem[] {
  if (!cmsItems || cmsItems.length === 0) {
    return defaults
  }
  return cmsItems.map((item, i) => {
    const base = defaults.find((d) => d.id === item.id) ?? defaults[i] ?? defaults[0]
    const kind = item.mediaKind === "video" || item.mediaKind === "image" ? item.mediaKind : base.mediaKind
    return {
      ...base,
      ...item,
      mediaKind: kind ?? "image",
    }
  })
}

function mergeNewsItems(
  cmsItems: LandingPageContent["news"],
  defaults: HomeNewsItem[],
): HomeNewsItem[] {
  if (!cmsItems || cmsItems.length === 0) {
    return defaults
  }
  return cmsItems.map((item, i) => {
    const base = defaults.find((d) => d.id === item.id) ?? defaults[i] ?? { id: item.id, title: "", excerpt: "" }
    const imageRaw = typeof item.image === "string" ? item.image.trim() : ""
    const image = imageRaw.length > 0 ? imageRaw : base.image
    const slugRaw = typeof item.slug === "string" ? item.slug.trim() : ""
    const slug = slugRaw.length > 0 ? slugRaw : base.slug
    const bodyRaw = typeof item.body === "string" ? item.body : undefined
    const body = bodyRaw && bodyRaw.trim() !== "" ? bodyRaw : base.body
    const publishedAtRaw = typeof item.publishedAt === "string" ? item.publishedAt.trim() : ""
    const publishedAt = publishedAtRaw.length > 0 ? publishedAtRaw : base.publishedAt
    return {
      ...base,
      ...item,
      image,
      slug,
      body,
      publishedAt,
    }
  })
}

export function mergeLandingIntoBundle(
  cms: LandingPageContent | null,
  defaults: HomePageBundle,
): HomePageBundle {
  if (!cms) {
    return defaults
  }

  const ex = cms.excellence
  const excellence = ex
    ? {
        title: pickString(ex.title, defaults.excellence.title),
        subtitle: pickString(ex.subtitle, defaults.excellence.subtitle),
        body: pickString(ex.body, defaults.excellence.body),
        bullets: pickArray(ex.bullets, defaults.excellence.bullets),
      }
    : defaults.excellence

  const vt = cms.virtualTour
  const virtualTour = {
    note: vt?.note != null && vt.note.trim().length > 0 ? vt.note.trim() : defaults.virtualTour.note,
  }

  const ps = cms.programsSection
  const programsSection: HomeProgramsSection = ps
    ? {
        eyebrow: pickString(ps.eyebrow, defaults.programsSection.eyebrow),
        title: pickString(ps.title, defaults.programsSection.title),
        lead: pickString(ps.lead, defaults.programsSection.lead),
      }
    : defaults.programsSection

  return {
    ...defaults,
    hero: {
      ...defaults.hero,
      ...cms.hero,
      backgroundImage: cms.hero.backgroundImage ?? defaults.hero.backgroundImage,
      trustLine: pickString(cms.hero.trustLine, defaults.hero.trustLine ?? ""),
    },
    programs: pickArray(cms.programs, defaults.programs),
    programsSection,
    highlights: pickArray(cms.highlights, defaults.highlights),
    stats: pickArray(cms.stats, defaults.stats),
    news: mergeNewsItems(cms.news, defaults.news),
    gallery: mergeGalleryItems(cms.gallery, defaults.gallery),
    partners: pickArray(cms.partners, defaults.partners),
    admissionSteps: pickArray(cms.admissionSteps, defaults.admissionSteps),
    articleCards: mergeArticleCards(cms.articleCards, defaults.articleCards),
    articlesSectionLead: pickString(cms.articlesSectionLead, defaults.articlesSectionLead),
    articlesSectionTitle: pickString(cms.articlesSectionTitle, defaults.articlesSectionTitle),
    whyKoon: mergeWhyKoon(cms.whyKoon, defaults.whyKoon),
    excellence,
    virtualTour,
    mediaTicker: pickArray(cms.mediaTicker, defaults.mediaTicker),
    policyBullets: pickArray(cms.policyBullets, defaults.policyBullets),
  }
}

function mergeArticleCards(
  cmsItems: LandingPageContent["articleCards"],
  defaults: HomeArticleCard[],
): HomeArticleCard[] {
  if (!cmsItems || cmsItems.length === 0) {
    return defaults
  }
  return cmsItems.map((item, i) => {
    const base =
      defaults.find((d) => d.id === item.id) ??
      defaults[i] ?? { id: item.id, title: "", excerpt: "", meta: "" }
    const slugRaw = typeof item.slug === "string" ? item.slug.trim() : ""
    const slug = slugRaw.length > 0 ? slugRaw : base.slug
    const bodyRaw = typeof item.body === "string" ? item.body : undefined
    const body = bodyRaw && bodyRaw.trim() !== "" ? bodyRaw : base.body
    const publishedAtRaw = typeof item.publishedAt === "string" ? item.publishedAt.trim() : ""
    const publishedAt = publishedAtRaw.length > 0 ? publishedAtRaw : base.publishedAt
    return {
      ...base,
      ...item,
      slug,
      body,
      publishedAt,
    }
  })
}
