import { Navigate, useOutletContext } from "react-router-dom"
import type { PublicLocaleOutletContext } from "./LocaleLayout"

/** Redirects `/en/book-tour` (etc.) to the localized home with a section hash. */
export function HomeHashRedirect({ hash }: { hash: string }) {
  const { href } = useOutletContext<PublicLocaleOutletContext>()
  return <Navigate to={{ pathname: href("/"), hash: `#${hash}` }} replace />
}
