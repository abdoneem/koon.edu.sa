import { Alert, Button, Group, Modal, Paper, Stack, Table, Text, TextInput, Textarea, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useCallback, useEffect, useMemo, useState } from "react"
import { formatApiError } from "./apiErrorMessage"
import { useAdminI18n } from "./adminI18n"
import type { Locale } from "../types/cms"
import type { HomeNewsItem } from "../types/homePageBundle"
import { formatNewsDateForDisplay, publishedAtToApi, toDateInputValue, toDatetimeLocalInputValue } from "../utils/newsDateInput"
import { CmsMediaUploadField } from "./CmsMediaUploadField"
import { deleteLandingItem, getLandingCollection, patchLandingItem, postLandingItem } from "../services/landingPayloadAdmin"

type Draft = {
  id?: string
  slug: string
  title: string
  excerpt: string
  date: string
  publishedAt: string
  image: string
  body: string
}

function toDraft(row: HomeNewsItem | null): Draft {
  return {
    id: row?.id,
    slug: row?.slug ?? "",
    title: row?.title ?? "",
    excerpt: row?.excerpt ?? "",
    date: toDateInputValue(row?.date),
    publishedAt: toDatetimeLocalInputValue(row?.publishedAt),
    image: row?.image ?? "",
    body: row?.body ?? "",
  }
}

