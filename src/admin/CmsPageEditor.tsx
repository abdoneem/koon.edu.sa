import {
  Accordion,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { type FormEvent, useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"

const SECTION_TYPES = [
  { value: "hero", label: "hero" },
  { value: "cards", label: "cards" },
  { value: "faq", label: "faq" },
  { value: "gallery", label: "gallery" },
  { value: "text", label: "text" },
  { value: "custom", label: "custom" },
] as const

type CmsSectionItemRow = {
  id: number
  cms_section_id: number
  title: string | null
  description: string | null
  image: string | null
  icon: string | null
  link: string | null
  sort_order: number
}

type CmsSectionRow = {
  id: number
  cms_page_id: number
  type: string
  title: string | null
  subtitle: string | null
  sort_order: number
  is_active: boolean
  items: CmsSectionItemRow[]
}

type CmsPageRow = {
  id: number
  title: string
  slug: string
  locale: string
  meta_title: string | null
  meta_description: string | null
  is_active: boolean
  published_at: string | null
  sections: CmsSectionRow[]
}

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
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [sectionModal, sectionModalHandlers] = useDisclosure(false)
  const [newSectionType, setNewSectionType] = useState<string>("text")
  const [newSectionTitle, setNewSectionTitle] = useState("")
  const [newSectionSubtitle, setNewSectionSubtitle] = useState("")
  const [newSectionOrder, setNewSectionOrder] = useState<number | string>(0)
  const [newSectionActive, setNewSectionActive] = useState(true)

  const [itemModal, itemModalHandlers] = useDisclosure(false)
  const [itemSectionId, setItemSectionId] = useState<number | null>(null)
  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [newItemImage, setNewItemImage] = useState("")
  const [newItemIcon, setNewItemIcon] = useState("")
  const [newItemLink, setNewItemLink] = useState("")
  const [newItemOrder, setNewItemOrder] = useState<number | string>(0)

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

  function openAddItem(sectionId: number) {
    setItemSectionId(sectionId)
    setNewItemTitle("")
    setNewItemDescription("")
    setNewItemImage("")
    setNewItemIcon("")
    setNewItemLink("")
    setNewItemOrder(0)
    itemModalHandlers.open()
  }

  async function addItem() {
    if (!itemSectionId) {
      return
    }
    setPending(true)
    try {
      const res = await adminFetch(`/api/admin/cms-sections/${itemSectionId}/items`, {
        method: "POST",
        body: JSON.stringify({
          title: newItemTitle || null,
          description: newItemDescription || null,
          image: newItemImage || null,
          icon: newItemIcon || null,
          link: newItemLink || null,
          sort_order: Number(newItemOrder) || 0,
        }),
      })
      if (!res.ok) {
        setError(t("admin.cmsEditor.errAddItem"))
        return
      }
      itemModalHandlers.close()
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
          <TextInput label={t("admin.cmsEditor.pageTitle")} required value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
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
              {sections.map((sec) => (
                <Accordion.Item key={sec.id} value={String(sec.id)}>
                  <Accordion.Control>
                    <Group justify="space-between" wrap="nowrap" pr="sm">
                      <span>
                        <strong>{sec.type}</strong>
                        {sec.title ? ` — ${sec.title}` : ""}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--mantine-color-dimmed)" }}>
                        {t("admin.cmsEditor.orderSummary", { order: sec.sort_order })}{" "}
                        {sec.is_active ? "" : t("admin.cmsEditor.disabled")}
                      </span>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="sm">
                      <Group grow>
                        <Select
                          label={t("admin.cmsEditor.sectionType")}
                          data={[...SECTION_TYPES]}
                          value={sec.type}
                          onChange={(v) => {
                            if (v) {
                              void patchSection(sec, { type: v })
                            }
                          }}
                        />
                        <TextInput
                          label={t("admin.cmsEditor.orderLabel")}
                          type="number"
                          defaultValue={String(sec.sort_order)}
                          key={`sec-ord-${sec.id}-${sec.sort_order}`}
                          onBlur={(e) => {
                            const v = parseInt(e.currentTarget.value, 10)
                            if (!Number.isNaN(v)) {
                              void patchSection(sec, { sort_order: v })
                            }
                          }}
                        />
                      </Group>
                      <TextInput
                        label={t("admin.cmsEditor.sectionTitle")}
                        value={sec.title ?? ""}
                        onBlur={(e) => patchSection(sec, { title: e.currentTarget.value || null })}
                      />
                      <TextInput
                        label={t("admin.cmsEditor.sectionSubtitle")}
                        value={sec.subtitle ?? ""}
                        onBlur={(e) => patchSection(sec, { subtitle: e.currentTarget.value || null })}
                      />
                      <Switch
                        label={t("admin.cmsEditor.sectionActive")}
                        checked={sec.is_active}
                        onChange={(e) => patchSection(sec, { is_active: e.currentTarget.checked })}
                      />
                      <Group>
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconPlus size={14} />}
                          onClick={() => openAddItem(sec.id)}
                        >
                          {t("admin.cmsEditor.item")}
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          variant="light"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => void deleteSection(sec.id)}
                        >
                          {t("admin.cmsEditor.deleteSection")}
                        </Button>
                      </Group>

                      {sec.items.length > 0 ? (
                        <Table striped withTableBorder withColumnBorders style={{ fontSize: 13 }}>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>{t("admin.cmsEditor.colItemTitle")}</Table.Th>
                              <Table.Th>{t("admin.cmsEditor.colItemDesc")}</Table.Th>
                              <Table.Th>{t("admin.cmsEditor.colItemLink")}</Table.Th>
                              <Table.Th w={70}>{t("admin.cmsEditor.colItemOrder")}</Table.Th>
                              <Table.Th w={90} />
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {sec.items.map((it) => (
                              <Table.Tr key={it.id}>
                                <Table.Td>
                                  <TextInput
                                    size="xs"
                                    value={it.title ?? ""}
                                    onBlur={(e) => patchItem(it, { title: e.currentTarget.value || null })}
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <TextInput
                                    size="xs"
                                    value={it.description ?? ""}
                                    onBlur={(e) => patchItem(it, { description: e.currentTarget.value || null })}
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <TextInput
                                    size="xs"
                                    value={it.link ?? ""}
                                    onBlur={(e) => patchItem(it, { link: e.currentTarget.value || null })}
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <TextInput
                                    size="xs"
                                    type="number"
                                    defaultValue={String(it.sort_order)}
                                    key={`it-ord-${it.id}-${it.sort_order}`}
                                    onBlur={(e) => {
                                      const v = parseInt(e.currentTarget.value, 10)
                                      if (!Number.isNaN(v)) {
                                        void patchItem(it, { sort_order: v })
                                      }
                                    }}
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <Button size="compact-xs" color="red" variant="light" onClick={() => void deleteItem(it.id)}>
                                    {t("admin.cmsEditor.delete")}
                                  </Button>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      ) : null}
                    </Stack>
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
            data={[...SECTION_TYPES]}
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

      <Modal opened={itemModal} onClose={itemModalHandlers.close} title={t("admin.cmsEditor.modalNewItem")} radius="md">
        <Stack gap="sm">
          <TextInput label={t("admin.cmsEditor.itemTitle")} value={newItemTitle} onChange={(e) => setNewItemTitle(e.currentTarget.value)} />
          <Textarea
            label={t("admin.cmsEditor.itemDescription")}
            minRows={2}
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.currentTarget.value)}
          />
          <TextInput label={t("admin.cmsEditor.itemImage")} value={newItemImage} onChange={(e) => setNewItemImage(e.currentTarget.value)} />
          <TextInput label={t("admin.cmsEditor.itemIcon")} value={newItemIcon} onChange={(e) => setNewItemIcon(e.currentTarget.value)} />
          <TextInput label={t("admin.cmsEditor.itemLink")} value={newItemLink} onChange={(e) => setNewItemLink(e.currentTarget.value)} />
          <NumberInput label={t("admin.cmsEditor.itemOrder")} min={0} value={newItemOrder} onChange={setNewItemOrder} />
          <Group justify="flex-end">
            <Button variant="default" onClick={itemModalHandlers.close}>
              {t("admin.cmsEditor.cancel")}
            </Button>
            <Button loading={pending} onClick={() => void addItem()}>
              {t("admin.cmsEditor.add")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
