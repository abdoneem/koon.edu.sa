import { useTranslation } from "react-i18next"
import { brand } from "../config/brand"

function PortalLink({ href, label }: { href: string; label: string }) {
  const { t } = useTranslation()
  if (!href) {
    return (
      <span className="portal-strip__pending" title={t("portals.soon")}>
        {label}
      </span>
    )
  }
  return (
    <a className="portal-strip__link" href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  )
}

export function PortalStrip() {
  const { t } = useTranslation()

  return (
    <div className="portal-strip">
      <div className="container portal-strip__inner">
        <span className="portal-strip__hint">{t("portals.hint")}</span>
        <span className="portal-strip__sep" aria-hidden />
        <PortalLink href={brand.lmsParentUrl} label={t("portals.parent")} />
        <PortalLink href={brand.lmsStudentUrl} label={t("portals.student")} />
        <PortalLink href={brand.lmsTeacherUrl} label={t("portals.teacher")} />
      </div>
    </div>
  )
}
