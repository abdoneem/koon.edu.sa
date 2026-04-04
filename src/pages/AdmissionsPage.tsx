import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { PageLayout } from "../components/PageLayout"
import { SitePageHero } from "../components/site/SitePageHero"
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
  const { content, error, isLoading } = useCmsContent(fetchAdmissionsPageContent, fallback)

  const stepItems = Array.isArray(content.steps) && content.steps.length > 0 ? content.steps : fallback.steps

  const policyBulletsRaw = t("admissionsPage.policiesBullets", { returnObjects: true }) as string[] | undefined
  const policyBullets = Array.isArray(policyBulletsRaw) ? policyBulletsRaw : []

  return (
    <PageLayout>
      <div className="site-page-premium">
        <SitePageHero
          eyebrow={t("nav.admissions")}
          title={content.title}
          lead={content.description}
          imageSrc={siteImagery.pageHero.admissions}
          imageAlt={t("admissionsPage.heroImageAlt")}
        />

        <section className="home-section home-section--surface site-page-premium__band-first">
          <div className="container home-section__inner">
            <div className="site-page-hotline card-elevated">
              <a className="site-page-hotline__link" href={`tel:${brand.phoneTel}`}>
                {brand.phoneDisplay}
              </a>
              <span className="site-page-hotline__sep" aria-hidden>
                ·
              </span>
              <a className="site-page-hotline__link" href={brand.whatsappHref} target="_blank" rel="noreferrer">
                {t("chatbot.whatsapp")}
              </a>
              <span className="site-page-hotline__sep" aria-hidden>
                ·
              </span>
              <Link className="site-page-hotline__link site-page-hotline__link--cta" to="/registration">
                {t("nav.registration")}
              </Link>
            </div>

            {isLoading ? (
              <p className="card-elevated site-page-status" role="status">
                {t("common.loading")}
              </p>
            ) : null}
            {error ? (
              <p className="card-elevated site-page-status site-page-status--warn" role="alert">
                {error}
              </p>
            ) : null}

            {stepItems.length > 0 ? (
              <ul className="site-admissions-steps" role="list">
                {stepItems.map((step) => (
                  <li key={step.id}>
                    <article className="card-elevated site-admissions-step-card">
                      <h2 className="home-display home-display--sm">{step.title}</h2>
                      <p className="site-pillar-card__desc">{step.description}</p>
                    </article>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="card-elevated site-page-status">{t("common.contentLoadError")}</p>
            )}

            <article className="card-elevated site-content-card site-content-card--full">
              <h2 className="home-display home-display--sm">{t("admissionsPage.campusTitle")}</h2>
              <p className="site-pillar-card__desc">{t("admissionsPage.campusLead")}</p>
            </article>

            <article className="card-elevated site-content-card site-content-card--full">
              <h2 className="home-display home-display--sm">{t("admissionsPage.policiesTitle")}</h2>
              <p className="home-lead home-lead--tight">{t("admissionsPage.policiesLead")}</p>
              {policyBullets.length > 0 ? (
                <ul className="site-bullet-list">
                  {policyBullets.map((b) => (
                    <li key={b.slice(0, 40)}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </article>

            <div className="site-page-cta-row site-page-cta-row--surface">
              <Link to="/registration" className="home-btn home-btn--primary home-btn--lg">
                {t("nav.registration")}
              </Link>
              <Link to="/contact" className="home-btn home-btn--secondary home-btn--lg">
                {t("nav.contact")}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <FaqSection
        titleKey="admissionsPage.faqTitle"
        leadKey="admissionsPage.faqLead"
        itemsKey="admissionsPage.faqItems"
        headingId="admissions-faq-heading"
      />
    </PageLayout>
  )
}
