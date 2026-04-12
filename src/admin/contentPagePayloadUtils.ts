/** Helpers to edit legacy JSON payloads with structured forms where possible. */

export type ContactForm = {
  title: string
  description: string
  phone: string
  email: string
  address: string
}

export type LandingHeroForm = {
  title: string
  subtitle: string
  primaryCta: string
  secondaryCta: string
  location: string
  trustLine: string
}

export type AboutPillarRow = { id: string; title: string; description: string }

export type AboutForm = {
  title: string
  description: string
  pillars: AboutPillarRow[]
}

export type AdmissionsStepRow = { id: string; title: string; description: string }

export type AdmissionsForm = {
  title: string
  description: string
  steps: AdmissionsStepRow[]
}

export const emptyContact: ContactForm = {
  title: "",
  description: "",
  phone: "",
  email: "",
  address: "",
}

export const emptyLandingHero: LandingHeroForm = {
  title: "",
  subtitle: "",
  primaryCta: "",
  secondaryCta: "",
  location: "",
  trustLine: "",
}

export function contactFromPayload(p: Record<string, unknown>): ContactForm {
  return {
    title: String(p.title ?? ""),
    description: String(p.description ?? ""),
    phone: String(p.phone ?? ""),
    email: String(p.email ?? ""),
    address: String(p.address ?? ""),
  }
}

export function landingHeroFromPayload(p: Record<string, unknown>): LandingHeroForm {
  const h = p.hero && typeof p.hero === "object" ? (p.hero as Record<string, unknown>) : {}
  return {
    title: String(h.title ?? ""),
    subtitle: String(h.subtitle ?? ""),
    primaryCta: String(h.primaryCta ?? ""),
    secondaryCta: String(h.secondaryCta ?? ""),
    location: String(h.location ?? ""),
    trustLine: String(h.trustLine ?? ""),
  }
}

/** JSON for landing page excluding `hero` (programs, highlights, …). */
export function landingRestJsonFromPayload(p: Record<string, unknown>): string {
  const { hero: _h, ...rest } = p
  return JSON.stringify(rest, null, 2)
}

function mapPillarRows(raw: unknown): AboutPillarRow[] {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.map((x) => {
    const o = x && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : {}
    return {
      id: String(o.id ?? ""),
      title: String(o.title ?? ""),
      description: String(o.description ?? ""),
    }
  })
}

function mapStepRows(raw: unknown): AdmissionsStepRow[] {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.map((x) => {
    const o = x && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : {}
    return {
      id: String(o.id ?? ""),
      title: String(o.title ?? ""),
      description: String(o.description ?? ""),
    }
  })
}

export function aboutFromPayload(p: Record<string, unknown>): AboutForm {
  let pillars = mapPillarRows(p.pillars)
  if (pillars.length === 0) {
    pillars = [{ id: "", title: "", description: "" }]
  }
  return {
    title: String(p.title ?? ""),
    description: String(p.description ?? ""),
    pillars,
  }
}

export function admissionsFromPayload(p: Record<string, unknown>): AdmissionsForm {
  let steps = mapStepRows(p.steps)
  if (steps.length === 0) {
    steps = [{ id: "", title: "", description: "" }]
  }
  return {
    title: String(p.title ?? ""),
    description: String(p.description ?? ""),
    steps,
  }
}

export function buildContactPayload(f: ContactForm): Record<string, unknown> {
  return {
    title: f.title,
    description: f.description,
    phone: f.phone,
    email: f.email,
    address: f.address,
  }
}

export function buildLandingPayload(hero: LandingHeroForm, restJson: string): Record<string, unknown> {
  let rest: Record<string, unknown> = {}
  try {
    const parsed = JSON.parse(restJson) as unknown
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      rest = parsed as Record<string, unknown>
    }
  } catch {
    throw new Error("invalidRestJson")
  }
  return {
    ...rest,
    hero: {
      title: hero.title,
      subtitle: hero.subtitle,
      primaryCta: hero.primaryCta,
      secondaryCta: hero.secondaryCta,
      location: hero.location,
      trustLine: hero.trustLine || undefined,
    },
  }
}

export function buildAboutPayload(f: AboutForm): Record<string, unknown> {
  const pillars = f.pillars
    .filter((row) => row.id.trim() || row.title.trim() || row.description.trim())
    .map((row) => ({
      ...(row.id.trim() ? { id: row.id.trim() } : {}),
      title: row.title,
      description: row.description,
    }))
  return {
    title: f.title,
    description: f.description,
    pillars,
  }
}

export function buildAdmissionsPayload(f: AdmissionsForm): Record<string, unknown> {
  const steps = f.steps
    .filter((row) => row.id.trim() || row.title.trim() || row.description.trim())
    .map((row) => ({
      ...(row.id.trim() ? { id: row.id.trim() } : {}),
      title: row.title,
      description: row.description,
    }))
  return {
    title: f.title,
    description: f.description,
    steps,
  }
}
