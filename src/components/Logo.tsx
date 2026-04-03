import { useTranslation } from "react-i18next"
import { brand } from "../config/brand"

interface LogoProps {
  className?: string
}

export function Logo({ className = "" }: LogoProps) {
  const { t } = useTranslation()
  return (
    <img
      src={brand.logoSrc}
      alt={t("brand")}
      className={`site-logo ${className}`.trim()}
      width={44}
      height={44}
      decoding="async"
    />
  )
}
