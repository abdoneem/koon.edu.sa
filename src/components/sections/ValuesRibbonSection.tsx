import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { IconBadge } from "../IconBadge"
import { IconFlag, IconGraduation, IconHeartPulse, IconRocket } from "../icons/schoolIcons"

const valueIcons = [IconRocket, IconFlag, IconHeartPulse, IconGraduation] as const

export function ValuesRibbonSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const items = t("home.valuesRibbon.items", { returnObjects: true }) as { title: string; text: string }[]

  return (
    <section
      className="values-ribbon-section section-surface section-surface--amber"
      aria-label={t("home.valuesRibbon.aria")}
    >
      <div className="container">
        <div className="values-ribbon-grid">
          {items.map((item, i) => {
            const Ic = valueIcons[i] ?? valueIcons[0]
            return (
              <motion.div
                key={item.title}
                className="values-ribbon-card"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.4 }}
              >
                <IconBadge variant="sky">
                  <Ic className="icon-badge__svg" size={22} />
                </IconBadge>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
