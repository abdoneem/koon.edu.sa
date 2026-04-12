import type { Locale } from "../types/cms"
import type { SiteNavItem } from "../types/siteNav"

const EN: SiteNavItem[] = [
  { id: "about", label: "About us", href: "/about" },
  { id: "academics", label: "Academics", href: "/academics" },
  { id: "student-life", label: "Student life", href: "/student-life" },
  { id: "admissions", label: "Admissions", href: "/admissions" },
  { id: "contact", label: "Contact", href: "/contact" },
]

const AR: SiteNavItem[] = [
  { id: "about", label: "عن المدرسة", href: "/about" },
  { id: "academics", label: "البرامج الأكاديمية", href: "/academics" },
  { id: "student-life", label: "الحياة المدرسية", href: "/student-life" },
  { id: "admissions", label: "القبول والتسجيل", href: "/admissions" },
  { id: "contact", label: "تواصل معنا", href: "/contact" },
]

export function getDefaultSiteNav(locale: Locale): SiteNavItem[] {
  return locale === "ar" ? structuredClone(AR) : structuredClone(EN)
}
