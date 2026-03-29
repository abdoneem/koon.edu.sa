import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import type { Locale } from "../types/cms"

type AsyncFetcher<T> = (locale: Locale) => Promise<T | null>

interface UseCmsContentResult<T> {
  content: T
  isLoading: boolean
  error: string | null
}

export function useCmsContent<T>(
  fetcher: AsyncFetcher<T>,
  fallback: T,
): UseCmsContentResult<T> {
  const { i18n } = useTranslation()
  const [cmsContent, setCmsContent] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  /** CMS may legitimately return `null` (no API URL); loading must end when the fetch settles. */
  const [fetchPending, setFetchPending] = useState(false)

  useEffect(() => {
    const locale: Locale = i18n.language.startsWith("ar") ? "ar" : "en"
    let isActive = true

    Promise.resolve().then(() => {
      if (!isActive) {
        return
      }
      setFetchPending(true)
      setCmsContent(null)
      setError(null)
    })

    fetcher(locale)
      .then((data) => {
        if (!isActive) {
          return
        }
        setCmsContent(data)
      })
      .catch(() => {
        if (!isActive) {
          return
        }
        setError("Unable to load live CMS content. Fallback content is displayed.")
      })
      .finally(() => {
        if (isActive) {
          setFetchPending(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [fetcher, i18n.language])

  const content = useMemo(() => cmsContent ?? fallback, [cmsContent, fallback])

  return {
    content,
    isLoading: fetchPending && error === null,
    error,
  }
}
