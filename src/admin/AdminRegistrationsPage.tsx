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
import { useCallback, useEffect, useState } from "react"
import { useRegistrationOptions } from "../hooks/useRegistrationOptions"
import type {
  Paginated,
  RegistrationSortField,
  RegistrationStatus,
  RegistrationSubmission,
} from "../types/registration"
import { adminFetch } from "./adminApi"

function registrationGenderLabelAr(code: string): string {
  if (code === "male") {
    return "ذكر"
  }
  if (code === "female") {
    return "أنثى"
  }
  return code
}

const statusColors: Record<RegistrationStatus, string> = {
  pending: "yellow",
  reviewed: "blue",
  replied: "green",
}

const statusLabels: Record<RegistrationStatus, string> = {
  pending: "معلق",
  reviewed: "تمت المراجعة",
  replied: "تم الرد",
}

const sortOptions: { value: RegistrationSortField; label: string }[] = [
  { value: "created_at", label: "تاريخ الإرسال" },
  { value: "id", label: "رقم الطلب" },
  { value: "student_full_name", label: "اسم الطالب" },
  { value: "father_full_name", label: "اسم الأب" },
  { value: "grade_level", label: "الصف" },
  { value: "status", label: "الحالة" },
  { value: "parent_mobile", label: "الجوال" },
]

export function AdminRegistrationsPage() {
  const { gradeLabel, nationalityLabel } = useRegistrationOptions()
  const [list, setList] = useState<Paginated<RegistrationSubmission> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<RegistrationSubmission | null>(null)
  const [modalOpened, { open, close }] = useDisclosure(false)
  const [reply, setReply] = useState("")
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
      setLoadError("تعذر تحميل القائمة.")
      setList(null)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, sortField, sortDir, statusFilter, debouncedSearch])

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  function openRow(row: RegistrationSubmission) {
    setSelected(row)
    setReply(row.staff_reply ?? "")
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
        body: JSON.stringify({ staff_reply: reply, status }),
      })
      if (!res.ok) {
        throw new Error("save")
      }
      close()
      await fetchList()
    } catch {
      setLoadError("تعذر حفظ الرد.")
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
      setLoadError("تعذر تصدير الملف. تحقق من الجلسة أو حاول لاحقاً.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>طلبات التسجيل</Title>
        <Text c="dimmed" size="sm" mt={4}>
          تصفية، ترتيب، وبحث في الطلبات. الردود تُحفظ مع حالة الطلب.
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
            label="بحث"
            description="اسم الطالب، الأب، الجوال، الهوية"
            placeholder="ابحث…"
            leftSection={<IconSearch size={16} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            style={{ flex: "1 1 220px", minWidth: 200 }}
          />
          <Select
            label="الحالة"
            placeholder="الكل"
            clearable
            data={[
              { value: "pending", label: statusLabels.pending },
              { value: "reviewed", label: statusLabels.reviewed },
              { value: "replied", label: statusLabels.replied },
            ]}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
            style={{ width: 160 }}
          />
          <Select
            label="ترتيب حسب"
            data={sortOptions}
            value={sortField}
            onChange={(v) => {
              setSortField((v as RegistrationSortField) ?? "created_at")
              setPage(1)
            }}
            style={{ width: 180 }}
          />
          <Select
            label="الاتجاه"
            data={[
              { value: "desc", label: "الأحدث أولاً" },
              { value: "asc", label: "الأقدم أولاً" },
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
            label="حجم الصفحة"
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
            تصدير Excel
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
                {totalRecords === 0 ? "لا نتائج" : `عرض ${list?.data.length ?? 0} من ${totalRecords} طلباً`}
              </Text>
            </Box>
            <ScrollArea h="min(70vh, 56rem)" type="auto">
              <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>#</Table.Th>
                    <Table.Th>اسم الطالب</Table.Th>
                    <Table.Th>رقم الجوال</Table.Th>
                    <Table.Th>الصف</Table.Th>
                    <Table.Th>الحالة</Table.Th>
                    <Table.Th>التاريخ</Table.Th>
                    <Table.Th w={120} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {list?.data.map((row) => (
                    <Table.Tr key={row.id}>
                      <Table.Td>{row.id}</Table.Td>
                      <Table.Td>{row.student_full_name}</Table.Td>
                      <Table.Td style={{ direction: "ltr", textAlign: "right" }}>{row.parent_mobile}</Table.Td>
                      <Table.Td>{gradeLabel(row.grade_level, "ar")}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={statusColors[row.status]} size="sm">
                          {statusLabels[row.status]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{new Date(row.created_at).toLocaleString("ar-SA")}</Table.Td>
                      <Table.Td>
                        <Button variant="light" size="xs" onClick={() => openRow(row)}>
                          تفاصيل
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

      <Modal opened={modalOpened} onClose={close} title={selected ? `طلب #${selected.id}` : ""} size="lg" radius="md">
        {selected ? (
          <Stack gap="md">
            <Text size="sm">
              <strong>اسم الاب الرباعي:</strong> {selected.father_full_name}
            </Text>
            <Text size="sm">
              <strong>رقم الهوية الاب:</strong> {selected.father_national_id}
            </Text>
            <Text size="sm">
              <strong>اسم الطالب الرباعي:</strong> {selected.student_full_name}
            </Text>
            <Text size="sm">
              <strong>رقم هوية الطالب:</strong> {selected.student_national_id}
            </Text>
            <Text size="sm">
              <strong>رقم جوال الاب/ الام:</strong> {selected.parent_mobile}
            </Text>
            <Text size="sm">
              <strong>الجنس:</strong> {registrationGenderLabelAr(selected.gender)} ({selected.gender})
            </Text>
            <Text size="sm">
              <strong>الصف الدراسي:</strong> {gradeLabel(selected.grade_level, "ar")}{" "}
              <Text span size="xs" c="dimmed">
                ({selected.grade_level})
              </Text>
            </Text>
            <Text size="sm">
              <strong>الجنسية:</strong> {nationalityLabel(selected.nationality, "ar")}{" "}
              <Text span size="xs" c="dimmed">
                ({selected.nationality})
              </Text>
            </Text>
            {selected.notes ? (
              <Text size="sm">
                <strong>ملاحظات:</strong> {selected.notes}
              </Text>
            ) : null}

            <Select
              label="حالة الطلب"
              data={[
                { value: "pending", label: statusLabels.pending },
                { value: "reviewed", label: statusLabels.reviewed },
                { value: "replied", label: statusLabels.replied },
              ]}
              value={status}
              onChange={(v) => setStatus((v as RegistrationStatus) ?? "pending")}
            />

            <Textarea
              label="رد الإدارة (يُحفظ ويُحدّث تاريخ الرد عند وجود نص)"
              minRows={4}
              value={reply}
              onChange={(e) => setReply(e.currentTarget.value)}
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                إلغاء
              </Button>
              <Button loading={saving} onClick={() => void saveReply()}>
                حفظ
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </Stack>
  )
}
