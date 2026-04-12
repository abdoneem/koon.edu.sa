import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { CmsStructuredBlocks } from "../components/cms/CmsStructuredBlocks"
import { PageLayout } from "../components/PageLayout"
import { SitePageHero } from "../components/site/SitePageHero"
import { useCmsPageForPath } from "../hooks/useCmsPageForPath"
import { sanitizeCmsBodyHtml } from "../utils/sanitizeCmsHtml"

/**
 * Published structured CMS page at `/{slug}` (slug must not collide with static routes).
 */
export function PublicCmsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const pathKey = slug ? `/${slug}` : "/"
  const { active, loading, page } = useCmsPageForPath(pathKey)

  useEffect(() => {
    if (!loading && !active) {
      navigate("/", { replace: true })
    }
  }, [loading, active, navigate])

  if (!slug) {
    return <Navigate to="/" replace />
  }

  if (loading || !active || !page) {
    return (
      <PageLayout>
        <div className="container site-page-premium" style={{ paddingBlock: "3rem" }}>
          <p className="home-lead" role="status">
            {t("common.loading")}
          </p>
        </div>
      </PageLayout>
    )
  }

  const bg = page.header_background?.trim()
  const subtitle = page.page_subtitle?.trim()
  const rawBody = page.body_html?.trim() ?? ""
  const safeBody = rawBody ? sanitizeCmsBodyHtml(rawBody) : ""

  return (
    <PageLayout>
      <div className="site-page-premium">
        <SitePageHero
          title={page.title}
          lead={subtitle || undefined}
          imageSrc={bg || undefined}
          imageAlt=""
        />

        {safeBody ? (
          <section className="home-section home-section--surface">
            <div className="container home-section__inner">
              <div className="cms-page-body" dangerouslySetInnerHTML={{ __html: safeBody }} />
            </div>
          </section>
        ) : null}

        <CmsStructuredBlocks pathKey={pathKey} />
      </div>
    </PageLayout>
  )
}
