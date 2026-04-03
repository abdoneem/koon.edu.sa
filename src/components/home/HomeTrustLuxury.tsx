import { useTranslation } from "react-i18next"

export function HomeTrustLuxury() {
  const { t } = useTranslation()
  const metrics = t("homeLuxury.trust.metrics", { returnObjects: true }) as { value: string; label: string }[]
  const proof = t("homeLuxury.trust.proofChips", { returnObjects: true }) as string[]

  return (
    <section className="hl-section hl-trust" aria-labelledby="hl-trust-heading">
      <div className="hl-wrap">
        <p className="hl-kicker">{t("homeLuxury.trust.kicker")}</p>
        <h2 id="hl-trust-heading">{t("homeLuxury.trust.title")}</h2>
        <p className="hl-lead">{t("homeLuxury.trust.lead")}</p>
        <div className="hl-trust__grid">
          {metrics.map((m) => (
            <div key={m.label} className="hl-trust__metric">
              <div className="hl-trust__value">{m.value}</div>
              <p className="hl-trust__label">{m.label}</p>
            </div>
          ))}
        </div>
        <div className="hl-trust__divider">
          <ul className="hl-trust__proof">
            {proof.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
