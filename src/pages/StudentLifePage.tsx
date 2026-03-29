import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { FigureImage } from "../components/FigureImage"
import { PageLayout } from "../components/PageLayout"
import { siteImagery, studentLifeBlockImage } from "../content/siteImagery"

export function StudentLifePage() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const blocks = t("studentLifePage.blocks", { returnObjects: true }) as {
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
        <header className="page-hero-slab page-hero-slab--accent">
          <div className="container">
            <h1 className="page-title">{t("studentLifePage.title")}</h1>
            <p className="page-subtitle page-hero-lead">{t("studentLifePage.lead")}</p>
          </div>
        </header>
        <div className="container page-inline-hero-wrap">
          <FigureImage
            src={siteImagery.pageHero.studentLife}
            alt={t("studentLifePage.heroImageAlt")}
            className="page-inline-hero-media"
            width={1200}
            height={480}
          />
        </div>
        <section className="section container">
          <ul className="life-pillars">
            {blocks.map((b, i) => (
              <li key={b.title} className="life-pillar">
                <div className="life-pillar__media">
                  <img
                    src={studentLifeBlockImage(i)}
                    alt={b.photoAlt}
                    width={800}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    className="life-pillar__img"
                  />
                </div>
                <h2>{b.title}</h2>
                <p>{b.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </motion.div>
    </PageLayout>
  )
}
