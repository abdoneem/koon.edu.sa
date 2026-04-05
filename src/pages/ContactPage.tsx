import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { CmsStructuredBlocks } from "../components/cms/CmsStructuredBlocks"
import { PageLayout } from "../components/PageLayout"
import { SitePageHero } from "../components/site/SitePageHero"
import { siteImagery } from "../content/siteImagery"
import { useCmsSite } from "../context/CmsSiteContext"

const MADINAH_MAP_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=39.548%2C24.498%2C39.598%2C24.538&layer=mapnik"

const RIYADH_MAP_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=46.62%2C24.62%2C46.78%2C24.78&layer=mapnik"

export function ContactPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const pathKey = pathname.replace(/\/$/, "") || "/"
  const { phoneDisplay, phoneHref, emailDisplay, emailHref, whatsappHref } = useCmsSite()

  return (
    <PageLayout>
      <div className="site-page-premium">
        <SitePageHero
          eyebrow={t("nav.contact")}
          title={t("contactPage.title")}
          lead={t("contactPage.description")}
          imageSrc={siteImagery.pageHero.contact}
          imageAlt={t("contactPage.heroImageAlt")}
        />

        <CmsStructuredBlocks pathKey={pathKey} />

        <section className="home-section home-section--surface site-page-premium__band-first">
          <div className="container home-section__inner">
            <article className="card-elevated site-contact-card">
              <p className="site-contact-card__line">{t("contactPage.address")}</p>
              <p className="site-contact-card__line">{t("contactPage.addressRiyadh")}</p>
              <p className="site-contact-card__line">
                <a href={phoneHref}>{phoneDisplay}</a>
              </p>
              <p className="site-contact-card__line">
                <a href={emailHref}>{emailDisplay}</a>
              </p>
              <p className="site-contact-card__line">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  {t("chatbot.whatsapp")}
                </a>
              </p>
            </article>

            <div className="card-elevated site-contact-map">
              <h2 className="home-display home-display--sm">{t("contactPage.mapTitle")}</h2>
              <iframe
                title={t("contactPage.mapTitle")}
                className="site-contact-map__frame"
                src={MADINAH_MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <p className="site-contact-map__note">
                <a
                  href="https://www.openstreetmap.org/search?query=%D8%AD%D9%8A%20%D8%A7%D9%84%D8%B1%D9%88%D8%A7%D8%A8%D9%8A%20%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9%20%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-text-link"
                >
                  {t("contactPage.openMapLabel")}
                </a>
              </p>
            </div>

            <div className="card-elevated site-contact-map">
              <h2 className="home-display home-display--sm">{t("contactPage.mapTitleRiyadh")}</h2>
              <iframe
                title={t("contactPage.mapTitleRiyadh")}
                className="site-contact-map__frame"
                src={RIYADH_MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <p className="site-contact-map__note">
                <a
                  href="https://www.openstreetmap.org/search?query=Riyadh%20Saudi%20Arabia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-text-link"
                >
                  {t("contactPage.openMapLabelRiyadh")}
                </a>
              </p>
            </div>

            <div className="site-page-cta-row site-page-cta-row--surface">
              <Link to="/registration" className="home-btn home-btn--primary home-btn--lg">
                {t("nav.registration")}
              </Link>
              <a href={whatsappHref} className="home-btn home-btn--hero-book home-btn--lg" target="_blank" rel="noreferrer">
                {t("chatbot.whatsapp")}
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
