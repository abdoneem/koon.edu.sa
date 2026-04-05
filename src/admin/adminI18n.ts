import { useTranslation } from "react-i18next"

export function useAdminI18n() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language.startsWith("ar")
  const localeTag = isRtl ? "ar-SA" : "en-US"
  const listSortLocale = isRtl ? "ar" : "en"
  return { t, i18n, isRtl, localeTag, listSortLocale }
}
