import { motion, useReducedMotion } from "framer-motion"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { quickLinkImageForId } from "../../content/siteImagery"
import { useCmsSite } from "../../context/CmsSiteContext"
import { IconBadge } from "../IconBadge"
import { IconCalendar, IconFileCheck, IconMessage } from "../icons/schoolIcons"

const linkIcons = {
  register: IconFileCheck,
  whatsapp: IconMessage,
  admissions: IconCalendar,
} as const

type QuickId = keyof typeof linkIcons

export function QuickLinksSection() {
  const { t } = useTranslation()
  const { whatsappHref } = useCmsSite()
  const reduce = useReducedMotion()

  const linkConfig = useMemo(
    () =>
      ({
        register: { href: "/registration", external: false },
        whatsapp: { href: whatsappHref, external: true },
        admissions: { href: "/admissions", external: false },
      }) as const,
    [whatsappHref],
  )

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
            const imgSrc = quickLinkImageForId(item.id)
            const ctaContent = (
              <>
                <span className="quick-link-cta__label">{item.action}</span>
                <svg
                  className="quick-link-cta__chevron"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 18l6-6-6-6"
                  />
                </svg>
              </>
            )
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
                  <img
                    src={imgSrc}
                    alt=""
                    className="quick-link-card__bg-img"
                    width={800}
                    height={500}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="quick-link-card__bg-scrim" />
                  <div className="quick-link-card__bg-vignette" />
                </div>
                <div className="quick-link-card__foreground">
                  <div className="quick-link-card__copy">
                    <IconBadge variant="light" className="quick-link-card__badge">
                      <Ic className="icon-badge__svg" size={22} />
                    </IconBadge>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="quick-link-card__cta-row">
                    {cfg.external ? (
                      <a href={cfg.href} className="quick-link-cta" target="_blank" rel="noreferrer">
                        {ctaContent}
                      </a>
                    ) : (
                      <Link to={cfg.href} className="quick-link-cta">
                        {ctaContent}
                      </Link>
                    )}
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
