import { Helmet } from "react-helmet-async"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { usePathCmsSeo } from "../hooks/usePathCmsSeo"

const PUBLIC_SEO_PATHS: Record<string, { title: string; desc: string }> = {
  "/": { title: "seo.paths.home.title", desc: "seo.paths.home.description" },
  "/about": { title: "seo.paths.about.title", desc: "seo.paths.about.description" },
  "/why-koon": { title: "seo.paths.whyKoon.title", desc: "seo.paths.whyKoon.description" },
  "/academics": { title: "seo.paths.academics.title", desc: "seo.paths.academics.description" },
  "/student-life": { title: "seo.paths.studentLife.title", desc: "seo.paths.studentLife.description" },
  "/facilities": { title: "seo.paths.facilities.title", desc: "seo.paths.facilities.description" },
  "/admissions": { title: "seo.paths.admissions.title", desc: "seo.paths.admissions.description" },
  "/registration": { title: "seo.paths.registration.title", desc: "seo.paths.registration.description" },
  "/media": { title: "seo.paths.media.title", desc: "seo.paths.media.description" },
  "/news": { title: "seo.paths.media.title", desc: "seo.paths.media.description" },
  "/book-tour": { title: "seo.paths.bookTour.title", desc: "seo.paths.bookTour.description" },
  "/virtual-tour": { title: "seo.paths.virtualTour.title", desc: "seo.paths.virtualTour.description" },
  "/portals": { title: "seo.paths.portals.title", desc: "seo.paths.portals.description" },
  "/accreditations": { title: "seo.paths.accreditations.title", desc: "seo.paths.accreditations.description" },
  "/excellence": { title: "seo.paths.excellence.title", desc: "seo.paths.excellence.description" },
  "/articles": { title: "seo.paths.articles.title", desc: "seo.paths.articles.description" },
  "/contact": { title: "seo.paths.contact.title", desc: "seo.paths.contact.description" },
}

export function DocumentHead() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const pathKey = pathname.replace(/\/$/, "") || "/"
  const cmsSeo = usePathCmsSeo(pathKey)

  if (pathname.startsWith("/admin/login")) {
    return (
      <Helmet>
        <title>{t("seo.paths.adminLogin.title")}</title>
        <meta name="description" content={t("seo.paths.adminLogin.description")} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    )
  }

  if (pathname.startsWith("/admin")) {
    return (
      <Helmet>
        <title>{t("seo.paths.admin.title")}</title>
        <meta name="description" content={t("seo.paths.admin.description")} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    )
  }

  const keys = PUBLIC_SEO_PATHS[pathKey] ?? PUBLIC_SEO_PATHS["/"]
  const title = cmsSeo?.title ?? t(keys.title)
  const description = cmsSeo?.description ?? t(keys.desc)

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <meta property="og:site_name" content={t("seo.siteName")} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </Helmet>
  )
}
