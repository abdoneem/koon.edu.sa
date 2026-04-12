import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { PageLayout } from "../components/PageLayout"
import { SitePageHero } from "../components/site/SitePageHero"
import { siteImagery } from "../content/siteImagery"
import { useHomePageBundle } from "../hooks/useHomePageBundle"

export function ArticlesListPage() {
  const { t } = useTranslation()
  const { bundle } = useHomePageBundle()

  return (
    <PageLayout>
      <div className="site-page-premium">
        <SitePageHero
          eyebrow={t("nav.home")}
          title={t("articlesPage.title")}
          lead={t("articlesPage.emptyNote")}
          imageSrc={siteImagery.about}
          imageAlt={t("imagery.aboutHeroAlt")}
        />

        <section className="home-section home-section--surface site-page-premium__band-first">
          <div className="container home-section__inner">
            {bundle.articleCards.length === 0 ? <p className="card-elevated site-page-status">{t("common.contentLoadError")}</p> : null}

            <ul className="home-editorial-grid" role="list">
              {bundle.articleCards.map((a) => (
                <li key={a.id} className="home-editorial-card">
                  <span className="home-editorial-card__meta">{a.meta}</span>
                  <h3>{a.title}</h3>
                  <p>{a.excerpt}</p>
                  <Link to={`/articles/${encodeURIComponent(a.slug?.trim() || a.id)}`} className="home-editorial-card__faux-link">
                    {t("homePage.ctaFullPage")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}

