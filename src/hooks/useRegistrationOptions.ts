import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { fetchRegistrationOptions } from "../services/registrationOptionsClient"
import type { RegistrationOptionLocale, RegistrationOptionsPayload } from "../types/registrationOptions"

export function useRegistrationOptions() {
  const { t } = useTranslation()
  const [data, setData] = useState<RegistrationOptionsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const payload = await fetchRegistrationOptions()
        if (!cancelled) {
          setData(payload)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setData(null)
          setError(t("registrationPage.optionsLoadError"))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [t])

  const gradeLabel = useCallback(
    (code: string, lang: RegistrationOptionLocale = "ar") => {
      return data?.grades.find((g) => g.code === code)?.labels[lang] ?? code
    },
    [data],
  )

  const nationalityLabel = useCallback(
    (code: string, lang: RegistrationOptionLocale = "ar") => {
      return data?.nationalities.find((n) => n.code === code)?.labels[lang] ?? code
    },
    [data],
  )

  return { data, loading, error, gradeLabel, nationalityLabel }
}
