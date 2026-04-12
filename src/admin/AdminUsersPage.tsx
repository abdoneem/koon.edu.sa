import { Alert, Button, Group, Modal, MultiSelect, Paper, PasswordInput, Stack, Table, Text, TextInput, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useCallback, useEffect, useState } from "react"
import { adminFetch } from "./adminApi"
import { formatApiError, formatUserApiError } from "./apiErrorMessage"
import { useAdminI18n } from "./adminI18n"

type UserRow = {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export function AdminUsersPage() {
  const { t, isRtl } = useAdminI18n()
  const [rows, setRows] = useState<UserRow[]>([])
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [draftRoles, setDraftRoles] = useState<Record<number, string[]>>({})

  const [createOpen, createHandlers] = useDisclosure(false)
  const [editOpen, editHandlers] = useDisclosure(false)
  const [editing, setEditing] = useState<UserRow | null>(null)

  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRoles, setNewRoles] = useState<string[]>([])

  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [editRoles, setEditRoles] = useState<string[]>([])

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([adminFetch("/api/admin/users"), adminFetch("/api/admin/roles")])
      if (!usersRes.ok || !rolesRes.ok) {
        throw new Error("load")
      }
      const usersData = (await usersRes.json()) as { data: UserRow[] }
      const rolesData = (await rolesRes.json()) as { data: { name: string }[] }
      setRows(usersData.data)
      setRoleOptions(rolesData.data.map((r) => ({ value: r.name, label: r.name })))
      const draft: Record<number, string[]> = {}
      for (const r of usersData.data) {
        draft[r.id] = [...r.roles]
      }
      setDraftRoles(draft)
    } catch {
      setError(t("admin.users.loadError"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setNewName("")
    setNewEmail("")
    setNewPassword("")
    setNewRoles([])
    createHandlers.open()
  }

  function openEdit(row: UserRow) {
    setEditing(row)
    setEditName(row.name)
    setEditEmail(row.email)
    setEditPassword("")
    setEditRoles([...row.roles])
    editHandlers.open()
  }

  async function createUser() {
    setSavingId(-1)
    setError(null)
    try {
      const res = await adminFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          roles: newRoles,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(formatApiError(data, t("admin.users.saveError")))
        return
      }
      createHandlers.close()
      await load()
    } catch {
      setError(t("admin.users.saveError"))
    } finally {
      setSavingId(null)
    }
  }

  async function saveEdit() {
    if (!editing) {
      return
    }
    setSavingId(editing.id)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        name: editName,
        email: editEmail,
        roles: editRoles,
      }
      if (editPassword.trim() !== "") {
        body.password = editPassword
      }
      const res = await adminFetch(`/api/admin/users/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(formatUserApiError(data, t("admin.users.saveError"), t))
        if (editing) {
          setEditRoles([...editing.roles])
        }
        return
      }
      const updated = data as UserRow
      setRows((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)))
      setDraftRoles((d) => ({ ...d, [updated.id]: [...updated.roles] }))
      editHandlers.close()
      setEditing(null)
    } catch {
      setError(t("admin.users.saveError"))
    } finally {
      setSavingId(null)
    }
  }

  async function saveRoles(userId: number) {
    const roles = draftRoles[userId] ?? []
    setSavingId(userId)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ roles }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(formatUserApiError(data, t("admin.users.saveError"), t))
        const row = rows.find((r) => r.id === userId)
        if (row) {
          setDraftRoles((d) => ({ ...d, [userId]: [...row.roles] }))
        }
        return
      }
      const updated = data as UserRow
      setRows((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)))
      setDraftRoles((d) => ({ ...d, [updated.id]: [...updated.roles] }))
    } catch {
      setError(t("admin.users.saveError"))
    } finally {
      setSavingId(null)
    }
  }

  async function removeUser(userId: number) {
    if (!window.confirm(t("admin.users.confirmDelete"))) {
      return
    }
    setSavingId(userId)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(formatUserApiError(data, t("admin.users.deleteError"), t))
        return
      }
      await load()
    } catch {
      setError(t("admin.users.deleteError"))
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Stack gap="md" dir={isRtl ? "rtl" : "ltr"}>
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <div>
          <Title order={2}>{t("admin.users.title")}</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {t("admin.users.subtitle")}
          </Text>
        </div>
        <Button onClick={openCreate}>{t("admin.users.addUser")}</Button>
      </Group>

      {error ? (
        <Alert color="red" title={t("admin.users.alertTitle")} onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      ) : null}

      <Paper withBorder p="md" radius="md">
        {loading ? (
          <Text c="dimmed">{t("admin.users.loading")}</Text>
        ) : (
          <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("admin.users.colName")}</Table.Th>
                <Table.Th>{t("admin.users.colEmail")}</Table.Th>
                <Table.Th>{t("admin.users.colRoles")}</Table.Th>
                <Table.Th w={280} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td>{r.name}</Table.Td>
                  <Table.Td>{r.email}</Table.Td>
                  <Table.Td>
                    <MultiSelect
                      data={roleOptions}
                      value={draftRoles[r.id] ?? r.roles}
                      onChange={(v) => setDraftRoles((d) => ({ ...d, [r.id]: v }))}
                      searchable
                      clearable
                      w="100%"
                      maw={420}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group justify="flex-end" gap="xs" wrap="nowrap">
                      <Button
                        size="xs"
                        loading={savingId === r.id}
                        onClick={() => void saveRoles(r.id)}
                        disabled={JSON.stringify([...(draftRoles[r.id] ?? []).sort()]) === JSON.stringify([...r.roles].sort())}
                      >
                        {t("admin.users.save")}
                      </Button>
                      <Button size="xs" variant="light" onClick={() => openEdit(r)}>
                        {t("admin.users.edit")}
                      </Button>
                      <Button size="xs" color="red" variant="light" loading={savingId === r.id} onClick={() => void removeUser(r.id)}>
                        {t("admin.users.delete")}
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal opened={createOpen} onClose={createHandlers.close} title={t("admin.users.modalCreateTitle")} radius="md">
        <Stack gap="sm">
          <TextInput label={t("admin.users.colName")} required value={newName} onChange={(e) => setNewName(e.currentTarget.value)} />
          <TextInput label={t("admin.users.colEmail")} type="email" required value={newEmail} onChange={(e) => setNewEmail(e.currentTarget.value)} />
          <PasswordInput label={t("admin.users.password")} required value={newPassword} onChange={(e) => setNewPassword(e.currentTarget.value)} />
          <MultiSelect label={t("admin.users.colRoles")} data={roleOptions} value={newRoles} onChange={setNewRoles} searchable clearable />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={createHandlers.close}>
              {t("admin.users.cancel")}
            </Button>
            <Button loading={savingId === -1} onClick={() => void createUser()} disabled={!newName.trim() || !newEmail.trim() || newPassword.length < 8}>
              {t("admin.users.create")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={editOpen} onClose={editHandlers.close} title={t("admin.users.modalEditTitle")} radius="md">
        <Stack gap="sm">
          <TextInput label={t("admin.users.colName")} value={editName} onChange={(e) => setEditName(e.currentTarget.value)} />
          <TextInput label={t("admin.users.colEmail")} type="email" value={editEmail} onChange={(e) => setEditEmail(e.currentTarget.value)} />
          <PasswordInput
            label={t("admin.users.newPasswordOptional")}
            description={t("admin.users.newPasswordHint")}
            value={editPassword}
            onChange={(e) => setEditPassword(e.currentTarget.value)}
          />
          <MultiSelect label={t("admin.users.colRoles")} data={roleOptions} value={editRoles} onChange={setEditRoles} searchable clearable />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={editHandlers.close}>
              {t("admin.users.cancel")}
            </Button>
            <Button loading={editing !== null && savingId === editing.id} onClick={() => void saveEdit()}>
              {t("admin.users.saveChanges")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
