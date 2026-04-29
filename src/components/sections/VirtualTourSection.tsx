import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { usePublicLocale } from "../../hooks/usePublicLocale"
import { siteImagery } from "../../content/siteImagery"
import { IconBadge } from "../IconBadge"
import { FigureImage } from "../FigureImage"
import { IconGlobe } from "../icons/schoolIcons"

export function VirtualTourSection() {
  const { t } = useTranslation()
  const { href } = usePublicLocale()
  const reduce = useReducedMotion()

  return (
    <section
      className="section virtual-tour-section section-surface section-surface--azure"
      aria-labelledby="virtual-tour-heading"
    >
      <div className="container">
        <motion.div
          className="virtual-tour-panel"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="virtual-tour-copy">
            <IconBadge variant="default">
              <IconGlobe className="icon-badge__svg" size={22} />
            </IconBadge>
            <h2 id="virtual-tour-heading">{t("home.virtualTour.title")}</h2>
            <p className="virtual-tour-lead">{t("home.virtualTour.lead")}</p>
            <p className="virtual-tour-hint">{t("home.virtualTour.hint")}</p>
          </div>
          <FigureImage
            src={siteImagery.virtualTour}
            alt={t("imagery.virtualTourAlt")}
            className="virtual-tour-media"
            width={720}
            height={450}
          />
          <div className="virtual-tour-actions">
            <Link to={href("/contact")} className="btn btn-primary">
              {t("home.virtualTour.primaryCta")}
            </Link>
            <Link to={href("/admissions")} className="btn btn-secondary">
              {t("home.virtualTour.secondaryCta")}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
