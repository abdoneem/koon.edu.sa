import { useTranslation } from "react-i18next"
import type { HighlightContent } from "../../types/cms"

interface HomeWhyLuxuryProps {
  highlights: HighlightContent[]
}

export function HomeWhyLuxury({ highlights }: HomeWhyLuxuryProps) {
  const { t } = useTranslation()

  return (
    <section className="hl-section hl-why" id="why-koon" aria-labelledby="hl-why-heading">
      <div className="hl-wrap">
        <p className="hl-kicker">{t("homeLuxury.why.kicker")}</p>
        <h2 id="hl-why-heading">{t("homeLuxury.why.title")}</h2>
        <p className="hl-lead">{t("homeLuxury.why.lead")}</p>
        <div className="hl-why__grid">
          {highlights.map((item) => (
            <article key={item.id || item.title} className="hl-why__card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
