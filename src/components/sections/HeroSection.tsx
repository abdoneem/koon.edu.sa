import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { usePublicLocale } from "../../hooks/usePublicLocale"
import type { HeroContent } from "../../types/cms"

interface HeroSectionProps {
  hero: HeroContent
  brand: string
  visionLine: string
  heroImageSrc: string
  heroImageAlt: string
  heroImageCaption: string
  /** Defaults preserve conversion flow when CMS only supplies CTA labels. */
  primaryTo?: string
  secondaryTo?: string
}

export function HeroSection({
  hero,
  brand,
  visionLine,
  heroImageSrc,
  heroImageAlt,
  heroImageCaption,
  primaryTo = "/contact",
  secondaryTo = "/registration",
}: HeroSectionProps) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const
  const programsLinkLabel = t("hero.programsLink")

  return (
    <section id="home" className="hero-section hero-section--brand">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-grid">
        {reduce ? (
          <>
            <div className="hero-copy">
              <HeroCopyContent
                brand={brand}
                visionLine={visionLine}
                hero={hero}
                primaryTo={primaryTo}
                secondaryTo={secondaryTo}
                programsLinkLabel={programsLinkLabel}
              />
            </div>
            <div className="hero-visual">
              <HeroVisual
                heroImageSrc={heroImageSrc}
                heroImageAlt={heroImageAlt}
                heroImageCaption={heroImageCaption}
              />
            </div>
          </>
        ) : (
          <>
            <motion.div
              className="hero-copy"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease }}
            >
              <HeroCopyContent
                brand={brand}
                visionLine={visionLine}
                hero={hero}
                primaryTo={primaryTo}
                secondaryTo={secondaryTo}
                programsLinkLabel={programsLinkLabel}
              />
            </motion.div>
            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, y: 36, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.1, ease }}
            >
              <HeroVisual
                heroImageSrc={heroImageSrc}
                heroImageAlt={heroImageAlt}
                heroImageCaption={heroImageCaption}
              />
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}

function HeroCopyContent({
  brand,
  visionLine,
  hero,
  primaryTo,
  secondaryTo,
  programsLinkLabel,
}: {
  brand: string
  visionLine: string
  hero: HeroContent
  primaryTo: string
  secondaryTo: string
  programsLinkLabel: string
}) {
  const { href } = usePublicLocale()
  return (
    <>
      <p className="eyebrow">{brand}</p>
      <p className="vision-ribbon">{visionLine}</p>
      <h1>{hero.title}</h1>
      <p className="hero-subtitle">{hero.subtitle}</p>
      <div className="hero-actions">
        <Link to={href(primaryTo)} className="btn btn-primary">
          {hero.primaryCta}
        </Link>
        <Link to={href(secondaryTo)} className="btn btn-secondary">
          {hero.secondaryCta}
        </Link>
      </div>
      <p className="hero-programs-link-wrap">
        <Link to={href("/academics")} className="hero-programs-link">
          {programsLinkLabel}
        </Link>
      </p>
      <p className="location">
        <span className="location-dot" aria-hidden="true" />
        {hero.location}
      </p>
    </>
  )
}

function HeroVisual({
  heroImageSrc,
  heroImageAlt,
  heroImageCaption,
}: {
  heroImageSrc: string
  heroImageAlt: string
  heroImageCaption: string
}) {
  return (
    <>
      <div className="hero-visual-card hero-visual-card--immersive">
        <div className="hero-visual-card__media">
          <img
            src={heroImageSrc}
            alt={heroImageAlt}
            width={960}
            height={720}
            fetchPriority="high"
            decoding="async"
            className="hero-visual-card__img"
          />
          <div className="hero-visual-card__wash" aria-hidden="true" />
        </div>
        <p className="hero-visual-card__caption">{heroImageCaption}</p>
      </div>
      <div className="hero-badge" role="note">
        <span className="hero-badge__title">KOON</span>
        <span className="hero-badge__sub">Riyadh</span>
      </div>
    </>
  )
}
