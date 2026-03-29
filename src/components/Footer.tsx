import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"
import { Logo } from "./Logo"

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
              <NavLink to="/facilities">{t("nav.facilities")}</NavLink>
            </li>
            <li>
              <NavLink to="/admissions">{t("nav.admissions")}</NavLink>
            </li>
            <li>
              <NavLink to="/news">{t("nav.news")}</NavLink>
            </li>
            <li>
              <NavLink to="/about">{t("nav.about")}</NavLink>
            </li>
            <li>
              <NavLink to="/contact">{t("nav.contact")}</NavLink>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>{t("footer.rights")}</p>
      </div>
    </footer>
  )
}
