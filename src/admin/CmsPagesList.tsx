import { Anchor, Button, Group, Paper, Select, Table, TextInput, Title } from "@mantine/core"
import { IconSearch, IconSortAscending } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"

type Row = {
  id: number
  title: string
  slug: string
  locale: string
  is_active: boolean
  published_at: string | null
  updated_at: string
}

type SortKey = "slug" | "locale" | "title" | "updated_at" | "published_at"

export function CmsPagesList() {
  const { t, isRtl, localeTag, listSortLocale } = useAdminI18n()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("slug")
  const [direction, setDirection] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await adminFetch("/api/admin/cms-pages")
        const data = (await res.json()) as { data?: Row[] }
        if (!res.ok) {
          throw new Error("fail")
        }
        if (!cancelled) {
          setRows(data.data ?? [])
        }
      } catch {
        if (!cancelled) {
          setError(t("admin.cmsPages.loadError"))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [t])

  const filtered = useMemo(() => {
    if (!rows) {
      return null
    }
    const q = search.trim().toLowerCase()
    const list = q
      ? rows.filter(
          (r) =>
            r.slug.toLowerCase().includes(q) ||
            r.locale.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q),
        )
      : [...rows]
    const mul = direction === "asc" ? 1 : -1
    list.sort((a, b) => {
      const va = a[sort]
      const vb = b[sort]
      if (va == null && vb == null) {
        return 0
      }
      if (va == null) {
        return 1
      }
      if (vb == null) {
        return -1
      }
      if (typeof va === "boolean" && typeof vb === "boolean") {
        return (Number(va) - Number(vb)) * mul
      }
      if (typeof va === "string" && typeof vb === "string") {
        return va.localeCompare(vb, listSortLocale) * mul
      }
      return (new Date(va as string).getTime() - new Date(vb as string).getTime()) * mul
    })
    return list
  }, [rows, search, sort, direction, listSortLocale])

  return (
    <Paper withBorder shadow="sm" p="md" radius="md" dir={isRtl ? "rtl" : "ltr"}>
      <Group justify="space-between" align="flex-end" mb="md" wrap="wrap">
        <Title order={3}>{t("admin.cmsPages.title")}</Title>
        <Button component={Link} to="/admin/cms-pages/new">
          {t("admin.cmsPages.newPage")}
        </Button>
      </Group>

      <Group mb="md" align="flex-end" gap="md" wrap="wrap">
        <TextInput
          label={t("admin.cmsPages.filterLabel")}
          placeholder={t("admin.cmsPages.filterPlaceholder")}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: "1 1 200px", minWidth: 180 }}
        />
        <Select
          label={t("admin.cmsPages.sortLabel")}
          leftSection={<IconSortAscending size={16} />}
          data={[
            { value: "slug", label: t("admin.cmsPages.sortSlug") },
            { value: "title", label: t("admin.cmsPages.sortTitle") },
            { value: "locale", label: t("admin.cmsPages.sortLocale") },
            { value: "updated_at", label: t("admin.cmsPages.sortUpdated") },
            { value: "published_at", label: t("admin.cmsPages.sortPublished") },
          ]}
          value={sort}
          onChange={(v) => setSort((v as SortKey) ?? "slug")}
          style={{ width: 180 }}
        />
        <Select
          label={t("admin.cmsPages.directionLabel")}
          data={[
            { value: "asc", label: t("admin.cmsPages.dirAsc") },
            { value: "desc", label: t("admin.cmsPages.dirDesc") },
          ]}
          value={direction}
          onChange={(v) => setDirection((v as "asc" | "desc") ?? "asc")}
          style={{ width: 140 }}
        />
      </Group>

      {error ? <div style={{ color: "var(--mantine-color-red-6)" }}>{error}</div> : null}
      {!rows ? (
        <div>{t("admin.cmsPages.loading")}</div>
      ) : (
        <Table striped highlightOnHover withTableBorder stickyHeader>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("admin.cmsPages.colTitle")}</Table.Th>
              <Table.Th>{t("admin.cmsPages.colSlug")}</Table.Th>
              <Table.Th>{t("admin.cmsPages.colLocale")}</Table.Th>
              <Table.Th>{t("admin.cmsPages.colPublished")}</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered?.map((r) => (
              <Table.Tr key={r.id}>
                <Table.Td>{r.title}</Table.Td>
                <Table.Td>{r.slug}</Table.Td>
                <Table.Td>{r.locale}</Table.Td>
                <Table.Td>
                  {r.published_at ? new Date(r.published_at).toLocaleString(localeTag) : t("admin.common.emDash")}
                </Table.Td>
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <Anchor component={Link} to={`/admin/cms-pages/${r.id}/edit`} size="sm">
                      {t("admin.cmsPages.edit")}
                    </Anchor>
                    <Anchor
                      href={`${typeof window !== "undefined" ? window.location.origin : ""}/${encodeURIComponent(r.slug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                    >
                      {t("admin.cmsPages.view")}
                    </Anchor>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      {filtered?.length === 0 ? (
        <div style={{ marginTop: 12 }}>
          {search.trim() ? t("admin.cmsPages.emptySearch") : t("admin.cmsPages.empty")}
        </div>
      ) : null}
    </Paper>
  )
}
