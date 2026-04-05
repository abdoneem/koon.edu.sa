import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { siteImagery } from "../../content/siteImagery"
import { coalesceString } from "../../utils/coalesce"
import type { HomePageBundle } from "../../types/homePageBundle"

interface Props {
  bundle: HomePageBundle
  hasLiveCms: boolean
}

export function HomeDocHeroPremium({ bundle, hasLiveCms }: Props) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  const bgUrl = bundle.hero.backgroundImage?.url ?? siteImagery.hero
  const bgAlt = bundle.hero.backgroundImage?.alt ?? ""

  const headline = hasLiveCms ? coalesceString(bundle.hero.title, t("brand")) : t("brand")
  const lead = hasLiveCms
    ? coalesceString(bundle.hero.subtitle, t("brandSlogan"))
    : coalesceString(t("brandSlogan"), bundle.hero.subtitle)
  // When CMS provides hero.location, prefer it so the line matches the hero image/caption (avoids Madinah tagline + Riyadh photo).
  const metaLine = hasLiveCms
    ? coalesceString(bundle.hero.location, t("hero.visionLine"))
    : coalesceString(t("hero.visionLine"), bundle.hero.location)

  return (
    <motion.section
      id="top"
      className="home-hero-premium"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="home-hero-premium__media">
        <img src={bgUrl} alt={bgAlt} width={1920} height={900} fetchPriority="high" decoding="async" />
        <div className="home-hero-premium__scrim" aria-hidden />
        <div className="home-hero-premium__grain" aria-hidden />
      </div>

      <div className="container home-hero-premium__shell">
        <div className="home-hero-premium__center">
          <p className="home-hero-premium__eyebrow">{t("homePage.heroKicker")}</p>
          <h1 className="home-hero-premium__title">{headline}</h1>
          <p className="home-hero-premium__lead">{lead}</p>
          <p className="home-hero-premium__meta">{metaLine}</p>
          {bundle.hero.trustLine ? <p className="home-hero-premium__trust">{bundle.hero.trustLine}</p> : null}

          <div className="home-hero-premium__ctas">
            <a href="#book-tour" className="home-btn home-btn--hero-book home-btn--lg">
              {t("nav.bookTour")}
            </a>
            <Link to="/registration" className="home-btn home-btn--secondary home-btn--lg">
              {t("nav.registration")}
            </Link>
            <a href="#news" className="home-btn home-btn--ghost home-btn--lg home-hero-premium__cta--tertiary">
              {t("hero.newsLink")}
            </a>
          </div>

          <div className="home-hero-premium__stats" aria-label={t("homePage.statsAria")}>
            {bundle.stats.map((s) => (
              <div key={s.label} className="home-hero-stat">
                <span className="home-hero-stat__value">{s.value}</span>
                <span className="home-hero-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
