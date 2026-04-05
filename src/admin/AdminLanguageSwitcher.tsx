import { SegmentedControl } from "@mantine/core"
import { useTranslation } from "react-i18next"

export function AdminLanguageSwitcher({ size = "sm" }: { size?: "xs" | "sm" | "md" }) {
  const { i18n, t } = useTranslation()
  const lng = i18n.language.startsWith("ar") ? "ar" : "en"
  return (
    <SegmentedControl
      size={size}
      aria-label={t("admin.languageSwitcher.aria")}
      value={lng}
      onChange={(v) => void i18n.changeLanguage(v)}
      data={[
        { label: t("admin.languageSwitcher.en"), value: "en" },
        { label: t("admin.languageSwitcher.ar"), value: "ar" },
      ]}
    />
  )
}
