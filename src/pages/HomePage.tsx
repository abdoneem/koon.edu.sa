import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { HomeHeroInlineModal } from "../components/inline/HomeHeroInlineModal"
import { HomeHighlightsInlineModal } from "../components/inline/HomeHighlightsInlineModal"
import { HomeLandingBulkEditModal, type LandingBulkSection } from "../components/inline/HomeLandingBulkEditModal"
import { HomeBookTourFab } from "../components/home/HomeBookTourFab"
import { HomeDocHeroPremium } from "../components/home/HomeDocHeroPremium"
import { HomeLandingSections } from "../components/home/HomeLandingSections"
import { PageLayout } from "../components/PageLayout"
import { useInlineEdit } from "../context/InlineEditContext"
import { newsCoverOrFallback } from "../content/siteImagery"
import { useHomePageBundle } from "../hooks/useHomePageBundle"
import { usePublicLocale } from "../hooks/usePublicLocale"
import type { HighlightContent } from "../types/cms"
import type { HomeNewsItem } from "../types/homePageBundle"
import { coalesceArray } from "../utils/coalesce"
import { formatNewsDateForDisplay, newsDateTimeAttr } from "../utils/newsDateInput"

export function HomePage() {
  const { t, i18n } = useTranslation()
  const { href } = usePublicLocale()
  const location = useLocation()
  const reduce = useReducedMotion()
  const { bundle, hasLiveCms, locale, refetch } = useHomePageBundle()
  const { available: inlineAvailable, enabled: inlineEnabled } = useInlineEdit()
  const [heroModalOpen, setHeroModalOpen] = useState(false)
  const [highlightsModalOpen, setHighlightsModalOpen] = useState(false)
  const [bulkSection, setBulkSection] = useState<LandingBulkSection | null>(null)

  const i18nHighlights = t("highlights.items", { returnObjects: true }) as HighlightContent[] | undefined
  const displayHighlights = coalesceArray(i18nHighlights, bundle.highlights)

  const i18nNews = t("newsPage.items", { returnObjects: true }) as HomeNewsItem[] | undefined
  const newsItems = coalesceArray(i18nNews, bundle.news)

  useEffect(() => {
    const raw = location.hash.replace(/^#/, "")
    if (!raw) {
      return
    }
    const id = decodeURIComponent(raw)
    const tmr = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
    }, 80)
    return () => window.clearTimeout(tmr)
  }, [location.hash, location.pathname, reduce])

  const showHeroInline = inlineAvailable && inlineEnabled

  return (
    <PageLayout>
      <div className="home-page">
        <HomeDocHeroPremium
          bundle={bundle}
          hasLiveCms={hasLiveCms}
          inlineEditEnabled={showHeroInline}
          onInlineEditHero={() => setHeroModalOpen(true)}
          onInlineEditStats={() => setBulkSection("stats")}
        />

        {showHeroInline ? (
          <HomeHeroInlineModal
            opened={heroModalOpen}
            onClose={() => setHeroModalOpen(false)}
            locale={locale}
            hero={bundle.hero}
            onSaved={refetch}
          />
        ) : null}

        <HomeLandingSections
          bundle={bundle}
          highlights={displayHighlights}
          inlineEditEnabled={showHeroInline}
          onInlineEditHighlights={() => setHighlightsModalOpen(true)}
          onEditBulkSection={(s) => setBulkSection(s)}
        />

        {showHeroInline ? (
          <HomeHighlightsInlineModal
            opened={highlightsModalOpen}
            onClose={() => setHighlightsModalOpen(false)}
            locale={locale}
            highlights={displayHighlights}
            onSaved={refetch}
          />
        ) : null}

        {showHeroInline ? (
          <HomeLandingBulkEditModal
            opened={bulkSection !== null}
            onClose={() => setBulkSection(null)}
            locale={locale}
            section={bulkSection}
            bundle={bundle}
            onSaved={refetch}
          />
        ) : null}

        <section id="news" className="home-section home-section--news" aria-labelledby="home-news-heading">
          <div className="container">
            <div className="home-news-block__head">
              <h2 id="home-news-heading" className="home-display">
                {t("homePage.latestNewsHeading")}
              </h2>
              <div className="home-news-block__actions">
                {showHeroInline ? (
                  <button
                    type="button"
                    className="home-inline-section-edit"
                    onClick={() => setBulkSection("news")}
                    aria-label={t("inlineEdit.editLatestNewsAria")}
                  >
                    {t("inlineEdit.editLatestNews")}
                  </button>
                ) : null}
                <Link to={href("/news")} className="home-text-link">
                  {t("homePage.homeNewsMore")}
                </Link>
              </div>
            </div>
            <ul className="home-news-grid">
              {newsItems.map((item) => (
                <li key={item.id} className="home-grid-item-li">
                  <Link
                    to={href(`/news/${encodeURIComponent(item.slug?.trim() || item.id)}`)}
                    className="home-news-card-link"
                  >
                    <motion.div
                      className="home-news-card-elevated"
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{ duration: 0.35 }}
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
                          <span className="home-news-card__overlay-text">{t("homePage.latestNewsHeading")}</span>
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
                    </motion.div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <HomeBookTourFab />
      </div>
    </PageLayout>
  )
}
