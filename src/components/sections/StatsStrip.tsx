import { useTranslation } from "react-i18next"
import { IconBadge } from "../IconBadge"
import {
  IconLanguages,
  IconLayers,
  IconMapPin,
  IconShieldCheck,
} from "../icons/schoolIcons"

const statIcons = [IconLayers, IconMapPin, IconLanguages, IconShieldCheck] as const

type StatItem = { value: string; label: string }

export function StatsStrip() {
  const { t } = useTranslation()
  const items = t("stats.items", { returnObjects: true }) as StatItem[]

  return (
    <section className="stats-strip section-surface section-surface--mist" aria-label={t("stats.aria")}>
      <div className="container stats-grid">
        {items.map((item, i) => {
          const Ic = statIcons[i] ?? statIcons[0]
          return (
            <div key={item.label} className="stat-card">
              <IconBadge variant="default">
                <Ic className="icon-badge__svg" size={22} />
              </IconBadge>
              <div className="stat-card__text">
                <span className="stat-value">{item.value}</span>
                <span className="stat-label">{item.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
