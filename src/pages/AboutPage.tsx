import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { FigureImage } from "../components/FigureImage"
import { PageLayout } from "../components/PageLayout"
import { siteImagery } from "../content/siteImagery"
import { useCmsContent } from "../hooks/useCmsContent"
import { fetchAboutPageContent } from "../services/cmsClient"
import type { AboutPageContent } from "../types/cms"

export function AboutPage() {
  const { t } = useTranslation()
  const fallback = useMemo(
    () =>
      ({
        title: t("aboutPage.title"),
        description: t("aboutPage.description"),
        pillars: t("aboutPage.pillars", { returnObjects: true }),
      }) as AboutPageContent,
    [t],
  )
  const { content, error, isLoading } = useCmsContent(fetchAboutPageContent, fallback)

  return (
    <PageLayout>
      <section className="section container about-page-section">
        <h1 className="page-title">{content.title}</h1>
        <p className="page-subtitle">{content.description}</p>
        <FigureImage
          src={siteImagery.about}
          alt={t("imagery.aboutHeroAlt")}
          className="about-page-hero-media"
          width={800}
          height={360}
        />
        {isLoading ? <p className="notice">{t("common.loading")}</p> : null}
        {error ? <p className="notice">{error}</p> : null}
        <div className="highlight-grid">
          {content.pillars.map((pillar) => (
            <article key={pillar.id} className="highlight-card">
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}
