import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { usePublicLocale } from "../../hooks/usePublicLocale"
import type { HeroContent } from "../../types/cms"

interface HomeHeroLuxuryProps {
  hero: HeroContent
  brand: string
  visionLine: string
  imageSrc: string
  imageAlt: string
}

export function HomeHeroLuxury({
  hero,
  brand,
  visionLine,
  imageSrc,
  imageAlt,
}: HomeHeroLuxuryProps) {
  const { t } = useTranslation()
  const { href } = usePublicLocale()

  return (
    <section className="hl-hero" id="home" aria-labelledby="hl-hero-heading">
      <div className="hl-hero__media" aria-hidden={false}>
        <img src={imageSrc} alt={imageAlt} width={1920} height={1080} fetchPriority="high" decoding="async" />
      </div>
      <div className="hl-hero__scrim" aria-hidden />
      <div className="hl-hero__inner">
        <p className="hl-hero__eyebrow">{brand}</p>
        <p className="hl-hero__slogan">{t("brandSlogan")}</p>
        <p className="hl-hero__tagline">{visionLine}</p>
        <h1 id="hl-hero-heading">{hero.title}</h1>
        <p className="hl-hero__subtitle">{hero.subtitle}</p>
        <div className="hl-hero__actions">
          <Link to={href("/contact")} className="hl-btn hl-btn--primary">
            {hero.primaryCta}
          </Link>
          <Link to={href("/registration")} className="hl-btn hl-btn--ghost">
            {hero.secondaryCta}
          </Link>
          <Link to={href("/media")} className="hl-btn hl-btn--outline">
            {t("hero.newsLink")}
          </Link>
        </div>
        <p className="hl-hero__meta">
          <span>
            <span className="hl-hero__meta-dot" aria-hidden />
            {hero.location}
          </span>
          <span>{t("homeLuxury.hero.metaLine")}</span>
        </p>
      </div>
    </section>
  )
}
