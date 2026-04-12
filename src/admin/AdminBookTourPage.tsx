import {
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  Pagination,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core"
import { useDebouncedValue, useDisclosure } from "@mantine/hooks"
import { IconSearch, IconSortAscending, IconSortDescending } from "@tabler/icons-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  BookTourRequestRow,
  BookTourSortField,
  BookTourStats,
  PaginatedBookTour,
} from "../types/bookTour"
import type { RegistrationStatus } from "../types/registration"
import { adminFetch } from "./adminApi"
import { ADMIN_PERMISSIONS } from "./adminPermissions"
import { useAdminI18n } from "./adminI18n"
import { hasAdminPermission } from "./authToken"

const statusColors: Record<RegistrationStatus, string> = {
  pending: "yellow",
  reviewed: "blue",
  replied: "green",
  new: "gray",
  contacted: "cyan",
  closed: "red",
}

const sortFields: BookTourSortField[] = ["created_at", "id", "name", "status", "phone"]

export function AdminBookTourPage() {
  const { t, isRtl, localeTag } = useAdminI18n()
  const canUpdate = hasAdminPermission(ADMIN_PERMISSIONS.bookTourUpdate)

  const sortOptions = useMemo(
    () =>
      sortFields.map((value) => ({
        value,
        label: t(`admin.bookTour.sort.${value}` as const),
      })),
    [t],
  )

  function statusLabel(status: RegistrationStatus): string {
    return t(`admin.bookTour.status.${status}` as const)
  }

  const [stats, setStats] = useState<BookTourStats | null>(null)
  const [list, setList] = useState<PaginatedBookTour | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<BookTourRequestRow | null>(null)
  const [modalOpened, { open, close }] = useDisclosure(false)
  const [reply, setReply] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [status, setStatus] = useState<RegistrationStatus>("pending")
  const [saving, setSaving] = useState(false)

  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch] = useDebouncedValue(searchInput, 350)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<BookTourSortField>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [perPage, setPerPage] = useState(25)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await adminFetch("/api/admin/book-tour-requests/stats")
        if (!res.ok || cancelled) {
          return
        }
        setStats((await res.json()) as BookTourStats)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const fetchList = useCallback(async () => {
    setLoadError(null)
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        sort: sortField,
        direction: sortDir,
      })
      if (statusFilter) {
        params.set("status", statusFilter)
      }
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim())
      }
      const res = await adminFetch(`/api/admin/book-tour-requests?${params.toString()}`)
      if (!res.ok) {
        throw new Error("fail")
      }
      setList((await res.json()) as PaginatedBookTour)
    } catch {
      setLoadError(t("admin.bookTour.loadListError"))
      setList(null)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, sortField, sortDir, statusFilter, debouncedSearch, t])

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  function openRow(row: BookTourRequestRow) {
    setSelected(row)
    setReply(row.staff_reply ?? "")
    setInternalNotes(row.internal_notes ?? "")
    setStatus(row.status)
    open()
  }

  async function saveReply() {
    if (!selected || !canUpdate) {
      return
    }
    setSaving(true)
    try {
      const res = await adminFetch(`/api/admin/book-tour-requests/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ staff_reply: reply, status, internal_notes: internalNotes }),
      })
      if (!res.ok) {
        throw new Error("save")
      }
      close()
      await fetchList()
    } catch {
      setLoadError(t("admin.bookTour.saveError"))
    } finally {
      setSaving(false)
    }
  }

  const totalRecords = list?.total ?? 0

  return (
    <Stack gap="lg" dir={isRtl ? "rtl" : "ltr"}>
      <div>
        <Title order={2}>{t("admin.bookTour.title")}</Title>
        <Text c="dimmed" size="sm" mt={4}>
          {t("admin.bookTour.subtitle")}
        </Text>
      </div>

      {stats ? (
        <Group gap="md" wrap="wrap">
          <Paper withBorder shadow="xs" p="sm" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {t("admin.bookTour.statTotal")}
            </Text>
            <Text fw={700}>{stats.total}</Text>
          </Paper>
          <Paper withBorder shadow="xs" p="sm" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {t("admin.bookTour.statPending")}
            </Text>
            <Text fw={700}>{stats.pending}</Text>
          </Paper>
          <Paper withBorder shadow="xs" p="sm" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {t("admin.bookTour.statReplied")}
            </Text>
            <Text fw={700}>{stats.replied}</Text>
          </Paper>
        </Group>
      ) : null}

      {loadError ? (
        <Paper withBorder p="sm" radius="md" bg="red.0" c="red.8">
          {loadError}
        </Paper>
      ) : null}

      <Paper withBorder shadow="xs" p="md" radius="md">
        <Group align="flex-end" gap="md" wrap="wrap">
          <TextInput
            label={t("admin.bookTour.searchLabel")}
            description={t("admin.bookTour.searchDesc")}
            placeholder={t("admin.bookTour.searchPlaceholder")}
            leftSection={<IconSearch size={16} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            style={{ flex: "1 1 220px", minWidth: 200 }}
          />
          <Select
            label={t("admin.bookTour.statusLabel")}
            placeholder={t("admin.bookTour.statusAll")}
            clearable
            data={[
              { value: "pending", label: statusLabel("pending") },
              { value: "reviewed", label: statusLabel("reviewed") },
              { value: "replied", label: statusLabel("replied") },
              { value: "new", label: statusLabel("new") },
              { value: "contacted", label: statusLabel("contacted") },
              { value: "closed", label: statusLabel("closed") },
            ]}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
            style={{ width: 160 }}
          />
          <Select
            label={t("admin.bookTour.sortLabel")}
            data={sortOptions}
            value={sortField}
            onChange={(v) => {
              setSortField((v as BookTourSortField) ?? "created_at")
              setPage(1)
            }}
            style={{ width: 180 }}
          />
          <Select
            label={t("admin.bookTour.directionLabel")}
            data={[
              { value: "desc", label: t("admin.bookTour.directionDesc") },
              { value: "asc", label: t("admin.bookTour.directionAsc") },
            ]}
            value={sortDir}
            onChange={(v) => {
              setSortDir((v as "asc" | "desc") ?? "desc")
              setPage(1)
            }}
            leftSection={sortDir === "asc" ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
            style={{ width: 170 }}
          />
          <Select
            label={t("admin.bookTour.perPageLabel")}
            data={[
              { value: "10", label: "10" },
              { value: "25", label: "25" },
              { value: "50", label: "50" },
              { value: "100", label: "100" },
            ]}
            value={String(perPage)}
            onChange={(v) => {
              setPerPage(Number(v) || 25)
              setPage(1)
            }}
            style={{ width: 120 }}
          />
        </Group>
      </Paper>

      <Paper withBorder shadow="sm" radius="md" pos="relative">
        {loading ? (
          <Group justify="center" p="xl">
            <Loader size="md" />
          </Group>
        ) : (
          <>
            <Box px="md" pt="md" pb="xs">
              <Text size="sm" c="dimmed">
                {totalRecords === 0
                  ? t("admin.bookTour.noResults")
                  : t("admin.bookTour.showing", { shown: list?.data.length ?? 0, total: totalRecords })}
              </Text>
            </Box>
            <ScrollArea h="min(70vh, 56rem)" type="auto">
              <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t("admin.bookTour.colId")}</Table.Th>
                    <Table.Th>{t("admin.bookTour.colName")}</Table.Th>
                    <Table.Th>{t("admin.bookTour.colPhone")}</Table.Th>
                    <Table.Th>{t("admin.bookTour.colEmail")}</Table.Th>
                    <Table.Th>{t("admin.bookTour.colVisit")}</Table.Th>
                    <Table.Th>{t("admin.bookTour.colStatus")}</Table.Th>
                    <Table.Th>{t("admin.bookTour.colDate")}</Table.Th>
                    <Table.Th w={120} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {list?.data.map((row) => (
                    <Table.Tr key={row.id}>
                      <Table.Td>{row.id}</Table.Td>
                      <Table.Td>{row.name}</Table.Td>
                      <Table.Td style={{ direction: "ltr", textAlign: "end" }}>{row.phone}</Table.Td>
                      <Table.Td>{row.email ?? ""}</Table.Td>
                      <Table.Td>{row.preferred_date ? row.preferred_date.slice(0, 10) : ""}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={statusColors[row.status]} size="sm">
                          {statusLabel(row.status)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{new Date(row.created_at).toLocaleString(localeTag)}</Table.Td>
                      <Table.Td>
                        <Button variant="light" size="xs" onClick={() => openRow(row)}>
                          {t("admin.bookTour.details")}
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {list && list.last_page > 1 ? (
              <Group justify="center" py="md" gap="sm">
                <Pagination total={list.last_page} value={page} onChange={setPage} size="sm" radius="md" withEdges />
              </Group>
            ) : null}
          </>
        )}
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={close}
        title={selected ? t("admin.bookTour.modalTitle", { id: selected.id }) : ""}
        size="lg"
        radius="md"
      >
        {selected ? (
          <Stack gap="md">
            <Text size="sm">
              <strong>{t("admin.bookTour.fieldName")}:</strong> {selected.name}
            </Text>
            <Text size="sm">
              <strong>{t("admin.bookTour.fieldPhone")}:</strong> {selected.phone}
            </Text>
            {selected.email ? (
              <Text size="sm">
                <strong>{t("admin.bookTour.fieldEmail")}:</strong> {selected.email}
              </Text>
            ) : null}
            {selected.preferred_date ? (
              <Text size="sm">
                <strong>{t("admin.bookTour.fieldPreferredDate")}:</strong> {selected.preferred_date.slice(0, 10)}
              </Text>
            ) : null}
            {selected.notes ? (
              <Text size="sm">
                <strong>{t("admin.bookTour.fieldNotes")}:</strong> {selected.notes}
              </Text>
            ) : null}

            <Select
              label={t("admin.bookTour.statusField")}
              data={[
                { value: "pending", label: statusLabel("pending") },
                { value: "reviewed", label: statusLabel("reviewed") },
                { value: "replied", label: statusLabel("replied") },
                { value: "new", label: statusLabel("new") },
                { value: "contacted", label: statusLabel("contacted") },
                { value: "closed", label: statusLabel("closed") },
              ]}
              value={status}
              onChange={(v) => setStatus((v as RegistrationStatus) ?? "pending")}
              disabled={!canUpdate}
            />

            <Textarea
              label={t("admin.bookTour.internalNotes")}
              minRows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.currentTarget.value)}
              disabled={!canUpdate}
            />

            <Textarea
              label={t("admin.bookTour.staffReply")}
              minRows={4}
              value={reply}
              onChange={(e) => setReply(e.currentTarget.value)}
              disabled={!canUpdate}
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                {t("admin.bookTour.cancel")}
              </Button>
              {canUpdate ? (
                <Button loading={saving} onClick={() => void saveReply()}>
                  {t("admin.bookTour.save")}
                </Button>
              ) : null}
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </Stack>
  )
}
