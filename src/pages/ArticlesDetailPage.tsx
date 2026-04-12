import { Helmet } from "react-helmet-async"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"
import { MarkdownBody } from "../components/MarkdownBody"
import { PageLayout } from "../components/PageLayout"
import { SitePageHero } from "../components/site/SitePageHero"
import { siteImagery } from "../content/siteImagery"
import { useHomePageBundle } from "../hooks/useHomePageBundle"

export function ArticlesDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { bundle } = useHomePageBundle()

  const slugOrId = id ?? ""
  const item = bundle.articleCards.find((x) => x.slug === slugOrId) ?? bundle.articleCards.find((x) => x.id === slugOrId)
  const seoTitle = item ? `${item.title} | ${t("seo.siteName")}` : t("seo.paths.articles.title")
  const seoDesc = item?.excerpt ?? t("seo.paths.articles.description")

  return (
    <PageLayout>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
      </Helmet>
      <div className="site-page-premium">
        <SitePageHero
          eyebrow={t("articlesPage.title")}
          title={item?.title ?? t("articlesPage.title")}
          lead={item?.excerpt ?? t("articlesPage.emptyNote")}
          imageSrc={siteImagery.about}
          imageAlt={t("imagery.aboutHeroAlt")}
        />

        <section className="home-section home-section--surface site-page-premium__band-first site-page-article-band">
          <div className="container home-section__inner site-page-prose">
            <p className="site-page-article-back">
              <Link className="home-text-link" to="/articles">
                {t("articlesPage.title")}
              </Link>
            </p>

            {!item ? (
              <p className="card-elevated site-page-status">{t("common.contentLoadError")}</p>
            ) : (
              <article className="site-page-article">
                {item.meta?.trim() ? (
                  <div className="site-page-article-meta">
                    <span className="site-page-article-meta__date">{item.meta}</span>
                  </div>
                ) : null}
                <p className="site-page-article-lead">{item.excerpt}</p>
                <MarkdownBody markdown={item.body ?? ""} className="site-markdown--article" />
              </article>
            )}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}

