import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { FigureImage } from "../components/FigureImage"
import { PageLayout } from "../components/PageLayout"
import { siteImagery } from "../content/siteImagery"
import { useCmsContent } from "../hooks/useCmsContent"
import { fetchContactPageContent } from "../services/cmsClient"
import type { ContactPageContent } from "../types/cms"

export function ContactPage() {
  const { t } = useTranslation()
  const fallback = useMemo(
    () =>
      ({
        title: t("contactPage.title"),
        description: t("contactPage.description"),
        phone: t("footer.phone"),
        email: t("footer.email"),
        address: t("contactPage.address"),
      }) as ContactPageContent,
    [t],
  )
  const { content, error, isLoading } = useCmsContent(fetchContactPageContent, fallback)

  return (
    <PageLayout>
      <section className="section container contact-page-section">
        <h1 className="page-title">{content.title}</h1>
        <p className="page-subtitle">{content.description}</p>
        <FigureImage
          src={siteImagery.pageHero.contact}
          alt={t("contactPage.heroImageAlt")}
          className="page-inline-hero-media page-inline-hero-media--tight"
          width={1200}
          height={420}
        />
        {isLoading ? <p className="notice">{t("common.loading")}</p> : null}
        {error ? <p className="notice">{error}</p> : null}
        <article className="card contact-card">
          <p>{content.address}</p>
          <p>
            <a href={`tel:${content.phone}`}>{content.phone}</a>
          </p>
          <p>
            <a href={`mailto:${content.email}`}>{content.email}</a>
          </p>
        </article>
      </section>
    </PageLayout>
  )
}
