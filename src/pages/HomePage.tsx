import { motion, useReducedMotion } from "framer-motion"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { HomeDocHeroPremium } from "../components/home/HomeDocHeroPremium"
import { HomeLandingSections } from "../components/home/HomeLandingSections"
import { PageLayout } from "../components/PageLayout"
import { newsCoverOrFallback } from "../content/siteImagery"
import { useHomePageBundle } from "../hooks/useHomePageBundle"
import type { HomeNewsItem } from "../types/homePageBundle"
import { coalesceArray } from "../utils/coalesce"

export function HomePage() {
  const { t } = useTranslation()
  const location = useLocation()
  const reduce = useReducedMotion()
  const { bundle, hasLiveCms } = useHomePageBundle()

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

  return (
    <PageLayout>
      <div className="home-page">
        <HomeDocHeroPremium bundle={bundle} hasLiveCms={hasLiveCms} />

        <HomeLandingSections bundle={bundle} />

        <section id="news" className="home-section home-section--news" aria-labelledby="home-news-heading">
          <div className="container">
            <div className="home-news-block__head">
              <h2 id="home-news-heading" className="home-display">
                {t("homePage.latestNewsHeading")}
              </h2>
              <a href="/#media" className="home-text-link">
                {t("homePage.homeNewsMore")}
              </a>
            </div>
            <ul className="home-news-grid">
              {newsItems.map((item) => (
                <li key={item.id} className="home-grid-item-li">
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
                      {item.date ? <time className="home-news-card__date" dateTime={item.date}>{item.date}</time> : null}
                      <p>{item.excerpt}</p>
                    </div>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
