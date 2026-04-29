import {
  Alert,
  Badge,
  Box,
  Button,
  Grid,
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
import {
  IconFileSpreadsheet,
  IconPlus,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react"
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
import { ADMIN_PERMISSIONS } from "./adminPermissions"
import { hasAdminPermission } from "./authToken"

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
  const { data: options, loading: optionsLoading, error: optionsError, gradeLabel } =
    useRegistrationOptions()
  const canEdit = hasAdminPermission(ADMIN_PERMISSIONS.registrationsUpdate)

  const genderData = useMemo(
    () => [
      { value: "male", label: t("admin.registrations.genderMale") },
      { value: "female", label: t("admin.registrations.genderFemale") },
    ],
    [t],
  )

  const gradeData = useMemo(() => {
    if (!options) return []
    return [...options.grades]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((g) => ({ value: g.code, label: g.labels[optLang] }))
  }, [options, optLang])

  const nationalityData = useMemo(() => {
    if (!options) return []
    return [...options.nationalities]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((n) => ({
        value: n.code,
        label: isRtl ? n.labels.ar : `${n.labels.en} — ${n.labels.ar}`,
      }))
  }, [options, isRtl])

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

  // (gender labels are handled via `genderData` for Select)
  const [list, setList] = useState<Paginated<RegistrationSubmission> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<RegistrationSubmission | null>(null)
  const [modalOpened, { open, close }] = useDisclosure(false)
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false)
  const [reply, setReply] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [status, setStatus] = useState<RegistrationStatus>("pending")
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newCampus, setNewCampus] = useState<"" | "madinah" | "riyadh">("")
  const [newFatherName, setNewFatherName] = useState("")
  const [newFatherId, setNewFatherId] = useState("")
  const [newParentMobile, setNewParentMobile] = useState("")
  const [newStudentName, setNewStudentName] = useState("")
  const [newStudentId, setNewStudentId] = useState("")
  const [newGender, setNewGender] = useState<"" | "male" | "female">("")
  const [newGrade, setNewGrade] = useState<string>("")
  const [newNationality, setNewNationality] = useState<string>("")
  const [newNotes, setNewNotes] = useState("")
  const [newInternalNotes, setNewInternalNotes] = useState("")

  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch] = useDebouncedValue(searchInput, 350)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<RegistrationSortField>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [perPage, setPerPage] = useState(25)
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  const [editFatherName, setEditFatherName] = useState("")
  const [editFatherId, setEditFatherId] = useState("")
  const [editParentMobile, setEditParentMobile] = useState("")
  const [editStudentName, setEditStudentName] = useState("")
  const [editStudentId, setEditStudentId] = useState("")
  const [editGender, setEditGender] = useState<"" | "male" | "female">("")
  const [editGrade, setEditGrade] = useState<string>("")
  const [editNationality, setEditNationality] = useState<string>("")
  const [editNotes, setEditNotes] = useState("")

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
    setEditFatherName(row.father_full_name ?? "")
    setEditFatherId(row.father_national_id ?? "")
    setEditParentMobile(row.parent_mobile ?? "")
    setEditStudentName(row.student_full_name ?? "")
    setEditStudentId(row.student_national_id ?? "")
    setEditGender(((row.gender as "" | "male" | "female") ?? "") || "")
    setEditGrade(row.grade_level ?? "")
    setEditNationality(row.nationality ?? "")
    setEditNotes(row.notes ?? "")
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
        body: JSON.stringify({
          father_full_name: editFatherName.trim() || null,
          father_national_id: editFatherId.trim() || null,
          parent_mobile: editParentMobile.trim() || null,
          student_full_name: editStudentName.trim() || null,
          student_national_id: editStudentId.trim() || null,
          gender: editGender || null,
          grade_level: editGrade.trim() || null,
          nationality: editNationality.trim() || null,
          notes: editNotes.trim() || null,
          staff_reply: reply,
          status,
          internal_notes: internalNotes,
        }),
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
          <Group gap="sm" style={{ alignSelf: "flex-end" }}>
            {hasAdminPermission(ADMIN_PERMISSIONS.registrationsUpdate) ? (
              <Button
                variant="filled"
                color="blue"
                leftSection={<IconPlus size={18} />}
                onClick={() => {
                  setNewCampus("")
                  setNewFatherName("")
                  setNewFatherId("")
                  setNewParentMobile("")
                  setNewStudentName("")
                  setNewStudentId("")
                  setNewGender("")
                  setNewGrade("")
                  setNewNationality("")
                  setNewNotes("")
                  setNewInternalNotes("")
                  openCreate()
                }}
              >
                {t("admin.registrations.addNew")}
              </Button>
            ) : null}
            <Button
              variant="light"
              color="teal"
              leftSection={<IconFileSpreadsheet size={18} />}
              loading={exporting}
              onClick={() => void exportExcel()}
            >
              {t("admin.registrations.exportExcel")}
            </Button>
          </Group>
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
                      <Table.Td>{row.student_full_name || t("admin.common.emDash")}</Table.Td>
                      <Table.Td style={{ direction: "ltr", textAlign: "end" }}>{row.parent_mobile}</Table.Td>
                      <Table.Td>
                        {row.grade_level ? gradeLabel(row.grade_level, optLang) : t("admin.common.emDash")}
                      </Table.Td>
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
        styles={{
          body: { display: "flex", flexDirection: "column", height: "min(70vh, 42rem)" },
        }}
      >
        {selected ? (
          <>
            <ScrollArea type="auto" offsetScrollbars style={{ flex: 1 }}>
              <Stack gap="md" pr="xs">
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label={t("admin.registrations.fatherName")}
                      value={editFatherName}
                      onChange={(e) => setEditFatherName(e.currentTarget.value)}
                      disabled={!canEdit}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label={t("admin.registrations.fatherId")}
                      value={editFatherId}
                      onChange={(e) => setEditFatherId(e.currentTarget.value)}
                      disabled={!canEdit}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label={t("admin.registrations.parentMobile")}
                      value={editParentMobile}
                      onChange={(e) => setEditParentMobile(e.currentTarget.value)}
                      disabled={!canEdit}
                      style={{ direction: "ltr" }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label={t("admin.registrations.studentName")}
                      value={editStudentName}
                      onChange={(e) => setEditStudentName(e.currentTarget.value)}
                      disabled={!canEdit}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label={t("admin.registrations.studentId")}
                      value={editStudentId}
                      onChange={(e) => setEditStudentId(e.currentTarget.value)}
                      disabled={!canEdit}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label={t("admin.registrations.gender")}
                      placeholder={t("admin.common.emDash")}
                      data={genderData}
                      value={editGender}
                      onChange={(v) => setEditGender((v as "" | "male" | "female") ?? "")}
                      disabled={!canEdit}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label={t("admin.registrations.grade")}
                      placeholder={t("admin.common.emDash")}
                      searchable
                      data={gradeData}
                      disabled={!canEdit || optionsLoading || !options}
                      value={editGrade}
                      onChange={(v) => setEditGrade(v ?? "")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label={t("admin.registrations.nationality")}
                      placeholder={t("admin.common.emDash")}
                      searchable
                      data={nationalityData}
                      disabled={!canEdit || optionsLoading || !options}
                      value={editNationality}
                      onChange={(v) => setEditNationality(v ?? "")}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Textarea
                      label={t("admin.registrations.applicantNotes")}
                      minRows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.currentTarget.value)}
                      disabled={!canEdit}
                    />
                  </Grid.Col>
                </Grid>

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
                  disabled={!canEdit}
                />

                <Textarea
                  label={t("admin.registrations.internalNotes")}
                  minRows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.currentTarget.value)}
                  disabled={!canEdit}
                />

                <Textarea
                  label={t("admin.registrations.staffReply")}
                  minRows={4}
                  value={reply}
                  onChange={(e) => setReply(e.currentTarget.value)}
                  disabled={!canEdit}
                />

                {!canEdit ? (
                  <Alert color="yellow" title={t("admin.registrations.readOnlyTitle")} variant="light">
                    {t("admin.registrations.readOnlyHint")}
                  </Alert>
                ) : null}
              </Stack>
            </ScrollArea>

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>
                {t("admin.registrations.cancel")}
              </Button>
              {canEdit ? (
                <Button loading={saving} onClick={() => void saveReply()}>
                  {t("admin.registrations.save")}
                </Button>
              ) : null}
            </Group>
          </>
        ) : null}
      </Modal>

      <Modal
        opened={createOpened}
        onClose={closeCreate}
        title={t("admin.registrations.createModalTitle")}
        radius="md"
        size="lg"
        styles={{
          body: { display: "flex", flexDirection: "column", height: "min(75vh, 46rem)" },
        }}
      >
        <ScrollArea type="auto" offsetScrollbars style={{ flex: 1 }}>
          <Stack gap="md" pr="xs">
            {optionsError ? (
              <Alert color="yellow" title={t("admin.layout.appTitle")}>
                {optionsError}
              </Alert>
            ) : null}

            <Grid>
              <Grid.Col span={12}>
                <Select
                  label={t("admin.registrations.createCampusLabel")}
                  placeholder={t("admin.registrations.createCampusPlaceholder")}
                  data={[
                    { value: "madinah", label: t("admin.registrations.createCampusMadinah") },
                    { value: "riyadh", label: t("admin.registrations.createCampusRiyadh") },
                  ]}
                  value={newCampus}
                  onChange={(v) => setNewCampus((v as "" | "madinah" | "riyadh") ?? "")}
                />
                {newCampus === "madinah" || newCampus === "riyadh" ? (
                  <Text size="xs" c="dimmed" mt={6}>
                    <strong>{t("admin.registrations.createPathLabel")}:</strong>{" "}
                    {newCampus === "madinah"
                      ? t("admin.registrations.createPathNationalBilingual")
                      : t("admin.registrations.createPathInternational")}
                  </Text>
                ) : null}
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label={t("admin.registrations.fatherName")}
                  value={newFatherName}
                  required
                  withAsterisk
                  onChange={(e) => setNewFatherName(e.currentTarget.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label={t("admin.registrations.fatherId")}
                  value={newFatherId}
                  onChange={(e) => setNewFatherId(e.currentTarget.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label={t("admin.registrations.parentMobile")}
                  value={newParentMobile}
                  required
                  withAsterisk
                  onChange={(e) => setNewParentMobile(e.currentTarget.value)}
                  style={{ direction: "ltr" }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label={t("admin.registrations.studentName")}
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.currentTarget.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label={t("admin.registrations.studentId")}
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.currentTarget.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={t("admin.registrations.gender")}
                  placeholder={t("admin.common.emDash")}
                  data={genderData}
                  value={newGender}
                  onChange={(v) => setNewGender((v as "" | "male" | "female") ?? "")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={t("admin.registrations.grade")}
                  placeholder={t("admin.common.emDash")}
                  searchable
                  data={gradeData}
                  disabled={optionsLoading || !options}
                  value={newGrade}
                  onChange={(v) => setNewGrade(v ?? "")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Select
                  label={t("admin.registrations.nationality")}
                  placeholder={t("admin.common.emDash")}
                  searchable
                  data={nationalityData}
                  disabled={optionsLoading || !options}
                  value={newNationality}
                  onChange={(v) => setNewNationality(v ?? "")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label={t("admin.registrations.applicantNotes")}
                  minRows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.currentTarget.value)}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label={t("admin.registrations.internalNotes")}
                  minRows={3}
                  value={newInternalNotes}
                  onChange={(e) => setNewInternalNotes(e.currentTarget.value)}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </ScrollArea>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeCreate}>
            {t("admin.registrations.cancel")}
          </Button>
          <Button
            loading={creating}
            disabled={!newFatherName.trim() || !newParentMobile.trim()}
            onClick={() => {
              void (async () => {
                setLoadError(null)
                setCreating(true)
                try {
                  const campusNote =
                    newCampus === "madinah"
                      ? `${t("admin.registrations.createCampusLabel")}: ${t("admin.registrations.createCampusMadinah")}`
                      : newCampus === "riyadh"
                        ? `${t("admin.registrations.createCampusLabel")}: ${t("admin.registrations.createCampusRiyadh")}`
                        : ""
                  const pathNote =
                    newCampus === "madinah"
                      ? `${t("admin.registrations.createPathLabel")}: ${t("admin.registrations.createPathNationalBilingual")}`
                      : newCampus === "riyadh"
                        ? `${t("admin.registrations.createPathLabel")}: ${t("admin.registrations.createPathInternational")}`
                        : ""
                  const mergedNotes = [campusNote, pathNote, newNotes.trim()].filter(Boolean).join("\n")

                  const res = await adminFetch("/api/admin/registrations", {
                    method: "POST",
                    body: JSON.stringify({
                      father_full_name: newFatherName.trim(),
                      parent_mobile: newParentMobile.trim(),
                      father_national_id: newFatherId.trim() || undefined,
                      student_full_name: newStudentName.trim() || undefined,
                      student_national_id: newStudentId.trim() || undefined,
                      gender: newGender || undefined,
                      grade_level: newGrade.trim() || undefined,
                      nationality: newNationality.trim() || undefined,
                      notes: mergedNotes || undefined,
                      internal_notes: newInternalNotes.trim() || undefined,
                    }),
                  })
                  if (!res.ok) {
                    throw new Error("create")
                  }
                  closeCreate()
                  await fetchList()
                } catch {
                  setLoadError(t("admin.registrations.createError"))
                } finally {
                  setCreating(false)
                }
              })()
            }}
          >
            {t("admin.registrations.createSubmit")}
          </Button>
        </Group>
      </Modal>
    </Stack>
  )
}
