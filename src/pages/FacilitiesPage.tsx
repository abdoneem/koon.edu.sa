import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
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
        <header
          className="facilities-page-hero"
          style={{ backgroundImage: `url(${siteImagery.pageHero.facilities})` }}
        >
          <div className="facilities-page-hero__scrim" aria-hidden="true" />
          <div className="container facilities-page-hero__inner">
            <h1 id="facilities-hero-title" className="page-title facilities-page-hero__title">
              {t("facilitiesPage.title")}
            </h1>
            <p className="page-subtitle facilities-page-hero__lead">{t("facilitiesPage.lead")}</p>
          </div>
        </header>
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
