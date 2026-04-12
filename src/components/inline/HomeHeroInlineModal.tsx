import { Button, Group, Modal, Stack, TextInput, Textarea } from "@mantine/core"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { CmsMediaUploadField } from "../../admin/CmsMediaUploadField"
import { adminFetch } from "../../admin/adminApi"
import type { HeroContent, Locale } from "../../types/cms"

type Props = {
  opened: boolean
  onClose: () => void
  locale: Locale
  hero: HeroContent
  onSaved: () => void
}

export function HomeHeroInlineModal({ opened, onClose, locale, hero, onSaved }: Props) {
  const { t } = useTranslation()
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [primaryCta, setPrimaryCta] = useState("")
  const [secondaryCta, setSecondaryCta] = useState("")
  const [location, setLocation] = useState("")
  const [trustLine, setTrustLine] = useState("")
  const [bgUrl, setBgUrl] = useState("")
  const [bgAlt, setBgAlt] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!opened) {
      return
    }
    setTitle(hero.title ?? "")
    setSubtitle(hero.subtitle ?? "")
    setPrimaryCta(hero.primaryCta ?? "")
    setSecondaryCta(hero.secondaryCta ?? "")
    setLocation(hero.location ?? "")
    setTrustLine(hero.trustLine ?? "")
    setBgUrl(hero.backgroundImage?.url ?? "")
    setBgAlt(hero.backgroundImage?.alt ?? "")
    setError(null)
  }, [opened, hero])

  async function save() {
    setPending(true)
    setError(null)
    try {
      const heroPayload: Record<string, unknown> = {
        title,
        subtitle,
        primaryCta,
        secondaryCta,
        location,
        trustLine,
      }
      if (bgUrl.trim() || bgAlt.trim()) {
        heroPayload.backgroundImage = {
          url: bgUrl.trim(),
          alt: bgAlt.trim(),
        }
      }
      const res = await adminFetch("/api/admin/content-pages/landing-hero/inline", {
        method: "PATCH",
        body: JSON.stringify({ locale, hero: heroPayload }),
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; code?: string }
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : t("inlineEdit.saveError"))
        return
      }
      onSaved()
      onClose()
    } catch {
      setError(t("inlineEdit.saveError"))
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={t("inlineEdit.modalTitle")} radius="md" size="lg">
      <Stack gap="sm">
        {error ? (
          <div style={{ color: "var(--mantine-color-red-6)", fontSize: "0.875rem" }}>{error}</div>
        ) : null}
        <TextInput label={t("inlineEdit.fieldTitle")} value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
        <Textarea label={t("inlineEdit.fieldSubtitle")} value={subtitle} onChange={(e) => setSubtitle(e.currentTarget.value)} minRows={2} />
        <TextInput label={t("inlineEdit.fieldLocation")} value={location} onChange={(e) => setLocation(e.currentTarget.value)} />
        <TextInput label={t("inlineEdit.fieldTrustLine")} value={trustLine} onChange={(e) => setTrustLine(e.currentTarget.value)} />
        <TextInput label={t("inlineEdit.fieldPrimaryCta")} value={primaryCta} onChange={(e) => setPrimaryCta(e.currentTarget.value)} />
        <TextInput label={t("inlineEdit.fieldSecondaryCta")} value={secondaryCta} onChange={(e) => setSecondaryCta(e.currentTarget.value)} />
        <CmsMediaUploadField compact label={t("inlineEdit.fieldBgUrl")} value={bgUrl} onChange={setBgUrl} />
        <TextInput label={t("inlineEdit.fieldBgAlt")} value={bgAlt} onChange={(e) => setBgAlt(e.currentTarget.value)} />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            {t("inlineEdit.cancel")}
          </Button>
          <Button loading={pending} onClick={() => void save()}>
            {t("inlineEdit.save")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
