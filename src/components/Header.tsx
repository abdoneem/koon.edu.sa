import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { NavLink, useLocation } from "react-router-dom"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { Logo } from "./Logo"
import { PortalStrip } from "./PortalStrip"

/** 5 essentials — الصفحة الرئيسية من الشعار؛ بقية الأقسام كمراسي. */
const NAV = [
  { to: "/about", i18n: "nav.about" as const },
  { to: "/academics", i18n: "nav.academics" as const },
  { to: "/student-life", i18n: "nav.studentLife" as const },
  { to: "/admissions", i18n: "nav.admissions" as const },
  { to: "/contact", i18n: "nav.contact" as const },
] as const

export function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const reduce = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isHome = location.pathname === "/"
  const transparentHero = isHome && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle("nav-open", menuOpen)
    return () => document.body.classList.remove("nav-open")
  }, [menuOpen])

  const navLinkClassName = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : undefined)

  const headerMods = ["site-header", transparentHero ? "site-header--transparent-hero" : "", scrolled ? "site-header--scrolled" : ""]
    .filter(Boolean)
    .join(" ")

  return (
    <>
      <PortalStrip />
      <header className={headerMods}>
        <div className="container header-content">
          <NavLink to="/" className="brand-logo-link" aria-label={t("brand")} end>
            <Logo />
          </NavLink>

          <nav className="main-nav main-nav--compact desktop-only" aria-label={t("nav.ariaMain")}>
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                {t(item.i18n)}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <a href="/#book-tour" className="btn-header btn-header--book desktop-only-inline">
              {t("nav.bookVisit")}
            </a>
            <NavLink
              to="/registration"
              className={({ isActive }) =>
                ["header-register-link", "desktop-only-inline", isActive ? "active" : ""].filter(Boolean).join(" ")
              }
            >
              {t("nav.registration")}
            </NavLink>
            <LanguageSwitcher />
            <button
              type="button"
              className={`menu-toggle mobile-only ${menuOpen ? "is-open" : ""}`}
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="menu-toggle__bar" />
              <span className="menu-toggle__bar" />
              <span className="menu-toggle__bar" />
              <span className="visually-hidden">{t("nav.menu")}</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              id="mobile-drawer"
              className="mobile-drawer"
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={reduce ? undefined : { opacity: 1, height: "auto" }}
              exit={reduce ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <nav className="mobile-drawer__nav" aria-label={t("nav.ariaMobile")}>
                {NAV.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navLinkClassName} onClick={() => setMenuOpen(false)}>
                    {t(item.i18n)}
                  </NavLink>
                ))}
                <a href="/#book-tour" className="btn mobile-cta mobile-cta--book" onClick={() => setMenuOpen(false)}>
                  {t("nav.bookVisit")}
                </a>
                <NavLink to="/registration" className="btn btn-primary mobile-cta" onClick={() => setMenuOpen(false)}>
                  {t("nav.registration")}
                </NavLink>
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </>
  )
}
