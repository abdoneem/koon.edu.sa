import { Alert, Button, Group, Modal, NativeSelect, Paper, Stack, Text, TextInput, Textarea, Title } from "@mantine/core"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  type AboutForm,
  type AdmissionsForm,
  type ContactForm,
  type LandingHeroForm,
  aboutFromPayload,
  admissionsFromPayload,
  buildAboutPayload,
  buildAdmissionsPayload,
  buildContactPayload,
  buildLandingPayload,
  contactFromPayload,
  emptyContact,
  emptyLandingHero,
  landingHeroFromPayload,
  landingRestJsonFromPayload,
} from "./contentPagePayloadUtils"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"
import { templateForSlug } from "./defaultPayloads"
import { LandingCollectionsEditor } from "./LandingCollectionsEditor"

const SLUGS = ["landing-page", "about-page", "admissions-page", "contact-page"] as const
type Slug = (typeof SLUGS)[number]

type PageRow = {
  id: number
  slug: string
  locale: string
  published_at: string | null
  payload: Record<string, unknown>
}

export function ContentPageEditor() {
  const { t, isRtl } = useAdminI18n()
  const slugSelectData = useMemo(
    () =>
      SLUGS.map((s) => ({
        value: s,
        label: (
          {
            "landing-page": t("admin.contentEditor.slugOptions.landing-page"),
            "about-page": t("admin.contentEditor.slugOptions.about-page"),
            "admissions-page": t("admin.contentEditor.slugOptions.admissions-page"),
            "contact-page": t("admin.contentEditor.slugOptions.contact-page"),
          } satisfies Record<Slug, string>
        )[s],
      })),
    [t],
  )
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === undefined

  const [slug, setSlug] = useState<Slug>("landing-page")
  const [locale, setLocale] = useState<"en" | "ar">("en")
  const [publishedAt, setPublishedAt] = useState("")
  const [heroAlt, setHeroAlt] = useState("")
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetPending, setResetPending] = useState(false)

  const [contact, setContact] = useState<ContactForm>(emptyContact)
  const [landingHero, setLandingHero] = useState<LandingHeroForm>(emptyLandingHero)
  const [landingRestJson, setLandingRestJson] = useState("{}")
  const [about, setAbout] = useState<AboutForm>({
    title: "",
    description: "",
    pillars: [{ id: "", title: "", description: "" }],
  })
  const [admissions, setAdmissions] = useState<AdmissionsForm>({
    title: "",
    description: "",
    steps: [{ id: "", title: "", description: "" }],
  })

  function applyPayloadToForms(p: Record<string, unknown>, s: Slug) {
    switch (s) {
      case "contact-page":
        setContact(contactFromPayload(p))
        break
      case "landing-page":
        setLandingHero(landingHeroFromPayload(p))
        setLandingRestJson(landingRestJsonFromPayload(p))
        break
      case "about-page":
        setAbout(aboutFromPayload(p))
        break
      case "admissions-page":
        setAdmissions(admissionsFromPayload(p))
        break
      default:
        break
    }
  }

  useEffect(() => {
    if (isNew) {
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await adminFetch(`/api/admin/content-pages/${id}`)
        if (!res.ok) {
          throw new Error("Not found")
        }
        const row = (await res.json()) as PageRow
        if (cancelled) {
          return
        }
        setSlug(row.slug as Slug)
        setLocale(row.locale as "en" | "ar")
        setPublishedAt(row.published_at ? row.published_at.slice(0, 16) : "")
        applyPayloadToForms(row.payload, row.slug as Slug)
      } catch {
        if (!cancelled) {
          setError(t("admin.contentEditor.loadFailed"))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, isNew, t])

  useEffect(() => {
    if (!isNew) {
      return
    }
    try {
      const raw = JSON.parse(templateForSlug(slug)) as Record<string, unknown>
      applyPayloadToForms(raw, slug)
    } catch {
      /* ignore — applyPayloadToForms not called with invalid template */
    }
  }, [slug, isNew])

  async function resetToSeededDefaults() {
    if (isNew || id === undefined) {
      return
    }
    setResetPending(true)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/content-pages/${id}/reset-to-seeded`, { method: "POST" })
      const data = (await res.json().catch(() => ({}))) as PageRow & { message?: string }
      if (!res.ok) {
        setError(
          typeof data.message === "string" ? data.message : t("admin.contentEditor.resetToSeededFailed"),
        )
        return
      }
      setSlug(data.slug as Slug)
      setLocale(data.locale as "en" | "ar")
      setPublishedAt(data.published_at ? data.published_at.slice(0, 16) : "")
      applyPayloadToForms(data.payload, data.slug as Slug)
      setHeroAlt("")
      setHeroFile(null)
      setResetModalOpen(false)
    } catch {
      setError(t("admin.contentEditor.networkError"))
    } finally {
      setResetPending(false)
    }
  }

  const buildPayload = useCallback((): Record<string, unknown> => {
    switch (slug) {
      case "contact-page":
        return buildContactPayload(contact)
      case "landing-page":
        return buildLandingPayload(landingHero, landingRestJson)
      case "about-page":
        return buildAboutPayload(about)
      case "admissions-page":
        return buildAdmissionsPayload(admissions)
    }
  }, [slug, contact, landingHero, landingRestJson, about, admissions])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    let payload: Record<string, unknown>
    try {
      payload = buildPayload()
    } catch (err) {
      setError(
        err instanceof Error && err.message === "invalidRestJson"
          ? t("admin.contentEditor.invalidRestJson")
          : t("admin.contentEditor.invalidJson"),
      )
      return
    }

    setPending(true)
    try {
      if (isNew) {
        const fd = new FormData()
        fd.append("slug", slug)
        fd.append("locale", locale)
        if (publishedAt) {
          fd.append("published_at", new Date(publishedAt).toISOString())
        }
        fd.append("payload", JSON.stringify(payload))
        if (heroAlt) {
          fd.append("hero_image_alt", heroAlt)
        }
        if (heroFile) {
          fd.append("hero_image", heroFile)
        }
        const res = await adminFetch("/api/admin/content-pages", { method: "POST", body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg =
            typeof data === "object" && data !== null && "message" in data
              ? String((data as { message: string }).message)
              : t("admin.contentEditor.saveFailed")
          setError(msg)
          return
        }
        navigate(`/admin/content-pages/${(data as PageRow).id}/edit`, { replace: true })
        return
      }

      const hasFile = heroFile !== null
      if (hasFile || heroAlt) {
        const fd = new FormData()
        fd.append("payload", JSON.stringify(payload))
        if (publishedAt) {
          fd.append("published_at", new Date(publishedAt).toISOString())
        }
        if (heroAlt) {
          fd.append("hero_image_alt", heroAlt)
        }
        if (heroFile) {
          fd.append("hero_image", heroFile)
        }
        fd.append("_method", "PUT")
        const res = await adminFetch(`/api/admin/content-pages/${id}`, { method: "POST", body: fd })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(
            typeof data === "object" && data !== null && "message" in data
              ? String((data as { message: string }).message)
              : t("admin.contentEditor.updateFailed"),
          )
          return
        }
      } else {
        const body: { payload: Record<string, unknown>; published_at?: string } = { payload }
        if (publishedAt) {
          body.published_at = new Date(publishedAt).toISOString()
        }
        const res = await adminFetch(`/api/admin/content-pages/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(
            typeof data === "object" && data !== null && "message" in data
              ? String((data as { message: string }).message)
              : t("admin.contentEditor.updateFailed"),
          )
          return
        }
      }
      navigate("/admin/content-pages", { replace: true })
    } catch {
      setError(t("admin.contentEditor.networkError"))
    } finally {
      setPending(false)
    }
  }

  const structuredVisual = (
    <Stack gap="md">
      {slug === "contact-page" ? (
        <>
          <TextInput
            label={t("admin.contentEditor.contactTitle")}
            value={contact.title}
            onChange={(e) => setContact((c) => ({ ...c, title: e.currentTarget.value }))}
          />
          <Textarea
            label={t("admin.contentEditor.contactDescription")}
            minRows={3}
            value={contact.description}
            onChange={(e) => setContact((c) => ({ ...c, description: e.currentTarget.value }))}
          />
          <TextInput
            label={t("admin.contentEditor.contactPhone")}
            value={contact.phone}
            onChange={(e) => setContact((c) => ({ ...c, phone: e.currentTarget.value }))}
          />
          <TextInput
            label={t("admin.contentEditor.contactEmail")}
            type="email"
            value={contact.email}
            onChange={(e) => setContact((c) => ({ ...c, email: e.currentTarget.value }))}
          />
          <Textarea
            label={t("admin.contentEditor.contactAddress")}
            minRows={2}
            value={contact.address}
            onChange={(e) => setContact((c) => ({ ...c, address: e.currentTarget.value }))}
          />
        </>
      ) : null}

      {slug === "landing-page" ? (
        <>
          <Title order={5}>{t("admin.contentEditor.heroBlock")}</Title>
          <TextInput
            label={t("admin.contentEditor.heroTitle")}
            value={landingHero.title}
            onChange={(e) => setLandingHero((h) => ({ ...h, title: e.currentTarget.value }))}
          />
          <TextInput
            label={t("admin.contentEditor.heroSubtitle")}
            value={landingHero.subtitle}
            onChange={(e) => setLandingHero((h) => ({ ...h, subtitle: e.currentTarget.value }))}
          />
          <Group grow>
            <TextInput
              label={t("admin.contentEditor.heroPrimaryCta")}
              value={landingHero.primaryCta}
              onChange={(e) => setLandingHero((h) => ({ ...h, primaryCta: e.currentTarget.value }))}
            />
            <TextInput
              label={t("admin.contentEditor.heroSecondaryCta")}
              value={landingHero.secondaryCta}
              onChange={(e) => setLandingHero((h) => ({ ...h, secondaryCta: e.currentTarget.value }))}
            />
          </Group>
          <TextInput
            label={t("admin.contentEditor.heroLocation")}
            value={landingHero.location}
            onChange={(e) => setLandingHero((h) => ({ ...h, location: e.currentTarget.value }))}
          />
          <TextInput
            label={t("admin.contentEditor.heroTrust")}
            value={landingHero.trustLine}
            onChange={(e) => setLandingHero((h) => ({ ...h, trustLine: e.currentTarget.value }))}
          />
          <LandingCollectionsEditor restJson={landingRestJson} onChange={setLandingRestJson} />
        </>
      ) : null}

      {slug === "about-page" ? (
        <>
          <TextInput
            label={t("admin.contentEditor.pageTitleField")}
            value={about.title}
            onChange={(e) => setAbout((a) => ({ ...a, title: e.currentTarget.value }))}
          />
          <Textarea
            label={t("admin.contentEditor.pageDescription")}
            minRows={3}
            value={about.description}
            onChange={(e) => setAbout((a) => ({ ...a, description: e.currentTarget.value }))}
          />
          <div>
            <Title order={5}>{t("admin.contentEditor.pillarsSection")}</Title>
            <Text size="sm" c="dimmed" mt={4}>
              {t("admin.contentEditor.pillarsSectionHint")}
            </Text>
          </div>
          <Stack gap="sm">
            {about.pillars.map((row, i) => (
              <Paper key={i} withBorder p="sm" radius="sm">
                <Group grow align="flex-start">
                  <TextInput
                    label={t("admin.landingBlocks.idOptional")}
                    value={row.id}
                    onChange={(e) => {
                      const next = [...about.pillars]
                      next[i] = { ...next[i], id: e.currentTarget.value }
                      setAbout((a) => ({ ...a, pillars: next }))
                    }}
                  />
                  <TextInput
                    label={t("admin.contentEditor.pillarTitle")}
                    value={row.title}
                    onChange={(e) => {
                      const next = [...about.pillars]
                      next[i] = { ...next[i], title: e.currentTarget.value }
                      setAbout((a) => ({ ...a, pillars: next }))
                    }}
                  />
                </Group>
                <Textarea
                  mt="xs"
                  label={t("admin.contentEditor.pillarBody")}
                  minRows={3}
                  value={row.description}
                  onChange={(e) => {
                    const next = [...about.pillars]
                    next[i] = { ...next[i], description: e.currentTarget.value }
                    setAbout((a) => ({ ...a, pillars: next }))
                  }}
                />
                <Button
                  mt="xs"
                  size="compact-xs"
                  color="red"
                  variant="light"
                  type="button"
                  onClick={() => {
                    const next = about.pillars.filter((_, j) => j !== i)
                    setAbout((a) => ({
                      ...a,
                      pillars: next.length ? next : [{ id: "", title: "", description: "" }],
                    }))
                  }}
                >
                  {t("admin.landingBlocks.removeRow")}
                </Button>
              </Paper>
            ))}
            <Button
              size="xs"
              variant="light"
              type="button"
              onClick={() =>
                setAbout((a) => ({
                  ...a,
                  pillars: [...a.pillars, { id: "", title: "", description: "" }],
                }))
              }
            >
              {t("admin.landingBlocks.addRow")}
            </Button>
          </Stack>
        </>
      ) : null}

      {slug === "admissions-page" ? (
        <>
          <TextInput
            label={t("admin.contentEditor.pageTitleField")}
            value={admissions.title}
            onChange={(e) => setAdmissions((a) => ({ ...a, title: e.currentTarget.value }))}
          />
          <Textarea
            label={t("admin.contentEditor.pageDescription")}
            minRows={3}
            value={admissions.description}
            onChange={(e) => setAdmissions((a) => ({ ...a, description: e.currentTarget.value }))}
          />
          <div>
            <Title order={5}>{t("admin.contentEditor.stepsSection")}</Title>
            <Text size="sm" c="dimmed" mt={4}>
              {t("admin.contentEditor.stepsSectionHint")}
            </Text>
          </div>
          <Stack gap="sm">
            {admissions.steps.map((row, i) => (
              <Paper key={i} withBorder p="sm" radius="sm">
                <Group grow align="flex-start">
                  <TextInput
                    label={t("admin.landingBlocks.idOptional")}
                    value={row.id}
                    onChange={(e) => {
                      const next = [...admissions.steps]
                      next[i] = { ...next[i], id: e.currentTarget.value }
                      setAdmissions((a) => ({ ...a, steps: next }))
                    }}
                  />
                  <TextInput
                    label={t("admin.contentEditor.stepTitle")}
                    value={row.title}
                    onChange={(e) => {
                      const next = [...admissions.steps]
                      next[i] = { ...next[i], title: e.currentTarget.value }
                      setAdmissions((a) => ({ ...a, steps: next }))
                    }}
                  />
                </Group>
                <Textarea
                  mt="xs"
                  label={t("admin.contentEditor.stepBody")}
                  minRows={3}
                  value={row.description}
                  onChange={(e) => {
                    const next = [...admissions.steps]
                    next[i] = { ...next[i], description: e.currentTarget.value }
                    setAdmissions((a) => ({ ...a, steps: next }))
                  }}
                />
                <Button
                  mt="xs"
                  size="compact-xs"
                  color="red"
                  variant="light"
                  type="button"
                  onClick={() => {
                    const next = admissions.steps.filter((_, j) => j !== i)
                    setAdmissions((a) => ({
                      ...a,
                      steps: next.length ? next : [{ id: "", title: "", description: "" }],
                    }))
                  }}
                >
                  {t("admin.landingBlocks.removeRow")}
                </Button>
              </Paper>
            ))}
            <Button
              size="xs"
              variant="light"
              type="button"
              onClick={() =>
                setAdmissions((a) => ({
                  ...a,
                  steps: [...a.steps, { id: "", title: "", description: "" }],
                }))
              }
            >
              {t("admin.landingBlocks.addRow")}
            </Button>
          </Stack>
        </>
      ) : null}
    </Stack>
  )

  return (
    <Stack gap="lg" maw={800} dir={isRtl ? "rtl" : "ltr"}>
      <Button component={Link} to="/admin/content-pages" variant="subtle" size="compact-sm">
        {t("admin.contentEditor.backLink")}
      </Button>
      <Title order={2}>{isNew ? t("admin.contentEditor.newTitle") : t("admin.contentEditor.editTitle", { id })}</Title>

      {error ? (
        <Alert color="red" title={t("admin.contentEditor.alertTitle")}>
          {error}
        </Alert>
      ) : null}

      <Paper withBorder shadow="sm" p="lg" radius="md" component="form" onSubmit={(e) => void onSubmit(e)}>
        <Stack gap="md">
          {isNew ? (
            <Group grow>
              <NativeSelect
                label={t("admin.contentEditor.slug")}
                data={slugSelectData}
                value={slug}
                onChange={(e) => setSlug(e.currentTarget.value as Slug)}
              />
              <NativeSelect
                label={t("admin.contentEditor.locale")}
                data={[
                  { value: "en", label: "en" },
                  { value: "ar", label: "ar" },
                ]}
                value={locale}
                onChange={(e) => setLocale(e.currentTarget.value as "en" | "ar")}
              />
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              <strong>{slug}</strong> · <strong>{locale}</strong>
            </Text>
          )}

          <TextInput
            label={t("admin.contentEditor.publishedAt")}
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.currentTarget.value)}
          />

          {slug === "landing-page" ? (
            <Stack gap="xs">
              <div>
                <Text size="sm" fw={500} mb={4}>
                  {t("admin.contentEditor.heroImage")}
                </Text>
                <input
                  type="file"
                  accept="image/*"
                  aria-label={t("admin.contentEditor.heroImage")}
                  onChange={(e) => setHeroFile(e.currentTarget.files?.[0] ?? null)}
                />
              </div>
              <TextInput
                label={t("admin.contentEditor.heroAlt")}
                value={heroAlt}
                onChange={(e) => setHeroAlt(e.currentTarget.value)}
              />
            </Stack>
          ) : null}

          {structuredVisual}

          {!isNew ? (
            <Button type="button" variant="light" color="orange" onClick={() => setResetModalOpen(true)}>
              {t("admin.contentEditor.resetToSeeded")}
            </Button>
          ) : null}

          <Button type="submit" loading={pending}>
            {pending ? t("admin.contentEditor.saving") : t("admin.contentEditor.save")}
          </Button>
        </Stack>
      </Paper>

      {!isNew ? (
        <Modal
          opened={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          title={t("admin.contentEditor.resetToSeededTitle")}
          radius="md"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <Stack gap="md">
            <Text size="sm">{t("admin.contentEditor.resetToSeededBody")}</Text>
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setResetModalOpen(false)}>
                {t("admin.contentEditor.cancel")}
              </Button>
              <Button color="orange" loading={resetPending} onClick={() => void resetToSeededDefaults()}>
                {t("admin.contentEditor.resetToSeededConfirm")}
              </Button>
            </Group>
          </Stack>
        </Modal>
      ) : null}
    </Stack>
  )
}
