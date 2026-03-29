import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { facilitiesTeaserImageForIndex } from "../../content/siteImagery"
import { IconBadge } from "../IconBadge"
import { IconBook, IconFlask, IconLandmark } from "../icons/schoolIcons"

const teaserIcons = [IconFlask, IconBook, IconLandmark] as const

const FACILITY_ALT_KEYS = [
  "imagery.facilityScienceAlt",
  "imagery.facilityLibraryAlt",
  "imagery.facilitySportsAlt",
] as const

export function FacilitiesTeaserSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const items = t("home.facilitiesTeaser.items", { returnObjects: true }) as {
    title: string
    description: string
  }[]

  return (
    <section
      className="section facilities-teaser-section facilities-teaser-section--panorama"
      aria-labelledby="facilities-teaser-heading"
    >
      <div className="container">
        <div className="section-head section-head--accent">
          <p className="eyebrow">{t("home.facilitiesTeaser.eyebrow")}</p>
          <h2 id="facilities-teaser-heading">{t("home.facilitiesTeaser.title")}</h2>
          <p className="section-lead">{t("home.facilitiesTeaser.lead")}</p>
        </div>
        <div className="facilities-teaser-grid">
          {items.map((item, i) => {
            const Ic = teaserIcons[i] ?? teaserIcons[0]
            return (
              <motion.article
                key={item.title}
                className="facilities-teaser-card"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduce ? 0 : i * 0.07, duration: 0.4 }}
              >
                <div className="facilities-teaser-card__visual">
                  <img
                    src={facilitiesTeaserImageForIndex(i)}
                    alt={t(FACILITY_ALT_KEYS[i] ?? FACILITY_ALT_KEYS[0])}
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    className="facilities-teaser-card__img"
                  />
                </div>
                <IconBadge variant="default">
                  <Ic className="icon-badge__svg" size={22} />
                </IconBadge>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
            )
          })}
        </div>
        <div className="facilities-teaser-cta-wrap">
          <Link to="/facilities" className="btn btn-secondary facilities-teaser-cta">
            {t("home.facilitiesTeaser.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  )
}
