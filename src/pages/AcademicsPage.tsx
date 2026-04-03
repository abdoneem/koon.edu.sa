import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { FigureImage } from "../components/FigureImage"
import { PageLayout } from "../components/PageLayout"
import { academicsBlockImage, siteImagery } from "../content/siteImagery"

export function AcademicsPage() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const blocks = t("academicsPage.blocks", { returnObjects: true }) as {
    title: string
    description: string
    photoAlt: string
  }[]

  return (
    <PageLayout>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <header className="page-hero-slab">
          <div className="container">
            <h1 className="page-title">{t("academicsPage.title")}</h1>
            <p className="page-subtitle page-hero-lead">{t("academicsPage.lead")}</p>
          </div>
        </header>
        <div className="container page-inline-hero-wrap">
          <FigureImage
            src={siteImagery.pageHero.academics}
            alt={t("academicsPage.heroImageAlt")}
            className="page-inline-hero-media"
            width={1200}
            height={480}
          />
        </div>
        <section className="section container">
          <div className="cards-grid academic-cards">
            {blocks.map((b, i) => (
              <article key={b.title} className="card program-card academic-block-card">
                <div className="program-card__visual">
                  <img
                    src={academicsBlockImage(i)}
                    alt={b.photoAlt}
                    width={640}
                    height={280}
                    loading="lazy"
                    decoding="async"
                    className="program-card__img"
                  />
                </div>
                <h2>{b.title}</h2>
                <p>{b.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section container">
          <h2 className="page-title page-title--section">{t("academicsStagesDetail.title")}</h2>
          <div className="highlight-grid">
            <article className="highlight-card">
              <h3>{t("academicsStagesDetail.earlyTitle")}</h3>
              <p>{t("academicsStagesDetail.earlyBody")}</p>
            </article>
            <article className="highlight-card">
              <h3>{t("academicsStagesDetail.primaryTitle")}</h3>
              <p>{t("academicsStagesDetail.primaryBody")}</p>
            </article>
            <article className="highlight-card">
              <h3>{t("academicsStagesDetail.secondaryTitle")}</h3>
              <p>{t("academicsStagesDetail.secondaryBody")}</p>
            </article>
          </div>
        </section>

        <section className="section container">
          <article className="card about-extended__block">
            <h2 className="about-extended__h2">{t("bilingualPhilosophy.title")}</h2>
            <p>{t("bilingualPhilosophy.lead")}</p>
            <ul className="about-extended__list">
              {(t("bilingualPhilosophy.points", { returnObjects: true }) as string[]).map((pt) => (
                <li key={pt.slice(0, 40)}>{pt}</li>
              ))}
            </ul>
          </article>
        </section>
      </motion.div>
    </PageLayout>
  )
}
