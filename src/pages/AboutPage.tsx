import { useTranslation } from "react-i18next"
import { FigureImage } from "../components/FigureImage"
import { PageLayout } from "../components/PageLayout"
import { siteImagery } from "../content/siteImagery"

export function AboutPage() {
  const { t } = useTranslation()

  const pillars = t("aboutPage.pillars", { returnObjects: true }) as {
    id: string
    title: string
    description: string
  }[]
  const introParagraphs = t("aboutExtended.introParagraphs", { returnObjects: true }) as string[]
  const chairmanBody = t("aboutExtended.chairmanBody", { returnObjects: true }) as string[]
  const values = t("aboutExtended.values", { returnObjects: true }) as { title: string; body: string }[]
  const bilingualPoints = t("bilingualPhilosophy.points", { returnObjects: true }) as string[]

  return (
    <PageLayout>
      <section className="section container about-page-section">
        <h1 className="page-title">{t("aboutPage.title")}</h1>
        <p className="page-subtitle">{t("aboutPage.description")}</p>
        <FigureImage
          src={siteImagery.about}
          alt={t("imagery.aboutHeroAlt")}
          className="about-page-hero-media"
          width={800}
          height={360}
        />
        <div className="highlight-grid">
          {pillars.map((pillar) => (
            <article key={pillar.id} className="highlight-card">
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>

        <div className="about-extended">
          {introParagraphs.map((para) => (
            <p key={para.slice(0, 48)} className="about-extended__para">
              {para}
            </p>
          ))}
          <p className="about-extended__emphasis">{t("aboutExtended.strategicGoalsLead")}</p>

          <article className="card about-extended__block">
            <h2 className="about-extended__h2">{t("bilingualPhilosophy.title")}</h2>
            <p>{t("bilingualPhilosophy.lead")}</p>
            <ul className="about-extended__list">
              {bilingualPoints.map((pt) => (
                <li key={pt.slice(0, 40)}>{pt}</li>
              ))}
            </ul>
          </article>

          <article className="card about-extended__block">
            <h2 className="about-extended__h2">{t("aboutExtended.visionBlockTitle")}</h2>
            <p>{t("aboutExtended.visionBlockBody")}</p>
            <h2 className="about-extended__h2 about-extended__h2--spaced">{t("aboutExtended.missionBlockTitle")}</h2>
            <p>{t("aboutExtended.missionBlockBody")}</p>
          </article>

          <article className="card about-extended__block">
            <h2 className="about-extended__h2">{t("aboutExtended.valuesTitle")}</h2>
            <ul className="about-extended__values">
              {values.map((v) => (
                <li key={v.title}>
                  <strong>{v.title}</strong>
                  <span> — {v.body}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="card about-extended__block about-extended__block--chairman">
            <h2 className="about-extended__h2">{t("aboutExtended.chairmanTitle")}</h2>
            <p className="about-extended__chairman-intro">{t("aboutExtended.chairmanIntro")}</p>
            {chairmanBody.map((para) => (
              <p key={para.slice(0, 48)} className="about-extended__para">
                {para}
              </p>
            ))}
            <p className="about-extended__closing">{t("aboutExtended.chairmanClosing")}</p>
          </article>
        </div>
      </section>
    </PageLayout>
  )
}
