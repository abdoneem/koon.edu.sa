import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { FigureImage } from "../components/FigureImage"
import { PageLayout } from "../components/PageLayout"
import { FaqSection } from "../components/sections/FaqSection"
import { siteImagery } from "../content/siteImagery"
import { brand } from "../config/brand"
import { useCmsContent } from "../hooks/useCmsContent"
import { fetchAdmissionsPageContent } from "../services/cmsClient"
import type { AdmissionsPageContent } from "../types/cms"

export function AdmissionsPage() {
  const { t } = useTranslation()
  const fallback = useMemo((): AdmissionsPageContent => {
    const rawSteps = t("admissionsPage.steps", { returnObjects: true })
    const steps = Array.isArray(rawSteps) ? rawSteps : []
    return {
      title: t("admissionsPage.title"),
      description: t("admissionsPage.description"),
      steps,
    }
  }, [t])
  const { content, error, isLoading } = useCmsContent(
    fetchAdmissionsPageContent,
    fallback,
  )

  const stepItems = Array.isArray(content.steps) ? content.steps : []

  const policyBullets = t("admissionsPage.policiesBullets", { returnObjects: true }) as string[]

  return (
    <PageLayout>
      <section className="section container admissions-page-section">
        <h1 className="page-title">{content.title}</h1>
        <p className="page-subtitle">{content.description}</p>
        <p className="page-subtitle admissions-hotline">
          <a href={`tel:${brand.phoneTel}`}>{brand.phoneDisplay}</a>
          {" · "}
          <a href={brand.whatsappHref} target="_blank" rel="noreferrer">
            {t("chatbot.whatsapp")}
          </a>
          {" · "}
          <Link to="/registration">{t("nav.registration")}</Link>
        </p>
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
          {stepItems.map((step) => (
            <article key={step.id} className="card">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <article className="card admissions-campus-card">
          <h2 className="about-extended__h2">{t("admissionsPage.campusTitle")}</h2>
          <p>{t("admissionsPage.campusLead")}</p>
        </article>

        <article className="card admissions-campus-card">
          <h2 className="about-extended__h2">{t("admissionsPage.policiesTitle")}</h2>
          <p>{t("admissionsPage.policiesLead")}</p>
          <ul className="about-extended__list">
            {policyBullets.map((b) => (
              <li key={b.slice(0, 40)}>{b}</li>
            ))}
          </ul>
        </article>
      </section>
      <FaqSection
        titleKey="admissionsPage.faqTitle"
        leadKey="admissionsPage.faqLead"
        itemsKey="admissionsPage.faqItems"
        headingId="admissions-faq-heading"
      />
    </PageLayout>
  )
}
