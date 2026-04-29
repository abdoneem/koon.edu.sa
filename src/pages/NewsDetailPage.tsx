import { useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"
import { MarkdownBody } from "../components/MarkdownBody"
import { PageLayout } from "../components/PageLayout"
import { SitePageHero } from "../components/site/SitePageHero"
import { siteImagery } from "../content/siteImagery"
import { newsCoverOrFallback } from "../content/siteImagery"
import { useHomePageBundle } from "../hooks/useHomePageBundle"
import { usePublicLocale } from "../hooks/usePublicLocale"
import type { HomeNewsItem } from "../types/homePageBundle"
import { coalesceArray } from "../utils/coalesce"
import { formatNewsDateForDisplay, newsDateTimeAttr } from "../utils/newsDateInput"

function normalizeNewsItems(raw: unknown): HomeNewsItem[] {
  if (!Array.isArray(raw)) {
    return []
  }
  const out: HomeNewsItem[] = []
  for (const it of raw) {
    if (typeof it !== "object" || it === null) {
      continue
    }
    const o = it as Record<string, unknown>
    const id = typeof o.id === "string" ? o.id : ""
    const title = typeof o.title === "string" ? o.title : ""
    const excerpt = typeof o.excerpt === "string" ? o.excerpt : ""
    if (id.trim() === "" || title.trim() === "" || excerpt.trim() === "") {
      continue
    }
    const date = typeof o.date === "string" ? o.date : undefined
    const image = typeof o.image === "string" ? o.image : undefined
    const slug = typeof o.slug === "string" ? o.slug : undefined
    const body = typeof o.body === "string" ? o.body : undefined
    const publishedAt = typeof o.publishedAt === "string" ? o.publishedAt : undefined
    out.push({ id, slug, title, excerpt, date, image, body, publishedAt })
  }
  return out
}

export function NewsDetailPage() {
  const { t, i18n } = useTranslation()
  const { href } = usePublicLocale()
  const { id } = useParams<{ id: string }>()
  const { bundle } = useHomePageBundle()

  const i18nRaw = t("newsPage.items", { returnObjects: true }) as unknown
  const i18nItems = useMemo(() => normalizeNewsItems(i18nRaw), [i18nRaw])
  const items = coalesceArray(i18nItems, bundle.news)
  const slugOrId = id ?? ""
  const item = items.find((x) => x.slug === slugOrId) ?? items.find((x) => x.id === slugOrId)

  const heroTitle = item?.title ?? t("newsPage.title")
  const heroLead = item?.excerpt ?? t("newsPage.lead")
  const imageSrc = item?.image?.trim() || (item ? newsCoverOrFallback(item.id) : siteImagery.pageHero.contact)
  const imageAlt = item?.title ?? t("contactPage.heroImageAlt")
  const seoTitle = item ? `${item.title} | ${t("seo.siteName")}` : t("seo.paths.media.title")
  const seoDesc = item?.excerpt ?? t("seo.paths.media.description")

  return (
    <PageLayout>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
      </Helmet>
      <div className="site-page-premium">
        <SitePageHero
          eyebrow={t("newsPage.title")}
          title={heroTitle}
          lead={heroLead}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
        />

        <section className="home-section home-section--surface site-page-premium__band-first site-page-article-band">
          <div className="container home-section__inner site-page-prose">
            <p className="site-page-article-back">
              <Link className="home-text-link" to={href("/news")}>
                {t("mediaCenterPage.newsAllLabel")}
              </Link>
            </p>

            {!item ? (
              <p className="card-elevated site-page-status">{t("common.contentLoadError")}</p>
            ) : (
              <article className="site-page-article">
                {item.date ? (
                  <div className="site-page-article-meta">
                    <time
                      className="site-page-article-meta__date"
                      {...(() => {
                        const attr = newsDateTimeAttr(item.date)
                        return attr ? { dateTime: attr } : {}
                      })()}
                    >
                      {formatNewsDateForDisplay(item.date, i18n.language)}
                    </time>
                  </div>
                ) : null}
                <p className="site-page-article-lead">{item.excerpt}</p>
                <MarkdownBody markdown={item.body ?? ""} className="site-markdown--article" />
              </article>
            )}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}

