import { useTranslation } from "react-i18next"
import { brand } from "../../config/brand"

function PortalCard({ href, label, soon }: { href: string; label: string; soon: string }) {
  return (
    <article className="home-portal-card home-portal-card--premium card">
      <h3 className="home-portal-card__title">{label}</h3>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-primary home-portal-card__btn">
          {label}
        </a>
      ) : (
        <p className="home-portal-card__soon" title={soon}>
          {soon}
        </p>
      )}
    </article>
  )
}

export function HomePortalCards() {
  const { t } = useTranslation()
  return (
    <div className="home-portal-grid home-portal-grid--premium">
      <PortalCard href={brand.lmsParentUrl} label={t("portals.parent")} soon={t("portals.soon")} />
      <PortalCard href={brand.lmsStudentUrl} label={t("portals.student")} soon={t("portals.soon")} />
      <PortalCard href={brand.lmsTeacherUrl} label={t("portals.teacher")} soon={t("portals.soon")} />
    </div>
  )
}
