import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { FigureImage } from "../components/FigureImage"
import { PageLayout } from "../components/PageLayout"
import { facilitiesZoneImage, siteImagery } from "../content/siteImagery"

export function FacilitiesPage() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const zones = t("facilitiesPage.zones", { returnObjects: true }) as {
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
            <h1 className="page-title">{t("facilitiesPage.title")}</h1>
            <p className="page-subtitle page-hero-lead">{t("facilitiesPage.lead")}</p>
          </div>
        </header>
        <div className="container page-inline-hero-wrap">
          <FigureImage
            src={siteImagery.pageHero.facilities}
            alt={t("facilitiesPage.heroImageAlt")}
            className="page-inline-hero-media"
            width={1200}
            height={480}
          />
        </div>
        <section className="section container">
          <div className="facilities-grid">
            {zones.map((z, i) => (
              <motion.article
                key={z.title}
                className="facility-card"
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: reduce ? 0 : i * 0.05, duration: 0.4 }}
              >
                <div className="facility-card__media">
                  <img
                    src={facilitiesZoneImage(i)}
                    alt={z.photoAlt}
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    className="facility-card__img"
                  />
                </div>
                <div className="facility-card__body">
                  <span className="facility-num">{String(i + 1).padStart(2, "0")}</span>
                  <h2>{z.title}</h2>
                  <p>{z.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </motion.div>
    </PageLayout>
  )
}
