import { useTranslation } from "react-i18next"
import { useCmsSite } from "../context/CmsSiteContext"

interface LogoProps {
  className?: string
}

export function Logo({ className = "" }: LogoProps) {
  const { t } = useTranslation()
  const { logoSrc } = useCmsSite()
  return (
    <img
      src={logoSrc}
      alt={t("brand")}
      className={`site-logo ${className}`.trim()}
      width={44}
      height={44}
      decoding="async"
    />
  )
}
