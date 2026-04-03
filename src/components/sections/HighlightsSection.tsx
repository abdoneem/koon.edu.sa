import { useTranslation } from "react-i18next"
import { highlightImageForIndex } from "../../content/siteImagery"
import type { HighlightContent } from "../../types/cms"
import { IconBadge } from "../IconBadge"
import { IconGlobe, IconHeartHandshake, IconLandmark, IconLightbulb } from "../icons/schoolIcons"

const highlightIcons = [IconGlobe, IconLandmark, IconLightbulb, IconHeartHandshake] as const

const HIGHLIGHT_ALT_KEYS = [
  "imagery.highlightH1Alt",
  "imagery.highlightH2Alt",
  "imagery.highlightH3Alt",
  "imagery.highlightH4Alt",
] as const

interface HighlightsSectionProps {
  title: string
  lead: string
  highlights: HighlightContent[]
}

export function HighlightsSection({ title, lead, highlights }: HighlightsSectionProps) {
  const { t } = useTranslation()
  return (
    <section id="why-koon" className="section highlights-section section-surface section-surface--slate">
      <div className="container">
        <div className="section-head section-head--accent">
          <p className="eyebrow">{t("highlights.eyebrow")}</p>
          <h2>{title}</h2>
          <p className="section-lead">{lead}</p>
        </div>
        <div className="highlight-bento">
          {highlights.map((item, i) => {
            const Ic = highlightIcons[i] ?? highlightIcons[0]
            return (
              <article key={item.id || item.title} className="highlight-card highlight-card--overlay">
                <div className="highlight-card__overlay-visual">
                  <img
                    src={highlightImageForIndex(i)}
                    alt={t(HIGHLIGHT_ALT_KEYS[i] ?? HIGHLIGHT_ALT_KEYS[0])}
                    width={560}
                    height={320}
                    loading="lazy"
                    decoding="async"
                    className="highlight-card__overlay-img"
                  />
                  <div className="highlight-card__overlay-scrim" aria-hidden="true" />
                  <div className="highlight-card__overlay-copy">
                    <div className="highlight-card__meta highlight-card__meta--overlay">
                      <span className="highlight-index highlight-index--on-dark" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <IconBadge variant="light">
                        <Ic className="icon-badge__svg" size={22} />
                      </IconBadge>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
