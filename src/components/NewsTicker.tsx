import { useTranslation } from "react-i18next"

interface NewsTickerProps {
  /** Used when `mediaTicker.items` is empty (e.g. before CMS). */
  fallbackItems?: string[]
}

export function NewsTicker({ fallbackItems = [] }: NewsTickerProps) {
  const { t } = useTranslation()
  const fromI18n = t("mediaTicker.items", { returnObjects: true }) as string[]
  const items = Array.isArray(fromI18n) && fromI18n.length > 0 ? fromI18n : fallbackItems
  if (!items.length) {
    return null
  }
  const doubled = [...items, ...items]

  return (
    <div className="news-ticker" role="region" aria-label={t("mediaTicker.aria")}>
      <div className="news-ticker__track">
        {doubled.map((text, i) => (
          <span key={`${i}-${text.slice(0, 12)}`} className="news-ticker__item">
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}
