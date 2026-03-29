import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { Logo } from "./Logo"

const NAV = [
  { to: "/", end: true, i18n: "nav.home" as const },
  { to: "/about", i18n: "nav.about" as const },
  { to: "/academics", i18n: "nav.academics" as const },
  { to: "/student-life", i18n: "nav.studentLife" as const },
  { to: "/facilities", i18n: "nav.facilities" as const },
  { to: "/admissions", i18n: "nav.admissions" as const },
  { to: "/registration", i18n: "nav.registration" as const },
  { to: "/news", i18n: "nav.news" as const },
  { to: "/contact", i18n: "nav.contact" as const },
] as const

export function Header() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle("nav-open", menuOpen)
    return () => document.body.classList.remove("nav-open")
  }, [menuOpen])

  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active" : undefined

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <div className="container header-content">
        <NavLink to="/" className="brand-logo-link" aria-label={t("brand")} end>
          <Logo />
        </NavLink>

        <nav className="main-nav desktop-only" aria-label={t("nav.ariaMain")}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item ? item.end : false}
              className={navLinkClassName}
            >
              {t(item.i18n)}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <NavLink to="/registration" className="btn-header desktop-only-inline">
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
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={"end" in item ? item.end : false}
                  className={navLinkClassName}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(item.i18n)}
                </NavLink>
              ))}
              <NavLink to="/registration" className="btn btn-primary mobile-cta" onClick={() => setMenuOpen(false)}>
                {t("nav.registration")}
              </NavLink>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
