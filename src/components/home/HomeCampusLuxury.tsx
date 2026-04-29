import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { usePublicLocale } from "../../hooks/usePublicLocale"
import { facilitiesTeaserImageForIndex } from "../../content/siteImagery"

export function HomeCampusLuxury() {
  const { t } = useTranslation()
  const { href } = usePublicLocale()

  return (
    <section className="hl-section hl-campus" aria-labelledby="hl-campus-heading">
      <div className="hl-wrap">
        <p className="hl-kicker">{t("homeLuxury.campus.kicker")}</p>
        <h2 id="hl-campus-heading">{t("homeLuxury.campus.title")}</h2>
        <p className="hl-lead">{t("homeLuxury.campus.lead")}</p>
        <div className="hl-campus__layout">
          <div className="hl-campus__mosaic" aria-hidden>
            <figure>
              <img
                src={facilitiesTeaserImageForIndex(0)}
                alt=""
                width={800}
                height={1000}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <figure>
              <img
                src={facilitiesTeaserImageForIndex(1)}
                alt=""
                width={560}
                height={360}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <figure>
              <img
                src={facilitiesTeaserImageForIndex(2)}
                alt=""
                width={560}
                height={360}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
          <div>
            <p className="hl-lead" style={{ maxWidth: "42ch" }}>
              {t("homeLuxury.campus.body")}
            </p>
            <div className="hl-campus__actions">
              <Link to={href("/facilities")} className="hl-btn hl-btn--solid-dark">
                {t("homeLuxury.campus.ctaFacilities")}
              </Link>
              <Link to={href("/contact")} className="hl-btn hl-btn--outline-dark">
                {t("homeLuxury.campus.ctaVisit")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
