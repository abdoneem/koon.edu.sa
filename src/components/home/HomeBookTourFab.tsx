import { useTranslation } from "react-i18next"

/** Mobile-only floating CTA; visibility controlled in CSS (home-mobile.css). */
export function HomeBookTourFab() {
  const { t } = useTranslation()
  return (
    <a href="#book-tour" className="home-book-fab">
      {t("nav.bookVisit")}
    </a>
  )
}
