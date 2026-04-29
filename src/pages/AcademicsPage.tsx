import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { CmsStructuredBlocks } from "../components/cms/CmsStructuredBlocks"
import { usePublicLocale } from "../hooks/usePublicLocale"
import { stripLocaleFromPath } from "../i18n/localeRouting"
import { PageLayout } from "../components/PageLayout"
import { SitePageHero } from "../components/site/SitePageHero"
import { academicsBlockImage, siteImagery } from "../content/siteImagery"

type Block = { title: string; description: string; photoAlt: string }

export function AcademicsPage() {
  const { t } = useTranslation()
  const { href } = usePublicLocale()
  const { pathname } = useLocation()
  const { pathWithoutLocale } = stripLocaleFromPath(pathname)
  const pathKey = pathWithoutLocale.replace(/\/$/, "") || "/"
  const reduce = useReducedMotion()

  const blocksRaw = t("academicsPage.blocks", { returnObjects: true }) as Block[] | undefined
  const blocks = Array.isArray(blocksRaw) ? blocksRaw : []

  const bilingualPointsRaw = t("bilingualPhilosophy.points", { returnObjects: true }) as string[] | undefined
  const bilingualPoints = Array.isArray(bilingualPointsRaw) ? bilingualPointsRaw : []

  const motionBlock = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-32px" },
        transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <PageLayout>
      <div className="site-page-premium">
        <SitePageHero
          eyebrow={t("nav.academics")}
          title={t("academicsPage.title")}
          lead={t("academicsPage.lead")}
          imageSrc={siteImagery.pageHero.academics}
          imageAlt={t("academicsPage.heroImageAlt")}
        />

        <CmsStructuredBlocks pathKey={pathKey} />

        <section className="home-section home-section--surface site-page-premium__band-first">
          <div className="container home-section__inner">
            {blocks.length > 0 ? (
              <ul className="site-academic-grid" role="list">
                {blocks.map((b, i) => (
                  <li key={b.title}>
                    <motion.article className="card-elevated site-academic-card" {...motionBlock}>
                      <div className="site-academic-card__media">
                        <img
                          src={academicsBlockImage(i)}
                          alt={b.photoAlt}
                          width={640}
                          height={280}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="site-academic-card__body">
                        <h2 className="home-display home-display--sm">{b.title}</h2>
                        <p className="site-pillar-card__desc">{b.description}</p>
                      </div>
                    </motion.article>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section className="home-section home-section--muted">
          <div className="container home-section__inner">
            <header className="home-section__head home-section__head--center">
              <h2 className="home-display">{t("academicsStagesDetail.title")}</h2>
            </header>
            <ul className="site-stages-grid" role="list">
              <li>
                <article className="card-elevated site-stage-card site-stage-card--1">
                  <h3 className="home-display home-display--sm">{t("academicsStagesDetail.earlyTitle")}</h3>
                  <p className="site-pillar-card__desc">{t("academicsStagesDetail.earlyBody")}</p>
                </article>
              </li>
              <li>
                <article className="card-elevated site-stage-card site-stage-card--2">
                  <h3 className="home-display home-display--sm">{t("academicsStagesDetail.primaryTitle")}</h3>
                  <p className="site-pillar-card__desc">{t("academicsStagesDetail.primaryBody")}</p>
                </article>
              </li>
              <li>
                <article className="card-elevated site-stage-card site-stage-card--3">
                  <h3 className="home-display home-display--sm">{t("academicsStagesDetail.middleTitle")}</h3>
                  <p className="site-pillar-card__desc">{t("academicsStagesDetail.middleBody")}</p>
                </article>
              </li>
              <li>
                <article className="card-elevated site-stage-card site-stage-card--4">
                  <h3 className="home-display home-display--sm">{t("academicsStagesDetail.highTitle")}</h3>
                  <p className="site-pillar-card__desc">{t("academicsStagesDetail.highBody")}</p>
                </article>
              </li>
            </ul>
          </div>
        </section>

        <section className="home-section home-section--surface">
          <div className="container home-section__inner">
            <motion.article className="card-elevated site-content-card" {...motionBlock}>
              <h2 className="home-display home-display--sm">{t("bilingualPhilosophy.title")}</h2>
              <p className="home-lead home-lead--tight">{t("bilingualPhilosophy.lead")}</p>
              {bilingualPoints.length > 0 ? (
                <ul className="site-bullet-list">
                  {bilingualPoints.map((pt) => (
                    <li key={pt.slice(0, 40)}>{pt}</li>
                  ))}
                </ul>
              ) : null}
            </motion.article>

            <div className="site-page-cta-row site-page-cta-row--surface">
              <Link to={href("/admissions")} className="home-btn home-btn--primary home-btn--lg">
                {t("nav.admissions")}
              </Link>
              <Link to={href("/registration")} className="home-btn home-btn--secondary home-btn--lg">
                {t("nav.registration")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
