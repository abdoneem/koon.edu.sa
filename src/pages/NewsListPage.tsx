import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
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

export function NewsListPage() {
  const { t, i18n } = useTranslation()
  const { href } = usePublicLocale()
  const { bundle } = useHomePageBundle()

  const i18nRaw = t("newsPage.items", { returnObjects: true }) as unknown
  const i18nItems = useMemo(() => normalizeNewsItems(i18nRaw), [i18nRaw])
  const items = coalesceArray(i18nItems, bundle.news)

  return (
    <PageLayout>
      <div className="site-page-premium">
        <SitePageHero
          eyebrow={t("nav.home")}
          title={t("newsPage.title")}
          lead={t("newsPage.lead")}
          imageSrc={siteImagery.pageHero.contact}
          imageAlt={t("contactPage.heroImageAlt")}
        />

        <section className="home-section home-section--surface site-page-premium__band-first">
          <div className="container home-section__inner">
            {items.length === 0 ? <p className="card-elevated site-page-status">{t("common.contentLoadError")}</p> : null}

            <ul className="home-news-grid" role="list">
              {items.map((item) => (
                <li key={item.id} className="home-grid-item-li">
                  <Link
                    to={href(`/news/${encodeURIComponent(item.slug?.trim() || item.id)}`)}
                    className="home-news-card-elevated"
                  >
                    <div className="home-news-card__media">
                      <img
                        src={item.image?.trim() || newsCoverOrFallback(item.id)}
                        alt={item.title}
                        width={960}
                        height={540}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="home-news-card__overlay" aria-hidden>
                        <span className="home-news-card__overlay-text">{t("newsPage.title")}</span>
                      </div>
                    </div>
                    <div className="home-news-card__body">
                      <h3>{item.title}</h3>
                      {item.date ? (
                        <time
                          className="home-news-card__date"
                          {...(() => {
                            const attr = newsDateTimeAttr(item.date)
                            return attr ? { dateTime: attr } : {}
                          })()}
                        >
                          {formatNewsDateForDisplay(item.date, i18n.language)}
                        </time>
                      ) : null}
                      <p>{item.excerpt}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}

