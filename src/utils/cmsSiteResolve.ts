import type { TFunction } from "i18next"
import { brand } from "../config/brand"
import { getDefaultSiteNav } from "../content/siteNavDefaults"
import type { Locale } from "../types/cms"
import { type SiteNavItem, parseSiteNavTreeJson } from "../types/siteNav"

export type CmsSiteResolved = {
  logoSrc: string
  phoneDisplay: string
  phoneHref: string
  emailDisplay: string
  emailHref: string
  whatsappHref: string
  /** Main header navigation (from CMS or defaults). */
  navTree: SiteNavItem[]
}

function trimmed(v: string | null | undefined): string | undefined {
  const s = typeof v === "string" ? v.trim() : ""
  return s ? s : undefined
}

export function normalizeLogoSrc(raw: string, fallback: string): string {
  const s = raw.trim()
  if (!s) {
    return fallback
  }
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) {
    return s
  }
  return `/${s.replace(/^\/+/, "")}`
}

/** Build a tel: href from a human-entered phone string. */
export function normalizeTelHref(input: string): string {
  const s = input.trim().replace(/\s/g, "")
  if (!s) {
    return ""
  }
  if (s.toLowerCase().startsWith("tel:")) {
    return s
  }
  if (s.startsWith("+")) {
    return `tel:${s.replace(/[^\d+]/g, "")}`
  }
  const digits = s.replace(/\D/g, "")
  if (!digits) {
    return `tel:${s}`
  }
  if (digits.startsWith("966")) {
    return `tel:+${digits}`
  }
  if (digits.startsWith("0") && digits.length >= 9) {
    return `tel:+966${digits.slice(1)}`
  }
  return `tel:+${digits}`
}

export function resolveWhatsappHref(raw: string, fallback: string): string {
  const s = raw.trim()
  if (!s) {
    return fallback
  }
  if (/^https?:\/\//i.test(s)) {
    return s
  }
  const d = s.replace(/\D/g, "")
  if (!d) {
    return fallback
  }
  if (d.startsWith("966")) {
    return `https://wa.me/${d}`
  }
  if (d.startsWith("0")) {
    return `https://wa.me/966${d.slice(1)}`
  }
  return `https://wa.me/${d}`
}

export function buildCmsSiteResolved(
  settings: Record<string, string | null | undefined>,
  t: TFunction,
  locale: Locale,
): CmsSiteResolved {
  const phone = trimmed(settings.phone)
  const email = trimmed(settings.email)
  const whatsapp = trimmed(settings.whatsapp)
  const logo = trimmed(settings.logo)

  const emailFallback = String(t("footer.email"))
  const phoneFallbackDisplay = String(t("footer.phone"))

  const navKey = locale === "ar" ? "nav_tree_ar" : "nav_tree_en"
  const parsedNav = parseSiteNavTreeJson(settings[navKey])
  const navTree = parsedNav ?? getDefaultSiteNav(locale)

  return {
    logoSrc: logo ? normalizeLogoSrc(logo, brand.logoSrc) : brand.logoSrc,
    phoneDisplay: phone ?? phoneFallbackDisplay,
    phoneHref: phone ? normalizeTelHref(phone) : `tel:${brand.phoneTel}`,
    emailDisplay: email ?? emailFallback,
    emailHref: email ? `mailto:${email}` : `mailto:${emailFallback}`,
    whatsappHref: whatsapp ? resolveWhatsappHref(whatsapp, brand.whatsappHref) : brand.whatsappHref,
    navTree,
  }
}
