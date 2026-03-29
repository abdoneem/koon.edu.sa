import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { IconCheckCircle } from "../icons/schoolIcons"

export function TrustBadgesSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const items = t("home.trust.items", { returnObjects: true }) as string[]

  return (
    <section
      className="trust-badges-section section-surface section-surface--sky-bar"
      aria-label={t("home.trust.aria")}
    >
      <div className="container trust-marquee">
        <motion.ul
          className="trust-list"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
        >
          {items.map((text) => (
            <li key={text} className="trust-chip">
              <IconCheckCircle className="trust-chip__icon" size={18} />
              {text}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
