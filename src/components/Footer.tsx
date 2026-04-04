import { IconBrandSnapchat, IconBrandX, IconBrandYoutube } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"
import { brand } from "../config/brand"
import { Logo } from "./Logo"

const HOME_ANCHORS: { hash: string; i18n: "nav.whyKoon" | "nav.media" | "nav.facilities" | "nav.accreditationsNav" | "nav.excellenceNav" | "nav.articlesNav" | "nav.bookTour" | "nav.virtualTour" | "nav.portalsNav" }[] = [
  { hash: "why-koon", i18n: "nav.whyKoon" },
  { hash: "media", i18n: "nav.media" },
  { hash: "facilities", i18n: "nav.facilities" },
  { hash: "accreditations", i18n: "nav.accreditationsNav" },
  { hash: "excellence", i18n: "nav.excellenceNav" },
  { hash: "articles", i18n: "nav.articlesNav" },
  { hash: "book-tour", i18n: "nav.bookTour" },
  { hash: "virtual-tour", i18n: "nav.virtualTour" },
  { hash: "portals", i18n: "nav.portalsNav" },
]

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo-mark">
            <Logo className="footer-logo-img" />
          </div>
          <p className="footer-tagline">{t("footer.tagline")}</p>
        </div>
        <div className="footer-col">
          <span className="footer-heading">{t("footer.visit")}</span>
          <p>{t("footer.address")}</p>
        </div>
        <div className="footer-col">
          <span className="footer-heading">{t("footer.contact")}</span>
          <p>
            <a href={`tel:${t("footer.phone")}`}>{t("footer.phone")}</a>
          </p>
          <p>
            <a href={`mailto:${t("footer.email")}`}>{t("footer.email")}</a>
          </p>
        </div>
        <div className="footer-col footer-col--social">
          <span className="footer-heading">{t("footer.follow")}</span>
          <div className="footer-social">
            <a
              className="footer-social__btn"
              href={brand.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("mediaCenterPage.socialYoutubeAria")}
            >
              <IconBrandYoutube size={22} stroke={1.5} aria-hidden />
            </a>
            <a
              className="footer-social__btn"
              href={brand.social.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("mediaCenterPage.socialXAria")}
            >
              <IconBrandX size={22} stroke={1.5} aria-hidden />
            </a>
            <a
              className="footer-social__btn"
              href={brand.social.snapchat}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("mediaCenterPage.socialSnapchatAria")}
            >
              <IconBrandSnapchat size={22} stroke={1.5} aria-hidden />
            </a>
          </div>
        </div>
        <div className="footer-col">
          <span className="footer-heading">{t("footer.links")}</span>
          <ul className="footer-links">
            <li>
              <NavLink to="/academics">{t("nav.academics")}</NavLink>
            </li>
            <li>
              <NavLink to="/student-life">{t("nav.studentLife")}</NavLink>
            </li>
            <li>
              <NavLink to="/admissions">{t("nav.admissions")}</NavLink>
            </li>
            <li>
              <NavLink to="/registration">{t("nav.registration")}</NavLink>
            </li>
            <li>
              <NavLink to="/about">{t("nav.about")}</NavLink>
            </li>
            <li>
              <NavLink to="/contact">{t("nav.contact")}</NavLink>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <span className="footer-heading">{t("footer.onHome")}</span>
          <ul className="footer-links">
            {HOME_ANCHORS.map((a) => (
              <li key={a.hash}>
                <a href={`/#${a.hash}`}>{t(a.i18n)}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>{t("footer.rights")}</p>
      </div>
    </footer>
  )
}

export default Footer
