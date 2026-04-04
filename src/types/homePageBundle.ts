import type { HeroContent, HighlightContent, ProgramContent, LandingPageContent } from "./cms"

export interface HomeStat {
  value: string
  label: string
}

export interface HomeNewsItem {
  id: string
  title: string
  excerpt: string
  date?: string
  /** Optional cover; fallback uses bundled imagery by id. */
  image?: string
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
  title: string
  excerpt: string
  meta: string
}

/** Full homepage payload: CMS fields + editorial sections; always complete via defaults. */
export interface HomePageBundle {
  hero: HeroContent & { trustLine?: string }
  stats: HomeStat[]
  programs: ProgramContent[]
  highlights: HighlightContent[]
  news: HomeNewsItem[]
  gallery: HomeGalleryItem[]
  partners: HomePartner[]
  admissionSteps: HomeAdmissionStep[]
  articleCards: HomeArticleCard[]
  /** Shown when `articlesTeaser.body` is empty. */
  articlesSectionLead: string
  excellence: { title: string; body: string; bullets: string[] }
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
    return {
      ...base,
      ...item,
      image,
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
        body: pickString(ex.body, defaults.excellence.body),
        bullets: pickArray(ex.bullets, defaults.excellence.bullets),
      }
    : defaults.excellence

  const vt = cms.virtualTour
  const virtualTour = {
    note: vt?.note != null && vt.note.trim().length > 0 ? vt.note.trim() : defaults.virtualTour.note,
  }

  return {
    ...defaults,
    hero: {
      ...defaults.hero,
      ...cms.hero,
      backgroundImage: cms.hero.backgroundImage ?? defaults.hero.backgroundImage,
      trustLine: pickString(cms.hero.trustLine, defaults.hero.trustLine ?? ""),
    },
    programs: pickArray(cms.programs, defaults.programs),
    highlights: pickArray(cms.highlights, defaults.highlights),
    stats: pickArray(cms.stats, defaults.stats),
    news: mergeNewsItems(cms.news, defaults.news),
    gallery: mergeGalleryItems(cms.gallery, defaults.gallery),
    partners: pickArray(cms.partners, defaults.partners),
    admissionSteps: pickArray(cms.admissionSteps, defaults.admissionSteps),
    articleCards: pickArray(cms.articleCards, defaults.articleCards),
    articlesSectionLead: pickString(cms.articlesSectionLead, defaults.articlesSectionLead),
    excellence,
    virtualTour,
    mediaTicker: pickArray(cms.mediaTicker, defaults.mediaTicker),
    policyBullets: pickArray(cms.policyBullets, defaults.policyBullets),
  }
}
