import { Button, Group, Modal, ScrollArea, Stack, Text, TextInput, Textarea } from "@mantine/core"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { putLandingCollection } from "../../services/landingPayloadAdmin"
import type { HighlightContent, Locale } from "../../types/cms"

type Props = {
  opened: boolean
  onClose: () => void
  locale: Locale
  highlights: HighlightContent[]
  onSaved: () => void
}

export function HomeHighlightsInlineModal({ opened, onClose, locale, highlights, onSaved }: Props) {
  const { t } = useTranslation()
  const [rows, setRows] = useState<HighlightContent[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!opened) {
      return
    }
    setRows(highlights.map((h) => ({ ...h })))
    setError(null)
  }, [opened, highlights])

  function patchRow(index: number, patch: Partial<HighlightContent>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  async function save() {
    setPending(true)
    setError(null)
    try {
      const payload = rows.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        title: r.title,
        description: r.description,
      }))
      const res = await putLandingCollection(locale, "highlights", payload)
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        errors?: Record<string, string[]>
      }
      if (!res.ok) {
        const fromErrors = data.errors ? Object.values(data.errors).flat().filter(Boolean).join(" ") : ""
        setError(
          typeof data.message === "string"
            ? data.message
            : fromErrors || t("inlineEdit.saveError"),
        )
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
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("inlineEdit.highlightsModalTitle")}
      radius="md"
      size="lg"
    >
      <ScrollArea h="min(70vh, 32rem)" type="auto" offsetScrollbars>
        <Stack gap="md" pr="xs">
          {error ? (
            <Text size="sm" c="red">
              {error}
            </Text>
          ) : null}
          {rows.map((row, i) => (
            <Stack key={row.id ?? `h-${i}`} gap="xs" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
              <Group justify="space-between" align="center" wrap="nowrap">
                <Text size="xs" fw={700} c="dimmed">
                  {t("inlineEdit.highlightsCardLabel", { n: i + 1 })}
                </Text>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="red"
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                >
                  {t("inlineEdit.removeRow")}
                </Button>
              </Group>
              <TextInput
                label={t("inlineEdit.fieldTitle")}
                value={row.title}
                onChange={(e) => patchRow(i, { title: e.currentTarget.value })}
              />
              <Textarea
                label={t("inlineEdit.fieldDescription")}
                value={row.description}
                onChange={(e) => patchRow(i, { description: e.currentTarget.value })}
                minRows={2}
              />
            </Stack>
          ))}
          <Button
            type="button"
            variant="light"
            size="xs"
            onClick={() => setRows((prev) => [...prev, { id: "", title: "", description: "" }])}
          >
            {t("inlineEdit.addRow")}
          </Button>
        </Stack>
      </ScrollArea>
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          {t("inlineEdit.cancel")}
        </Button>
        <Button loading={pending} onClick={() => void save()}>
          {t("inlineEdit.save")}
        </Button>
      </Group>
    </Modal>
  )
}
