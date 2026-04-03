import { useTranslation } from "react-i18next"
import { MotionSection } from "../MotionSection"
import { IconBadge } from "../IconBadge"
import { IconHelp } from "../icons/schoolIcons"

export function FaqSection({
  titleKey = "home.faq.title",
  leadKey = "home.faq.lead",
  itemsKey = "home.faq.items",
  headingId = "faq-heading",
}: {
  titleKey?: string
  leadKey?: string
  itemsKey?: string
  headingId?: string
}) {
  const { t } = useTranslation()
  const items = t(itemsKey, { returnObjects: true }) as { q: string; a: string }[]

  return (
    <MotionSection>
      <section
        className="section faq-section section-surface section-surface--frost"
        aria-labelledby={headingId}
      >
        <div className="container faq-inner">
          <div className="faq-head">
            <IconBadge variant="default">
              <IconHelp className="icon-badge__svg" size={24} />
            </IconBadge>
            <h2 id={headingId}>{t(titleKey)}</h2>
          </div>
          <p className="section-lead">{t(leadKey)}</p>
          <div className="faq-list">
            {items.map((item, i) => (
              <details key={`${i}-${item.q.slice(0, 32)}`} className="faq-item">
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
