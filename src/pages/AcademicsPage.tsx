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
      </motion.div>
    </PageLayout>
  )
}
