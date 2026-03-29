import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { quickLinkImageForIndex } from "../../content/siteImagery"
import { brand } from "../../config/brand"
import { IconBadge } from "../IconBadge"
import { IconCalendar, IconFileCheck, IconMessage } from "../icons/schoolIcons"

const linkConfig = {
  tour: { href: "/contact", external: false },
  whatsapp: { href: brand.whatsappHref, external: true },
  admissions: { href: "/admissions", external: false },
} as const

const linkIcons = {
  tour: IconCalendar,
  whatsapp: IconMessage,
  admissions: IconFileCheck,
} as const

type QuickId = keyof typeof linkConfig

export function QuickLinksSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const items = t("home.quickLinks.items", { returnObjects: true }) as {
    id: QuickId
    title: string
    description: string
    action: string
  }[]

  return (
    <section
      className="quick-links-section section-surface section-surface--canvas"
      aria-labelledby="quick-links-heading"
    >
      <div className="container">
        <h2 id="quick-links-heading" className="visually-hidden">
          {t("home.quickLinks.aria")}
        </h2>
        <div className="quick-links-grid">
          {items.map((item, i) => {
            const cfg = linkConfig[item.id]
            const Ic = linkIcons[item.id]
            const imgSrc = quickLinkImageForIndex(i)
            return (
              <motion.article
                key={item.id}
                className="quick-link-card"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: reduce ? 0 : i * 0.08, duration: 0.45 }}
              >
                <div className="quick-link-card__bg" aria-hidden="true">
                  <img src={imgSrc} alt="" className="quick-link-card__bg-img" width={640} height={400} />
                  <div className="quick-link-card__bg-scrim" />
                </div>
                <div className="quick-link-card__foreground">
                  <IconBadge variant="light">
                    <Ic className="icon-badge__svg" size={22} />
                  </IconBadge>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {cfg.external ? (
                    <a href={cfg.href} className="quick-link-cta--inverse" target="_blank" rel="noreferrer">
                      {item.action}
                    </a>
                  ) : (
                    <Link to={cfg.href} className="quick-link-cta--inverse">
                      {item.action}
                    </Link>
                  )}
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
