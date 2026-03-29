import { useTranslation } from "react-i18next"

/** Short labels shown in the pill (same in both locales). */
const LABEL_EN = "EN"
const LABEL_AR = "ع"

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  return (
    <div className="language-switcher" role="group" aria-label={t("language.switcherAria")}>
      <button
        type="button"
        className={i18n.language.startsWith("en") ? "active" : ""}
        onClick={() => i18n.changeLanguage("en")}
        lang="en"
        aria-label={t("language.ariaButtonEn")}
      >
        {LABEL_EN}
      </button>
      <button
        type="button"
        className={i18n.language.startsWith("ar") ? "active" : ""}
        onClick={() => i18n.changeLanguage("ar")}
        lang="ar"
        aria-label={t("language.ariaButtonAr")}
      >
        {LABEL_AR}
      </button>
    </div>
  )
}
