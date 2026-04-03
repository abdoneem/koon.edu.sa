import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { IconBadge } from "../IconBadge"
import { IconLanguages } from "../icons/schoolIcons"

export function BilingualValueSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const points = t("home.bilingual.points", { returnObjects: true }) as string[]

  return (
    <section
      className="section bilingual-value-section section-surface section-surface--parchment"
      aria-labelledby="bilingual-value-heading"
    >
      <div className="container bilingual-value-inner">
        <motion.div
          className="bilingual-value-copy"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
        >
          <p className="eyebrow">{t("home.bilingual.eyebrow")}</p>
          <h2 id="bilingual-value-heading">{t("home.bilingual.title")}</h2>
          <p className="section-lead bilingual-value-lead">{t("home.bilingual.lead")}</p>
        </motion.div>
        <ul className="bilingual-value-points">
          {points.map((text, i) => (
            <motion.li
              key={text}
              className="bilingual-value-point"
              initial={reduce ? false : { opacity: 0, x: -12 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.4 }}
            >
              <span className="bilingual-value-point__mark" aria-hidden>
                <IconBadge variant="sky">
                  <IconLanguages className="icon-badge__svg" size={20} />
                </IconBadge>
              </span>
              <span className="bilingual-value-point__text">{text}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
