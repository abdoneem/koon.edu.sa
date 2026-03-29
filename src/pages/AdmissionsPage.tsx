import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { FigureImage } from "../components/FigureImage"
import { PageLayout } from "../components/PageLayout"
import { siteImagery } from "../content/siteImagery"
import { useCmsContent } from "../hooks/useCmsContent"
import { fetchAdmissionsPageContent } from "../services/cmsClient"
import type { AdmissionsPageContent } from "../types/cms"

export function AdmissionsPage() {
  const { t } = useTranslation()
  const fallback = useMemo(
    () =>
      ({
        title: t("admissionsPage.title"),
        description: t("admissionsPage.description"),
        steps: t("admissionsPage.steps", { returnObjects: true }),
      }) as AdmissionsPageContent,
    [t],
  )
  const { content, error, isLoading } = useCmsContent(
    fetchAdmissionsPageContent,
    fallback,
  )

  return (
    <PageLayout>
      <section className="section container admissions-page-section">
        <h1 className="page-title">{content.title}</h1>
        <p className="page-subtitle">{content.description}</p>
        <FigureImage
          src={siteImagery.pageHero.admissions}
          alt={t("admissionsPage.heroImageAlt")}
          className="page-inline-hero-media page-inline-hero-media--tight"
          width={1200}
          height={460}
        />
        {isLoading ? <p className="notice">{t("common.loading")}</p> : null}
        {error ? <p className="notice">{error}</p> : null}
        <div className="cards-grid">
          {content.steps.map((step) => (
            <article key={step.id} className="card">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}
