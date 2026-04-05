import { Anchor, Button, Group, Paper, Select, Table, TextInput, Title } from "@mantine/core"
import { IconSearch, IconSortAscending } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"

type Row = {
  id: number
  slug: string
  locale: string
  published_at: string | null
  updated_at: string
}

type SortKey = "slug" | "locale" | "updated_at" | "published_at"

export function ContentPagesList() {
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
        const res = await adminFetch("/api/admin/content-pages")
        const data = (await res.json()) as { data?: Row[] }
        if (!res.ok) {
          throw new Error("fail")
        }
        if (!cancelled) {
          setRows(data.data ?? [])
        }
      } catch {
        if (!cancelled) {
          setError(t("admin.contentPages.loadError"))
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
    let list = q
      ? rows.filter((r) => r.slug.toLowerCase().includes(q) || r.locale.toLowerCase().includes(q))
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
        <Title order={3}>{t("admin.contentPages.title")}</Title>
        <Button component={Link} to="/admin/content-pages/new">
          {t("admin.contentPages.newPage")}
        </Button>
      </Group>

      <Group mb="md" align="flex-end" gap="md" wrap="wrap">
        <TextInput
          label={t("admin.contentPages.filterLabel")}
          placeholder={t("admin.contentPages.filterPlaceholder")}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: "1 1 200px", minWidth: 180 }}
        />
        <Select
          label={t("admin.contentPages.sortLabel")}
          leftSection={<IconSortAscending size={16} />}
          data={[
            { value: "slug", label: t("admin.contentPages.sortSlug") },
            { value: "locale", label: t("admin.contentPages.sortLocale") },
            { value: "updated_at", label: t("admin.contentPages.sortUpdated") },
            { value: "published_at", label: t("admin.contentPages.sortPublished") },
          ]}
          value={sort}
          onChange={(v) => setSort((v as SortKey) ?? "slug")}
          style={{ width: 180 }}
        />
        <Select
          label={t("admin.contentPages.directionLabel")}
          data={[
            { value: "asc", label: t("admin.contentPages.dirAsc") },
            { value: "desc", label: t("admin.contentPages.dirDesc") },
          ]}
          value={direction}
          onChange={(v) => setDirection((v as "asc" | "desc") ?? "asc")}
          style={{ width: 140 }}
        />
      </Group>

      {error ? <div style={{ color: "var(--mantine-color-red-6)" }}>{error}</div> : null}
      {!rows ? (
        <div>{t("admin.contentPages.loading")}</div>
      ) : (
        <Table striped highlightOnHover withTableBorder stickyHeader>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("admin.contentPages.colSlug")}</Table.Th>
              <Table.Th>{t("admin.contentPages.colLocale")}</Table.Th>
              <Table.Th>{t("admin.contentPages.colPublished")}</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered?.map((r) => (
              <Table.Tr key={r.id}>
                <Table.Td>{r.slug}</Table.Td>
                <Table.Td>{r.locale}</Table.Td>
                <Table.Td>
                  {r.published_at ? new Date(r.published_at).toLocaleString(localeTag) : t("admin.common.emDash")}
                </Table.Td>
                <Table.Td>
                  <Anchor component={Link} to={`/admin/content-pages/${r.id}/edit`} size="sm">
                    {t("admin.contentPages.edit")}
                  </Anchor>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      {filtered?.length === 0 ? (
        <div style={{ marginTop: 12 }}>
          {search.trim() ? t("admin.contentPages.emptySearch") : t("admin.contentPages.empty")}
        </div>
      ) : null}
    </Paper>
  )
}