export function AdminLandingNewsPage() {
  const { t, i18n, isRtl } = useAdminI18n()
  const locale: Locale = useMemo(() => (i18n.language.startsWith("ar") ? "ar" : "en"), [i18n.language])

  const [rows, setRows] = useState<HomeNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, createHandlers] = useDisclosure(false)
  const [editOpen, editHandlers] = useDisclosure(false)
  const [draft, setDraft] = useState<Draft>(() => toDraft(null))
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await getLandingCollection(locale, "news")
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(formatApiError(data, t("admin.growing.loadError")))
        return
      }
      const data = (await res.json()) as { data?: HomeNewsItem[] }
      setRows(Array.isArray(data.data) ? data.data : [])
    } catch {
      setError(t("admin.growing.loadError"))
    } finally {
      setLoading(false)
    }
  }, [locale, t])

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setDraft(toDraft(null))
    setEditingId(null)
    createHandlers.open()
  }

  function openEdit(row: HomeNewsItem) {
    setDraft(toDraft(row))
    setEditingId(row.id)
    editHandlers.open()
  }

  async function create() {
    setSaving(true)
    setError(null)
    try {
      const res = await postLandingItem(locale, "news", {
        slug: draft.slug.trim() !== "" ? draft.slug : null,
        title: draft.title,
        excerpt: draft.excerpt,
        date: draft.date.trim() !== "" ? draft.date : null,
        publishedAt: publishedAtToApi(draft.publishedAt),
        image: draft.image.trim() !== "" ? draft.image : null,
        body: draft.body.trim() !== "" ? draft.body : null,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(formatApiError(data, t("admin.growing.saveError")))
        return
      }
      createHandlers.close()
      await load()
    } catch {
      setError(t("admin.growing.saveError"))
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit() {
    if (!editingId) {
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await patchLandingItem(locale, "news", editingId, {
        slug: draft.slug.trim() !== "" ? draft.slug : null,
        title: draft.title,
        excerpt: draft.excerpt,
        date: draft.date.trim() !== "" ? draft.date : null,
        publishedAt: publishedAtToApi(draft.publishedAt),
        image: draft.image.trim() !== "" ? draft.image : null,
        body: draft.body.trim() !== "" ? draft.body : null,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(formatApiError(data, t("admin.growing.saveError")))
        return
      }
      editHandlers.close()
      setEditingId(null)
      await load()
    } catch {
      setError(t("admin.growing.saveError"))
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t("admin.growing.confirmDelete"))) {
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await deleteLandingItem(locale, "news", id)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(formatApiError(data, t("admin.growing.deleteError")))
        return
      }
      await load()
    } catch {
      setError(t("admin.growing.deleteError"))
    } finally {
      setSaving(false)
    }
  }

  const tableRows = rows.map((r) => (
    <Table.Tr key={r.id}>
      <Table.Td>
        <Text fw={600} lineClamp={2}>
          {r.title}
        </Text>
        {r.date ? (
          <Text size="xs" c="dimmed">
            {formatNewsDateForDisplay(r.date, locale === "ar" ? "ar-SA" : "en-US")}
          </Text>
        ) : null}
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={2}>
          {r.excerpt}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed" lineClamp={1}>
          {r.image ?? ""}
        </Text>
      </Table.Td>
      <Table.Td w={220}>
        <Group justify="flex-end" gap="xs" wrap="nowrap">
          <Button variant="light" onClick={() => openEdit(r)} disabled={saving}>
            {t("admin.growing.edit")}
          </Button>
          <Button color="red" variant="light" onClick={() => void remove(r.id)} disabled={saving}>
            {t("admin.growing.delete")}
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Stack gap="md" dir={isRtl ? "rtl" : "ltr"}>
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Title order={2}>{t("admin.news.title")}</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {t("admin.news.subtitle")}
          </Text>
        </div>
        <Button onClick={openCreate} disabled={loading}>
          {t("admin.news.new")}
        </Button>
      </Group>

      {error ? (
        <Alert color="red" title={t("admin.growing.errorTitle")}>
          {error}
        </Alert>
      ) : null}

      <Paper withBorder shadow="sm" p="md" radius="md">
        {loading ? (
          <Text c="dimmed">{t("admin.growing.loading")}</Text>
        ) : rows.length === 0 ? (
          <Text c="dimmed">{t("admin.news.empty")}</Text>
        ) : (
          <Table highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("admin.news.colTitle")}</Table.Th>
                <Table.Th>{t("admin.news.colExcerpt")}</Table.Th>
                <Table.Th>{t("admin.news.colImage")}</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{tableRows}</Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal opened={createOpen} onClose={createHandlers.close} title={t("admin.news.new")} radius="md" size="lg">
        <Stack gap="sm">
          <TextInput label={t("admin.growing.fieldSlug")} value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.currentTarget.value }))} />
          <TextInput label={t("admin.growing.fieldTitle")} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.currentTarget.value }))} />
          <Textarea label={t("admin.growing.fieldExcerpt")} value={draft.excerpt} minRows={3} onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.currentTarget.value }))} />
          <TextInput type="date" label={t("admin.news.fieldDate")} value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.currentTarget.value }))} />
          <TextInput type="datetime-local" label={t("admin.growing.fieldPublishedAt")} value={draft.publishedAt} onChange={(e) => setDraft((d) => ({ ...d, publishedAt: e.currentTarget.value }))} />
          <CmsMediaUploadField label={t("admin.news.fieldImage")} value={draft.image} onChange={(url) => setDraft((d) => ({ ...d, image: url }))} />
          <Textarea
            label={t("admin.growing.fieldBody")}
            value={draft.body}
            minRows={8}
            styles={{ input: { fontFamily: "ui-monospace, monospace" } }}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.currentTarget.value }))}
          />
          <Text size="xs" c="dimmed">
            {t("admin.growing.fieldBodyMarkdownHint")}
          </Text>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={createHandlers.close}>
              {t("admin.growing.cancel")}
            </Button>
            <Button loading={saving} onClick={() => void create()}>
              {t("admin.growing.save")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={editOpen} onClose={editHandlers.close} title={t("admin.growing.edit")} radius="md" size="lg">
        <Stack gap="sm">
          <TextInput label={t("admin.growing.fieldSlug")} value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.currentTarget.value }))} />
          <TextInput label={t("admin.growing.fieldTitle")} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.currentTarget.value }))} />
          <Textarea label={t("admin.growing.fieldExcerpt")} value={draft.excerpt} minRows={3} onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.currentTarget.value }))} />
          <TextInput type="date" label={t("admin.news.fieldDate")} value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.currentTarget.value }))} />
          <TextInput type="datetime-local" label={t("admin.growing.fieldPublishedAt")} value={draft.publishedAt} onChange={(e) => setDraft((d) => ({ ...d, publishedAt: e.currentTarget.value }))} />
          <CmsMediaUploadField label={t("admin.news.fieldImage")} value={draft.image} onChange={(url) => setDraft((d) => ({ ...d, image: url }))} />
          <Textarea
            label={t("admin.growing.fieldBody")}
            value={draft.body}
            minRows={8}
            styles={{ input: { fontFamily: "ui-monospace, monospace" } }}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.currentTarget.value }))}
          />
          <Text size="xs" c="dimmed">
            {t("admin.growing.fieldBodyMarkdownHint")}
          </Text>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={editHandlers.close}>
              {t("admin.growing.cancel")}
            </Button>
            <Button loading={saving} onClick={() => void saveEdit()}>
              {t("admin.growing.save")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}

