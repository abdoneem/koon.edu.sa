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
import { IconFileSpreadsheet, IconSearch, IconSortAscending, IconSortDescending } from "@tabler/icons-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRegistrationOptions } from "../hooks/useRegistrationOptions"
import type {
  Paginated,
  RegistrationSortField,
  RegistrationStatus,
  RegistrationSubmission,
} from "../types/registration"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"

const statusColors: Record<RegistrationStatus, string> = {
  pending: "yellow",
  reviewed: "blue",
  replied: "green",
  new: "gray",
  contacted: "cyan",
  closed: "red",
}

const sortFields: RegistrationSortField[] = [
  "created_at",
  "id",
  "student_full_name",
  "father_full_name",
  "grade_level",
  "status",
  "parent_mobile",
]

export function AdminRegistrationsPage() {
  const { t, isRtl, localeTag } = useAdminI18n()
  const optLang = isRtl ? "ar" : "en"
  const { gradeLabel, nationalityLabel } = useRegistrationOptions()

  const sortOptions = useMemo(
    () =>
      sortFields.map((value) => ({
        value,
        label: t(`admin.registrations.sort.${value}` as const),
      })),
    [t],
  )

  function statusLabel(status: RegistrationStatus): string {
    return t(`admin.registrations.status.${status}` as const)
  }

  function genderLabel(code: string): string {
    if (code === "male") {
      return t("admin.registrations.genderMale")
    }
    if (code === "female") {
      return t("admin.registrations.genderFemale")
    }
    return code
  }
  const [list, setList] = useState<Paginated<RegistrationSubmission> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<RegistrationSubmission | null>(null)
  const [modalOpened, { open, close }] = useDisclosure(false)
  const [reply, setReply] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [status, setStatus] = useState<RegistrationStatus>("pending")
  const [saving, setSaving] = useState(false)

  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch] = useDebouncedValue(searchInput, 350)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<RegistrationSortField>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [perPage, setPerPage] = useState(25)
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

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
      const res = await adminFetch(`/api/admin/registrations?${params.toString()}`)
      if (!res.ok) {
        throw new Error("fail")
      }
      setList((await res.json()) as Paginated<RegistrationSubmission>)
    } catch {
      setLoadError(t("admin.registrations.loadListError"))
      setList(null)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, sortField, sortDir, statusFilter, debouncedSearch, t])

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  function openRow(row: RegistrationSubmission) {
    setSelected(row)
    setReply(row.staff_reply ?? "")
    setInternalNotes(row.internal_notes ?? "")
    setStatus(row.status)
    open()
  }

  async function saveReply() {
    if (!selected) {
      return
    }
    setSaving(true)
    try {
      const res = await adminFetch(`/api/admin/registrations/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ staff_reply: reply, status, internal_notes: internalNotes }),
      })
      if (!res.ok) {
        throw new Error("save")
      }
      close()
      await fetchList()
    } catch {
      setLoadError(t("admin.registrations.saveError"))
    } finally {
      setSaving(false)
    }
  }

  const totalRecords = list?.total ?? 0

  async function exportExcel() {
    setLoadError(null)
    setExporting(true)
    try {
      const params = new URLSearchParams({
        sort: sortField,
        direction: sortDir,
      })
      if (statusFilter) {
        params.set("status", statusFilter)
      }
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim())
      }
      const res = await adminFetch(`/api/admin/registrations/export?${params.toString()}`, {
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream;q=0.9,*/*;q=0.8",
        },
      })
      if (!res.ok) {
        const errBody = (await res.json().catch(() => null)) as { message?: string } | null
        const msg = errBody?.message ?? `HTTP ${res.status}`
        setLoadError(msg)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `registration-export-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.rel = "noopener"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setLoadError(t("admin.registrations.exportError"))
    } finally {
      setExporting(false)
    }
  }

  return (
    <Stack gap="lg" dir={isRtl ? "rtl" : "ltr"}>
      <div>
        <Title order={2}>{t("admin.registrations.title")}</Title>
        <Text c="dimmed" size="sm" mt={4}>
          {t("admin.registrations.subtitle")}
        </Text>
      </div>

      {loadError ? (
        <Paper withBorder p="sm" radius="md" bg="red.0" c="red.8">
          {loadError}
        </Paper>
      ) : null}

      <Paper withBorder shadow="xs" p="md" radius="md">
        <Group align="flex-end" gap="md" wrap="wrap" justify="space-between">
          <Group align="flex-end" gap="md" wrap="wrap" style={{ flex: 1 }}>
          <TextInput
            label={t("admin.registrations.searchLabel")}
            description={t("admin.registrations.searchDesc")}
            placeholder={t("admin.registrations.searchPlaceholder")}
            leftSection={<IconSearch size={16} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            style={{ flex: "1 1 220px", minWidth: 200 }}
          />
          <Select
            label={t("admin.registrations.statusLabel")}
            placeholder={t("admin.registrations.statusAll")}
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
            label={t("admin.registrations.sortLabel")}
            data={sortOptions}
            value={sortField}
            onChange={(v) => {
              setSortField((v as RegistrationSortField) ?? "created_at")
              setPage(1)
            }}
            style={{ width: 180 }}
          />
          <Select
            label={t("admin.registrations.directionLabel")}
            data={[
              { value: "desc", label: t("admin.registrations.directionDesc") },
              { value: "asc", label: t("admin.registrations.directionAsc") },
            ]}
            value={sortDir}
            onChange={(v) => {
              setSortDir((v as "asc" | "desc") ?? "desc")
              setPage(1)
            }}
            leftSection={
              sortDir === "asc" ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />
            }
            style={{ width: 170 }}
          />
          <Select
            label={t("admin.registrations.perPageLabel")}
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
          <Button
            variant="light"
            color="teal"
            leftSection={<IconFileSpreadsheet size={18} />}
            loading={exporting}
            onClick={() => void exportExcel()}
            style={{ alignSelf: "flex-end" }}
          >
            {t("admin.registrations.exportExcel")}
          </Button>
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
                  ? t("admin.registrations.noResults")
                  : t("admin.registrations.showing", { shown: list?.data.length ?? 0, total: totalRecords })}
              </Text>
            </Box>
            <ScrollArea h="min(70vh, 56rem)" type="auto">
              <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t("admin.registrations.colId")}</Table.Th>
                    <Table.Th>{t("admin.registrations.colStudent")}</Table.Th>
                    <Table.Th>{t("admin.registrations.colMobile")}</Table.Th>
                    <Table.Th>{t("admin.registrations.colGrade")}</Table.Th>
                    <Table.Th>{t("admin.registrations.colStatus")}</Table.Th>
                    <Table.Th>{t("admin.registrations.colDate")}</Table.Th>
                    <Table.Th w={120}>{t("admin.registrations.colActions")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {list?.data.map((row) => (
                    <Table.Tr key={row.id}>
                      <Table.Td>{row.id}</Table.Td>
                      <Table.Td>{row.student_full_name}</Table.Td>
                      <Table.Td style={{ direction: "ltr", textAlign: "right" }}>{row.parent_mobile}</Table.Td>
                      <Table.Td>{gradeLabel(row.grade_level, optLang)}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={statusColors[row.status]} size="sm">
                          {statusLabel(row.status)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{new Date(row.created_at).toLocaleString(localeTag)}</Table.Td>
                      <Table.Td>
                        <Button variant="light" size="xs" onClick={() => openRow(row)}>
                          {t("admin.registrations.details")}
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {list && list.last_page > 1 ? (
              <Group justify="center" py="md" gap="sm">
                <Pagination
                  total={list.last_page}
                  value={page}
                  onChange={setPage}
                  size="sm"
                  radius="md"
                  withEdges
                />
              </Group>
            ) : null}
          </>
        )}
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={close}
        title={selected ? t("admin.registrations.modalTitle", { id: selected.id }) : ""}
        size="lg"
        radius="md"
      >
        {selected ? (
          <Stack gap="md">
            <Text size="sm">
              <strong>{t("admin.registrations.fatherName")}:</strong> {selected.father_full_name}
            </Text>
            <Text size="sm">
              <strong>{t("admin.registrations.fatherId")}:</strong> {selected.father_national_id}
            </Text>
            <Text size="sm">
              <strong>{t("admin.registrations.studentName")}:</strong> {selected.student_full_name}
            </Text>
            <Text size="sm">
              <strong>{t("admin.registrations.studentId")}:</strong> {selected.student_national_id}
            </Text>
            <Text size="sm">
              <strong>{t("admin.registrations.parentMobile")}:</strong> {selected.parent_mobile}
            </Text>
            <Text size="sm">
              <strong>{t("admin.registrations.gender")}:</strong> {genderLabel(selected.gender)} ({selected.gender})
            </Text>
            <Text size="sm">
              <strong>{t("admin.registrations.grade")}:</strong> {gradeLabel(selected.grade_level, optLang)}{" "}
              <Text span size="xs" c="dimmed">
                ({selected.grade_level})
              </Text>
            </Text>
            <Text size="sm">
              <strong>{t("admin.registrations.nationality")}:</strong>{" "}
              {nationalityLabel(selected.nationality, optLang)}{" "}
              <Text span size="xs" c="dimmed">
                ({selected.nationality})
              </Text>
            </Text>
            {selected.notes ? (
              <Text size="sm">
                <strong>{t("admin.registrations.applicantNotes")}:</strong> {selected.notes}
              </Text>
            ) : null}

            <Select
              label={t("admin.registrations.statusField")}
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
            />

            <Textarea
              label={t("admin.registrations.internalNotes")}
              minRows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.currentTarget.value)}
            />

            <Textarea
              label={t("admin.registrations.staffReply")}
              minRows={4}
              value={reply}
              onChange={(e) => setReply(e.currentTarget.value)}
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                {t("admin.registrations.cancel")}
              </Button>
              <Button loading={saving} onClick={() => void saveReply()}>
                {t("admin.registrations.save")}
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </Stack>
  )
}
