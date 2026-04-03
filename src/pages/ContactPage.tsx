import { useTranslation } from "react-i18next"
import { FigureImage } from "../components/FigureImage"
import { PageLayout } from "../components/PageLayout"
import { siteImagery } from "../content/siteImagery"
import { brand } from "../config/brand"

const MADINAH_MAP_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=39.548%2C24.498%2C39.598%2C24.538&layer=mapnik"

const RIYADH_MAP_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=46.62%2C24.62%2C46.78%2C24.78&layer=mapnik"

export function ContactPage() {
  const { t } = useTranslation()

  return (
    <PageLayout>
      <section className="section container contact-page-section">
        <h1 className="page-title">{t("contactPage.title")}</h1>
        <p className="page-subtitle">{t("contactPage.description")}</p>
        <FigureImage
          src={siteImagery.pageHero.contact}
          alt={t("contactPage.heroImageAlt")}
          className="page-inline-hero-media page-inline-hero-media--tight"
          width={1200}
          height={420}
        />
        <article className="card contact-card">
          <p>{t("contactPage.address")}</p>
          <p>{t("contactPage.addressRiyadh")}</p>
          <p>
            <a href={`tel:${brand.phoneTel}`}>{t("footer.phone")}</a>
          </p>
          <p>
            <a href={`mailto:${t("footer.email")}`}>{t("footer.email")}</a>
          </p>
          <p>
            <a href={brand.whatsappHref} target="_blank" rel="noreferrer">
              {t("chatbot.whatsapp")}
            </a>
          </p>
        </article>

        <div className="contact-map-wrap">
          <h2 className="about-extended__h2">{t("contactPage.mapTitle")}</h2>
          <iframe
            title={t("contactPage.mapTitle")}
            className="contact-map-frame"
            src={MADINAH_MAP_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className="contact-map-note">
            <a
              href="https://www.openstreetmap.org/search?query=%D8%AD%D9%8A%20%D8%A7%D9%84%D8%B1%D9%88%D8%A7%D8%A8%D9%8A%20%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9%20%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("contactPage.openMapLabel")}
            </a>
          </p>
        </div>

        <div className="contact-map-wrap">
          <h2 className="about-extended__h2">{t("contactPage.mapTitleRiyadh")}</h2>
          <iframe
            title={t("contactPage.mapTitleRiyadh")}
            className="contact-map-frame"
            src={RIYADH_MAP_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className="contact-map-note">
            <a
              href="https://www.openstreetmap.org/search?query=Riyadh%20Saudi%20Arabia"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("contactPage.openMapLabelRiyadh")}
            </a>
          </p>
        </div>
      </section>
    </PageLayout>
  )
}
