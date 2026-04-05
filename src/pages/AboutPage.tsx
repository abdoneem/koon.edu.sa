import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { CmsStructuredBlocks } from "../components/cms/CmsStructuredBlocks"
import { PageLayout } from "../components/PageLayout"
import { SitePageHero } from "../components/site/SitePageHero"
import { siteImagery } from "../content/siteImagery"

type Pillar = { id: string; title: string; description: string }

export function AboutPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const pathKey = pathname.replace(/\/$/, "") || "/"
  const reduce = useReducedMotion()

  const pillarsRaw = t("aboutPage.pillars", { returnObjects: true }) as Pillar[] | undefined
  const pillars = Array.isArray(pillarsRaw) && pillarsRaw.length > 0 ? pillarsRaw : []

  const introParagraphsRaw = t("aboutExtended.introParagraphs", { returnObjects: true }) as string[] | undefined
  const introParagraphs = Array.isArray(introParagraphsRaw) ? introParagraphsRaw : []

  const chairmanBodyRaw = t("aboutExtended.chairmanBody", { returnObjects: true }) as string[] | undefined
  const chairmanBody = Array.isArray(chairmanBodyRaw) ? chairmanBodyRaw : []

  const valuesRaw = t("aboutExtended.values", { returnObjects: true }) as { title: string; body: string }[] | undefined
  const values = Array.isArray(valuesRaw) ? valuesRaw : []

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
          eyebrow={t("nav.about")}
          title={t("aboutPage.title")}
          lead={t("aboutPage.description")}
          imageSrc={siteImagery.about}
          imageAlt={t("imagery.aboutHeroAlt")}
        />

        <CmsStructuredBlocks pathKey={pathKey} />

        <section className="home-section home-section--surface site-page-premium__band-first">
          <div className="container home-section__inner">
            {pillars.length > 0 ? (
              <ul className="site-pillar-grid" role="list">
                {pillars.map((pillar) => (
                  <li key={pillar.id}>
                    <motion.article className="card-elevated site-pillar-card" {...motionBlock}>
                      <h3 className="home-display home-display--sm">{pillar.title}</h3>
                      <p className="site-pillar-card__desc">{pillar.description}</p>
                    </motion.article>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        {introParagraphs.length > 0 ? (
          <section className="home-section home-section--muted">
            <div className="container home-section__inner site-page-prose">
              {introParagraphs.map((para) => (
                <p key={para.slice(0, 48)} className="home-lead site-page-prose__para">
                  {para}
                </p>
              ))}
              <p className="site-page-callout">{t("aboutExtended.strategicGoalsLead")}</p>
            </div>
          </section>
        ) : null}

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
          </div>
        </section>

        <section className="home-section home-section--muted">
          <div className="container home-section__inner">
            <div className="site-split-vision">
              <motion.article className="card-elevated site-content-card" {...motionBlock}>
                <h2 className="home-display home-display--sm">{t("aboutExtended.visionBlockTitle")}</h2>
                <p className="site-pillar-card__desc">{t("aboutExtended.visionBlockBody")}</p>
              </motion.article>
              <motion.article className="card-elevated site-content-card" {...motionBlock}>
                <h2 className="home-display home-display--sm">{t("aboutExtended.missionBlockTitle")}</h2>
                <p className="site-pillar-card__desc">{t("aboutExtended.missionBlockBody")}</p>
              </motion.article>
            </div>
          </div>
        </section>

        {values.length > 0 ? (
          <section className="home-section home-section--surface">
            <div className="container home-section__inner">
              <header className="home-section__head">
                <h2 className="home-display">{t("aboutExtended.valuesTitle")}</h2>
              </header>
              <ul className="site-values-grid" role="list">
                {values.map((v, i) => (
                  <li key={v.title}>
                    <article className={`card-elevated site-value-card site-value-card--${(i % 5) + 1}`}>
                      <h3 className="home-display home-display--sm">{v.title}</h3>
                      <p className="site-pillar-card__desc">{v.body}</p>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="home-section home-section--why site-page-chairman-wrap">
          <div className="home-section__bg home-section__bg--mesh" aria-hidden />
          <div className="container home-section__inner">
            <motion.article className="site-chairman-card" {...motionBlock}>
              <h2 className="home-display home-display--light">{t("aboutExtended.chairmanTitle")}</h2>
              <p className="site-chairman-card__intro">{t("aboutExtended.chairmanIntro")}</p>
              {chairmanBody.map((para) => (
                <p key={para.slice(0, 48)} className="site-chairman-card__para">
                  {para}
                </p>
              ))}
              <p className="site-chairman-card__closing">{t("aboutExtended.chairmanClosing")}</p>
            </motion.article>

            <div className="site-page-cta-row">
              <Link to="/registration" className="home-btn home-btn--primary home-btn--lg">
                {t("nav.registration")}
              </Link>
              <Link to="/contact" className="home-btn home-btn--ghost home-btn--lg">
                {t("nav.contact")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
