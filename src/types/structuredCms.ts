/** Public API: GET /api/settings */
export type CmsSettingsApiResponse = {
  settings: Record<string, string | null | undefined>
}

/** Public API: GET /api/pages/{slug}?locale= */
export type CmsPageBundleItem = {
  id: number
  title: string | null
  description: string | null
  image: string | null
  icon: string | null
  link: string | null
  order: number
}

export type CmsPageBundleSection = {
  id: number
  type: string
  title: string | null
  subtitle: string | null
  order: number
  is_active: boolean
  items: CmsPageBundleItem[]
}

export type CmsPageBundlePage = {
  id: number
  title: string
  page_subtitle?: string | null
  body_html?: string | null
  slug: string
  locale: string
  meta_title: string | null
  meta_description: string | null
  header_background?: string | null
}

export type CmsPageBundleResponse = {
  fallback: boolean
  page: CmsPageBundlePage | null
  sections: CmsPageBundleSection[]
}
