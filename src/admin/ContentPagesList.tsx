import { Anchor, Button, Group, Paper, Select, Table, TextInput, Title } from "@mantine/core"
import { IconSearch, IconSortAscending } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { adminFetch } from "./adminApi"

type Row = {
  id: number
  slug: string
  locale: string
  published_at: string | null
  updated_at: string
}

type SortKey = "slug" | "locale" | "updated_at" | "published_at"

export function ContentPagesList() {
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
          setError("تعذر تحميل الصفحات.")
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
        return va.localeCompare(vb, "ar") * mul
      }
      return (new Date(va as string).getTime() - new Date(vb as string).getTime()) * mul
    })
    return list
  }, [rows, search, sort, direction])

  return (
    <Paper withBorder shadow="sm" p="md" radius="md" dir="rtl">
      <Group justify="space-between" align="flex-end" mb="md" wrap="wrap">
        <Title order={3}>صفحات المحتوى</Title>
        <Button component={Link} to="/admin/content-pages/new">
          + صفحة جديدة
        </Button>
      </Group>

      <Group mb="md" align="flex-end" gap="md" wrap="wrap">
        <TextInput
          label="تصفية"
          placeholder="الرمز أو اللغة…"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: "1 1 200px", minWidth: 180 }}
        />
        <Select
          label="ترتيب"
          leftSection={<IconSortAscending size={16} />}
          data={[
            { value: "slug", label: "الرمز" },
            { value: "locale", label: "اللغة" },
            { value: "updated_at", label: "آخر تحديث" },
            { value: "published_at", label: "تاريخ النشر" },
          ]}
          value={sort}
          onChange={(v) => setSort((v as SortKey) ?? "slug")}
          style={{ width: 180 }}
        />
        <Select
          label="الاتجاه"
          data={[
            { value: "asc", label: "تصاعدي" },
            { value: "desc", label: "تنازلي" },
          ]}
          value={direction}
          onChange={(v) => setDirection((v as "asc" | "desc") ?? "asc")}
          style={{ width: 140 }}
        />
      </Group>

      {error ? <div style={{ color: "var(--mantine-color-red-6)" }}>{error}</div> : null}
      {!rows ? (
        <div>جاري التحميل…</div>
      ) : (
        <Table striped highlightOnHover withTableBorder stickyHeader>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>الرمز</Table.Th>
              <Table.Th>اللغة</Table.Th>
              <Table.Th>النشر</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered?.map((r) => (
              <Table.Tr key={r.id}>
                <Table.Td>{r.slug}</Table.Td>
                <Table.Td>{r.locale}</Table.Td>
                <Table.Td>{r.published_at ? new Date(r.published_at).toLocaleString("ar-SA") : "—"}</Table.Td>
                <Table.Td>
                  <Anchor component={Link} to={`/admin/content-pages/${r.id}/edit`} size="sm">
                    تحرير
                  </Anchor>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      {filtered?.length === 0 ? (
        <div style={{ marginTop: 12 }}>{search.trim() ? "لا نتائج لهذا البحث." : "لا توجد صفوف. أنشئ صفحة أو شغّل db:seed."}</div>
      ) : null}
    </Paper>
  )
}
