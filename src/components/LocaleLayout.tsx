import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Outlet } from "react-router-dom"
import type { PublicLocale } from "../i18n/localeRouting"
import { withLocalePath } from "../i18n/localeRouting"

export type PublicLocaleOutletContext = {
  lang: PublicLocale
  href: (path: string) => string
}

export function LocaleLayout({ lang }: { lang: PublicLocale }) {
  const { i18n } = useTranslation()

  useEffect(() => {
    void i18n.changeLanguage(lang)
  }, [lang, i18n])

  const context = useMemo<PublicLocaleOutletContext>(
    () => ({
      lang,
      href: (path: string) => withLocalePath(lang, path),
    }),
    [lang],
  )

  return <Outlet context={context} />
}
