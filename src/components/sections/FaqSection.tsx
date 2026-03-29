import { useTranslation } from "react-i18next"
import { MotionSection } from "../MotionSection"
import { IconBadge } from "../IconBadge"
import { IconHelp } from "../icons/schoolIcons"

export function FaqSection() {
  const { t } = useTranslation()
  const items = t("home.faq.items", { returnObjects: true }) as { q: string; a: string }[]

  return (
    <MotionSection>
      <section
        className="section faq-section section-surface section-surface--frost"
        aria-labelledby="faq-heading"
      >
        <div className="container faq-inner">
          <div className="faq-head">
            <IconBadge variant="default">
              <IconHelp className="icon-badge__svg" size={24} />
            </IconBadge>
            <h2 id="faq-heading">{t("home.faq.title")}</h2>
          </div>
          <p className="section-lead">{t("home.faq.lead")}</p>
          <div className="faq-list">
            {items.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </MotionSection>
  )
}
