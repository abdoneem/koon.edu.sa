import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useCmsSite } from "../../context/CmsSiteContext"
import { usePublicLocale } from "../../hooks/usePublicLocale"

export function HomeAdmissionsLuxury() {
  const { t } = useTranslation()
  const { whatsappHref } = useCmsSite()
  const { href } = usePublicLocale()

  return (
    <section className="hl-admissions" aria-labelledby="hl-adm-heading">
      <div className="hl-admissions__inner">
        <p className="hl-kicker">{t("homeLuxury.admissions.kicker")}</p>
        <h2 id="hl-adm-heading">{t("homeLuxury.admissions.title")}</h2>
        <p className="hl-admissions__lead">{t("homeLuxury.admissions.lead")}</p>
        <div className="hl-admissions__row">
          <Link to={href("/contact")} className="hl-btn hl-btn--primary">
            {t("homeLuxury.admissions.ctaVisit")}
          </Link>
          <a href={whatsappHref} className="hl-btn hl-btn--ghost" target="_blank" rel="noreferrer">
            {t("homeLuxury.admissions.ctaWhatsapp")}
          </a>
          <Link to={href("/registration")} className="hl-btn hl-btn--ghost">
            {t("homeLuxury.admissions.ctaApply")}
          </Link>
        </div>
        <p className="hl-admissions__note">{t("homeLuxury.admissions.note")}</p>
      </div>
    </section>
  )
}
