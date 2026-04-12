import {
  Accordion,
  ActionIcon,
  Anchor,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconChevronDown, IconChevronUp, IconPlus } from "@tabler/icons-react"
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CmsMediaUploadField } from "./CmsMediaUploadField"
import { CmsRichTextEditor } from "./cms/CmsRichTextEditor"
import { CmsSectionFields } from "./cms/CmsSectionFields"
import { collectImageUrlsFromSections, type CmsSectionItemRow, type CmsSectionRow, type CmsPageRow } from "./cms/cmsEditorTypes"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"

export function CmsPageEditor() {
  const { t, isRtl } = useAdminI18n()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === undefined

  const [page, setPage] = useState<CmsPageRow | null>(null)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [locale, setLocale] = useState<"en" | "ar">("en")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [publishedAt, setPublishedAt] = useState("")
  const [pageSubtitle, setPageSubtitle] = useState("")
  const [headerBackground, setHeaderBackground] = useState("")
  const [bodyHtml, setBodyHtml] = useState("")
  const [editorNonce, setEditorNonce] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [sectionModal, sectionModalHandlers] = useDisclosure(false)
  const [newSectionType, setNewSectionType] = useState<string>("text")
  const [newSectionTitle, setNewSectionTitle] = useState("")
  const [newSectionSubtitle, setNewSectionSubtitle] = useState("")
  const [newSectionOrder, setNewSectionOrder] = useState<number | string>(0)
  const [newSectionActive, setNewSectionActive] = useState(true)

  const sectionTypeOptions = useMemo(
    () =>
      (["hero", "cards", "faq", "gallery", "text", "custom"] as const).map((v) => ({
        value: v,
        label: t(`admin.cmsEditor.sectionKind.${v}`),
      })),
    [t],
  )

  const loadPage = useCallback(async () => {
    if (isNew || !id) {
      return
    }
    setLoadError(null)
    try {
      const res = await adminFetch(`/api/admin/cms-pages/${id}`)
      if (!res.ok) {
        throw new Error("nf")
      }
      const row = (await res.json()) as CmsPageRow
      setPage(row)
      setTitle(row.title)
      setSlug(row.slug)
      setLocale(row.locale as "en" | "ar")
      setMetaTitle(row.meta_title ?? "")
      setMetaDescription(row.meta_description ?? "")
      setIsActive(row.is_active)
      setPublishedAt(row.published_at ? row.published_at.slice(0, 16) : "")
      setPageSubtitle(row.page_subtitle ?? "")
      setHeaderBackground(row.header_background ?? "")
      setBodyHtml(row.body_html ?? "")
      setEditorNonce((n) => n + 1)
    } catch {
      setLoadError(t("admin.cmsEditor.loadError"))
    }
  }, [id, isNew, t])

  useEffect(() => {
    void loadPage()
  }, [loadPage])

  async function savePageMeta(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      if (isNew) {
        const res = await adminFetch("/api/admin/cms-pages", {
          method: "POST",
          body: JSON.stringify({
            title,
            slug,
            locale,
            meta_title: metaTitle || null,
            meta_description: metaDescription || null,
            page_subtitle: pageSubtitle.trim() || null,
            header_background: headerBackground.trim() || null,
            body_html: bodyHtml.trim() ? bodyHtml : null,
            is_active: isActive,
            published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg =
            typeof data === "object" && data !== null && "message" in data
              ? String((data as { message: string }).message)
              : t("admin.cmsEditor.saveFailed")
          setError(msg)
          return
        }
        const newId = (data as CmsPageRow).id
        navigate(`/admin/cms-pages/${newId}/edit`, { replace: true })
        return
      }

      const res = await adminFetch(`/api/admin/cms-pages/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          slug,
          locale,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          page_subtitle: pageSubtitle.trim() || null,
          header_background: headerBackground.trim() || null,
          body_html: bodyHtml.trim() ? bodyHtml : null,
          is_active: isActive,
          published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg =
          typeof data === "object" && data !== null && "message" in data
            ? String((data as { message: string }).message)
            : t("admin.cmsEditor.saveFailed")
        setError(msg)
        return
      }
      await loadPage()
    } finally {
      setPending(false)
    }
  }

  async function addSection() {
    if (!page) {
      return
    }
    setPending(true)
    try {
      const res = await adminFetch(`/api/admin/cms-pages/${page.id}/sections`, {
        method: "POST",
        body: JSON.stringify({
          type: newSectionType,
          title: newSectionTitle || null,
          subtitle: newSectionSubtitle || null,
          sort_order: Number(newSectionOrder) || 0,
          is_active: newSectionActive,
        }),
      })
      if (!res.ok) {
        setError(t("admin.cmsEditor.errAddSection"))
        return
      }
      sectionModalHandlers.close()
      setNewSectionTitle("")
      setNewSectionSubtitle("")
      setNewSectionOrder(0)
      await loadPage()
    } finally {
      setPending(false)
    }
  }

  async function patchSection(section: CmsSectionRow, patch: Partial<CmsSectionRow>) {
    setPending(true)
    try {
      const res = await adminFetch(`/api/admin/cms-sections/${section.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          type: patch.type ?? section.type,
          title: patch.title !== undefined ? patch.title : section.title,
          subtitle: patch.subtitle !== undefined ? patch.subtitle : section.subtitle,
          sort_order: patch.sort_order ?? section.sort_order,
          is_active: patch.is_active ?? section.is_active,
        }),
      })
      if (!res.ok) {
        setError(t("admin.cmsEditor.errPatchSection"))
        return
      }
      await loadPage()
    } finally {
      setPending(false)
    }
  }

  async function swapSectionOrder(a: CmsSectionRow, b: CmsSectionRow) {
    setPending(true)
    setError(null)
    const ao = a.sort_order
    const bo = b.sort_order
    try {
      const r1 = await adminFetch(`/api/admin/cms-sections/${a.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sort_order: bo }),
      })
      const r2 = await adminFetch(`/api/admin/cms-sections/${b.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sort_order: ao }),
      })
      if (!r1.ok || !r2.ok) {
        setError(t("admin.cmsEditor.errPatchSection"))
        return
      }
      await loadPage()
    } finally {
      setPending(false)
    }
  }

  async function swapItemOrder(a: CmsSectionItemRow, b: CmsSectionItemRow) {
    setPending(true)
    setError(null)
    const ao = a.sort_order
    const bo = b.sort_order
    try {
      const r1 = await adminFetch(`/api/admin/cms-section-items/${a.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sort_order: bo }),
      })
      const r2 = await adminFetch(`/api/admin/cms-section-items/${b.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sort_order: ao }),
      })
      if (!r1.ok || !r2.ok) {
        setError(t("admin.cmsEditor.errPatchItem"))
        return
      }
      await loadPage()
    } finally {
      setPending(false)
    }
  }

  async function deleteSection(sectionId: number) {
    if (!window.confirm(t("admin.cmsEditor.confirmDeleteSection"))) {
      return
    }
    setPending(true)
    try {
      const res = await adminFetch(`/api/admin/cms-sections/${sectionId}`, { method: "DELETE" })
      if (!res.ok) {
        setError(t("admin.cmsEditor.errDeleteSection"))
        return
      }
      await loadPage()
    } finally {
      setPending(false)
    }
  }

  async function addItem(sectionId: number, initial?: Partial<CmsSectionItemRow>) {
    if (!page) {
      return
    }
    const sec = page.sections.find((s) => s.id === sectionId)
    const nextOrder = sec && sec.items.length > 0 ? Math.max(...sec.items.map((i) => i.sort_order)) + 1 : 0
    setPending(true)
    try {
      const res = await adminFetch(`/api/admin/cms-sections/${sectionId}/items`, {
        method: "POST",
        body: JSON.stringify({
          title: initial?.title !== undefined ? initial.title : null,
          description: initial?.description !== undefined ? initial.description : null,
          image: initial?.image !== undefined ? initial.image : null,
          icon: initial?.icon !== undefined ? initial.icon : null,
          link: initial?.link !== undefined ? initial.link : null,
          sort_order: initial?.sort_order !== undefined ? initial.sort_order : nextOrder,
        }),
      })
      if (!res.ok) {
        setError(t("admin.cmsEditor.errAddItem"))
        return
      }
      await loadPage()
    } finally {
      setPending(false)
    }
  }

  async function patchItem(item: CmsSectionItemRow, patch: Partial<CmsSectionItemRow>) {
    setPending(true)
    try {
      const res = await adminFetch(`/api/admin/cms-section-items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: patch.title !== undefined ? patch.title : item.title,
          description: patch.description !== undefined ? patch.description : item.description,
          image: patch.image !== undefined ? patch.image : item.image,
          icon: patch.icon !== undefined ? patch.icon : item.icon,
          link: patch.link !== undefined ? patch.link : item.link,
          sort_order: patch.sort_order ?? item.sort_order,
        }),
      })
      if (!res.ok) {
        setError(t("admin.cmsEditor.errPatchItem"))
        return
      }
      await loadPage()
    } finally {
      setPending(false)
    }
  }

  async function deleteItem(itemId: number) {
    if (!window.confirm(t("admin.cmsEditor.confirmDeleteItem"))) {
      return
    }
    setPending(true)
    try {
      const res = await adminFetch(`/api/admin/cms-section-items/${itemId}`, { method: "DELETE" })
      if (!res.ok) {
        setError(t("admin.cmsEditor.errDeleteItem"))
        return
      }
      await loadPage()
    } finally {
      setPending(false)
    }
  }

  if (!isNew && loadError) {
    return (
      <Paper withBorder p="md" radius="md" dir={isRtl ? "rtl" : "ltr"}>
        <Title order={3} mb="sm">
          {t("admin.cmsEditor.errorTitle")}
        </Title>
        <div>{loadError}</div>
        <Button component={Link} to="/admin/cms-pages" mt="md" variant="light">
          {t("admin.cmsEditor.backToList")}
        </Button>
      </Paper>
    )
  }

  if (!isNew && !page) {
    return (
      <Paper withBorder p="md" radius="md" dir={isRtl ? "rtl" : "ltr"}>
        {t("admin.common.loading")}
      </Paper>
    )
  }

  const sections = page?.sections ?? []
  const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
  const imageUrlOptions = page
    ? collectImageUrlsFromSections(page.sections, page.header_background?.trim() ? [page.header_background] : [])
    : []

  return (
    <Stack gap="lg" dir={isRtl ? "rtl" : "ltr"}>
      <Group justify="space-between">
        <Title order={3}>
          {isNew ? t("admin.cmsEditor.newTitle") : t("admin.cmsEditor.editTitle", { title: page?.title ?? "" })}
        </Title>
        <Button component={Link} to="/admin/cms-pages" variant="default" size="sm">
          {t("admin.cmsEditor.list")}
        </Button>
      </Group>

      <Paper withBorder shadow="sm" p="md" radius="md" component="form" onSubmit={(e) => void savePageMeta(e)}>
        <Stack gap="md">
          <Group justify="space-between" align="center" wrap="wrap">
            <Title order={5}>{t("admin.cmsEditor.pageMetaHeading")}</Title>
            {!isNew && slug.trim() ? (
              <Anchor href={`${window.location.origin}/${encodeURIComponent(slug.trim())}`} target="_blank" rel="noopener noreferrer" size="sm">
                {t("admin.cmsEditor.viewPublic")}
              </Anchor>
            ) : null}
          </Group>
          <TextInput label={t("admin.cmsEditor.pageTitle")} required value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
          <TextInput
            label={t("admin.cmsEditor.pageSubtitle")}
            description={t("admin.cmsEditor.pageSubtitleHint")}
            value={pageSubtitle}
            onChange={(e) => setPageSubtitle(e.currentTarget.value)}
          />
          <CmsMediaUploadField label={t("admin.cmsEditor.headerBackground")} value={headerBackground} onChange={setHeaderBackground} />
          <div>
            <Text size="sm" fw={600} mb={6}>
              {t("admin.cmsEditor.bodyHtml")}
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              {t("admin.cmsEditor.bodyHtmlHint")}
            </Text>
            <CmsRichTextEditor key={`${page?.id ?? "new"}-${editorNonce}`} initialHtml={bodyHtml} onChange={setBodyHtml} />
          </div>
          <Group grow>
            <TextInput
              label={t("admin.cmsEditor.slug")}
              required
              description={t("admin.cmsEditor.slugHint")}
              value={slug}
              onChange={(e) => setSlug(e.currentTarget.value)}
            />
            <Select
              label={t("admin.cmsEditor.pageLocale")}
              data={[
                { value: "en", label: t("admin.cmsEditor.localeOptionEn") },
                { value: "ar", label: t("admin.cmsEditor.localeOptionAr") },
              ]}
              value={locale}
              onChange={(v) => setLocale((v as "en" | "ar") ?? "en")}
            />
          </Group>
          <TextInput label={t("admin.cmsEditor.metaTitle")} value={metaTitle} onChange={(e) => setMetaTitle(e.currentTarget.value)} />
          <Textarea
            label={t("admin.cmsEditor.metaDescription")}
            minRows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.currentTarget.value)}
          />
          <Switch label={t("admin.cmsEditor.active")} checked={isActive} onChange={(e) => setIsActive(e.currentTarget.checked)} />
          <TextInput
            label={t("admin.cmsEditor.publishedAt")}
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.currentTarget.value)}
          />
          {error ? (
            <div style={{ color: "var(--mantine-color-red-6)" }}>{error}</div>
          ) : null}
          <Group>
            <Button type="submit" loading={pending}>
              {t("admin.cmsEditor.savePage")}
            </Button>
          </Group>
        </Stack>
      </Paper>

      {!isNew && page ? (
        <Paper withBorder shadow="sm" p="md" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={4}>{t("admin.cmsEditor.sectionsTitle")}</Title>
            <Button
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={() => sectionModalHandlers.open()}
            >
              {t("admin.cmsEditor.addSection")}
            </Button>
          </Group>

          {sections.length === 0 ? (
            <div style={{ color: "var(--mantine-color-dimmed)" }}>{t("admin.cmsEditor.noSections")}</div>
          ) : (
            <Accordion variant="separated">
              {sortedSections.map((sec, idx) => (
                <Accordion.Item key={sec.id} value={String(sec.id)}>
                  <Accordion.Control>
                    <Group justify="space-between" wrap="nowrap" pr="sm" align="center">
                      <span>
                        <strong>{t(`admin.cmsEditor.sectionKind.${sec.type}`, { defaultValue: sec.type })}</strong>
                        {sec.title ? ` — ${sec.title}` : ""}
                      </span>
                      <Group gap={4} wrap="nowrap">
                        <Tooltip label={t("admin.cmsEditor.sectionMoveUp")}>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            disabled={pending || idx === 0}
                            aria-label={t("admin.cmsEditor.sectionMoveUp")}
                            onClick={(e) => {
                              e.stopPropagation()
                              const prev = sortedSections[idx - 1]
                              if (prev) {
                                void swapSectionOrder(sec, prev)
                              }
                            }}
                          >
                            <IconChevronUp size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t("admin.cmsEditor.sectionMoveDown")}>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            disabled={pending || idx >= sortedSections.length - 1}
                            aria-label={t("admin.cmsEditor.sectionMoveDown")}
                            onClick={(e) => {
                              e.stopPropagation()
                              const next = sortedSections[idx + 1]
                              if (next) {
                                void swapSectionOrder(sec, next)
                              }
                            }}
                          >
                            <IconChevronDown size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <span style={{ fontSize: 12, color: "var(--mantine-color-dimmed)" }}>
                          {t("admin.cmsEditor.orderSummary", { order: sec.sort_order })}{" "}
                          {sec.is_active ? "" : t("admin.cmsEditor.disabled")}
                        </span>
                      </Group>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <CmsSectionFields
                      section={sec}
                      imageUrlOptions={imageUrlOptions}
                      pending={pending}
                      t={t}
                      sectionTypes={sectionTypeOptions}
                      onPatchSection={patchSection}
                      onPatchItem={patchItem}
                      onDeleteItem={deleteItem}
                      onSwapItems={swapItemOrder}
                      onAddItem={(sectionId, initial) => void addItem(sectionId, initial)}
                      onDeleteSection={deleteSection}
                    />
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </Paper>
      ) : null}

      <Modal opened={sectionModal} onClose={sectionModalHandlers.close} title={t("admin.cmsEditor.modalNewSection")} radius="md">
        <Stack gap="sm">
          <Select
            label={t("admin.cmsEditor.sectionType")}
            data={[...sectionTypeOptions]}
            value={newSectionType}
            onChange={(v) => setNewSectionType(v ?? "text")}
          />
          <TextInput
            label={t("admin.cmsEditor.sectionTitle")}
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.currentTarget.value)}
          />
          <TextInput
            label={t("admin.cmsEditor.sectionSubtitle")}
            value={newSectionSubtitle}
            onChange={(e) => setNewSectionSubtitle(e.currentTarget.value)}
          />
          <NumberInput label={t("admin.cmsEditor.orderLabel")} min={0} value={newSectionOrder} onChange={setNewSectionOrder} />
          <Switch label={t("admin.cmsEditor.active")} checked={newSectionActive} onChange={(e) => setNewSectionActive(e.currentTarget.checked)} />
          <Group justify="flex-end">
            <Button variant="default" onClick={sectionModalHandlers.close}>
              {t("admin.cmsEditor.cancel")}
            </Button>
            <Button loading={pending} onClick={() => void addSection()} disabled={!page}>
              {t("admin.cmsEditor.add")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
