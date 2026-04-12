export type CmsSectionItemRow = {
  id: number
  cms_section_id: number
  title: string | null
  description: string | null
  image: string | null
  icon: string | null
  link: string | null
  sort_order: number
}

export type CmsSectionRow = {
  id: number
  cms_page_id: number
  type: string
  title: string | null
  subtitle: string | null
  sort_order: number
  is_active: boolean
  items: CmsSectionItemRow[]
}

/** Admin API: GET/PATCH /api/admin/cms-pages/{id} */
export type CmsPageRow = {
  id: number
  title: string
  page_subtitle?: string | null
  body_html?: string | null
  slug: string
  locale: string
  meta_title: string | null
  meta_description: string | null
  header_background?: string | null
  is_active: boolean
  published_at: string | null
  sections: CmsSectionRow[]
}

export function collectImageUrlsFromSections(sections: CmsSectionRow[], extraUrls: string[] = []): string[] {
  const s = new Set<string>()
  for (const raw of extraUrls) {
    const u = raw?.trim()
    if (u) {
      s.add(u)
    }
  }
  for (const sec of sections) {
    for (const it of sec.items) {
      const u = it.image?.trim()
      if (u) {
        s.add(u)
      }
    }
  }
  return [...s].sort()
}
