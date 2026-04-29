import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { NavLink, useLocation } from "react-router-dom"
import { useCmsSite } from "../context/CmsSiteContext"
import { usePublicLocale } from "../hooks/usePublicLocale"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { Logo } from "./Logo"
import { MainNavMenuDesktop, MainNavMenuMobile } from "./MainNavMenu"
import { PortalStrip } from "./PortalStrip"

export function Header() {
  const { t } = useTranslation()
  const { navTree } = useCmsSite()
  const { href } = usePublicLocale()
  const location = useLocation()
  const reduce = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isHome = /^\/(en|ar)\/?$/.test(location.pathname.replace(/\/$/, "") || "/")
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
          <NavLink to={href("/")} className="brand-logo-link" aria-label={t("brand")} end>
            <Logo />
          </NavLink>

          <nav className="main-nav main-nav--compact desktop-only" aria-label={t("nav.ariaMain")}>
            <MainNavMenuDesktop items={navTree} navLinkClassName={navLinkClassName} localizeHref={href} />
          </nav>

          <div className="header-actions">
            <a href={`${href("/")}#book-tour`} className="btn-header btn-header--book desktop-only-inline">
              {t("nav.bookVisit")}
            </a>
            <NavLink
              to={href("/registration")}
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
              <div className="container mobile-drawer__inner">
                <nav className="mobile-drawer__nav" aria-label={t("nav.ariaMobile")}>
                  <MainNavMenuMobile
                    items={navTree}
                    navLinkClassName={navLinkClassName}
                    localizeHref={href}
                    onNavigate={() => setMenuOpen(false)}
                  />
                  <a
                    href={`${href("/")}#book-tour`}
                    className="btn mobile-cta mobile-cta--book"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("nav.bookVisit")}
                  </a>
                  <NavLink to={href("/registration")} className="btn btn-primary mobile-cta" onClick={() => setMenuOpen(false)}>
                    {t("nav.registration")}
                  </NavLink>
                </nav>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </>
  )
}
