import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { swapLocaleInPath } from "../i18n/localeRouting"

/** Short labels shown in the pill (same in both locales). */
const LABEL_EN = "EN"
const LABEL_AR = "ع"

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const goEn = () => {
    if (location.pathname.startsWith("/admin")) {
      void i18n.changeLanguage("en")
      return
    }
    navigate(swapLocaleInPath(location.pathname, "en") + location.search + location.hash, { replace: true })
  }

  const goAr = () => {
    if (location.pathname.startsWith("/admin")) {
      void i18n.changeLanguage("ar")
      return
    }
    navigate(swapLocaleInPath(location.pathname, "ar") + location.search + location.hash, { replace: true })
  }

  return (
    <div className="language-switcher" role="group" aria-label={t("language.switcherAria")}>
      <button
        type="button"
        className={i18n.language.startsWith("en") ? "active" : ""}
        onClick={goEn}
        lang="en"
        aria-label={t("language.ariaButtonEn")}
      >
        {LABEL_EN}
      </button>
      <button
        type="button"
        className={i18n.language.startsWith("ar") ? "active" : ""}
        onClick={goAr}
        lang="ar"
        aria-label={t("language.ariaButtonAr")}
      >
        {LABEL_AR}
      </button>
    </div>
  )
}
