import { Alert, Button, Group, Modal, MultiSelect, Paper, Stack, Table, Text, TextInput, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useCallback, useEffect, useState } from "react"
import { adminFetch } from "./adminApi"
import { formatApiError, formatUserApiError } from "./apiErrorMessage"
import { useAdminI18n } from "./adminI18n"

type RoleRow = {
  id: number
  name: string
  permissions: string[]
  users_count: number
}

type PermRow = {
  id: number
  name: string
}

export function AdminRolesPage() {
  const { t, isRtl } = useAdminI18n()
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [permissions, setPermissions] = useState<PermRow[]>([])
  const [permOptions, setPermOptions] = useState<{ value: string; label: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)

  const [createRoleOpen, createRoleHandlers] = useDisclosure(false)
  const [newRoleName, setNewRoleName] = useState("")

  const [renameOpen, renameHandlers] = useDisclosure(false)
  const [renaming, setRenaming] = useState<RoleRow | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const [permOpen, permHandlers] = useDisclosure(false)
  const [permRole, setPermRole] = useState<RoleRow | null>(null)
  const [permDraft, setPermDraft] = useState<string[]>([])

  const [newPermOpen, newPermHandlers] = useDisclosure(false)
  const [newPermName, setNewPermName] = useState("")

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const [rRes, pRes] = await Promise.all([adminFetch("/api/admin/roles"), adminFetch("/api/admin/permissions")])
      if (!rRes.ok || !pRes.ok) {
        throw new Error("load")
      }
      const rData = (await rRes.json()) as { data: RoleRow[] }
      const pData = (await pRes.json()) as { data: PermRow[] }
      setRoles(rData.data)
      setPermissions(pData.data)
      setPermOptions(pData.data.map((p) => ({ value: p.name, label: p.name })))
    } catch {
      setError(t("admin.roles.loadError"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  async function createRole() {
    setPending(true)
    setError(null)
    try {
      const res = await adminFetch("/api/admin/roles", {
        method: "POST",
        body: JSON.stringify({ name: newRoleName.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(formatApiError(data, t("admin.roles.saveError")))
        return
      }
      createRoleHandlers.close()
      setNewRoleName("")
      await load()
    } catch {
      setError(t("admin.roles.saveError"))
    } finally {
      setPending(false)
    }
  }

  async function saveRename() {
    if (!renaming) {
      return
    }
    setPending(true)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/roles/${renaming.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: renameValue.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(formatApiError(data, t("admin.roles.saveError")))
        return
      }
      renameHandlers.close()
      setRenaming(null)
      await load()
    } catch {
      setError(t("admin.roles.saveError"))
    } finally {
      setPending(false)
    }
  }

  async function savePermissions() {
    if (!permRole) {
      return
    }
    setPending(true)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/roles/${permRole.id}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissions: permDraft }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(formatUserApiError(data, t("admin.roles.saveError"), t))
        return
      }
      permHandlers.close()
      setPermRole(null)
      await load()
    } catch {
      setError(t("admin.roles.saveError"))
    } finally {
      setPending(false)
    }
  }

  async function deleteRole(row: RoleRow) {
    if (!window.confirm(t("admin.roles.confirmDeleteRole"))) {
      return
    }
    setPending(true)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/roles/${row.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(formatApiError(data, t("admin.roles.deleteError")))
        return
      }
      await load()
    } catch {
      setError(t("admin.roles.deleteError"))
    } finally {
      setPending(false)
    }
  }

  async function createPermission() {
    setPending(true)
    setError(null)
    try {
      const res = await adminFetch("/api/admin/permissions", {
        method: "POST",
        body: JSON.stringify({ name: newPermName.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(formatApiError(data, t("admin.roles.permSaveError")))
        return
      }
      newPermHandlers.close()
      setNewPermName("")
      await load()
    } catch {
      setError(t("admin.roles.permSaveError"))
    } finally {
      setPending(false)
    }
  }

  async function deletePermission(row: PermRow) {
    if (!window.confirm(t("admin.roles.confirmDeletePerm"))) {
      return
    }
    setPending(true)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/permissions/${row.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(formatApiError(data, t("admin.roles.permDeleteError")))
        return
      }
      await load()
    } catch {
      setError(t("admin.roles.permDeleteError"))
    } finally {
      setPending(false)
    }
  }

  function openRename(row: RoleRow) {
    setRenaming(row)
    setRenameValue(row.name)
    renameHandlers.open()
  }

  function openPermissions(row: RoleRow) {
    setPermRole(row)
    setPermDraft([...row.permissions])
    permHandlers.open()
  }

  return (
    <Stack gap="md" dir={isRtl ? "rtl" : "ltr"}>
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <div>
          <Title order={2}>{t("admin.roles.title")}</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {t("admin.roles.subtitle")}
          </Text>
        </div>
        <Group>
          <Button variant="light" onClick={newPermHandlers.open}>
            {t("admin.roles.addPermission")}
          </Button>
          <Button onClick={createRoleHandlers.open}>{t("admin.roles.addRole")}</Button>
        </Group>
      </Group>

      {error ? (
        <Alert color="red" title={t("admin.roles.alertTitle")} onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      ) : null}

      <Paper withBorder p="md" radius="md">
        <Title order={5} mb="sm">
          {t("admin.roles.rolesSection")}
        </Title>
        {loading ? (
          <Text c="dimmed">{t("admin.roles.loading")}</Text>
        ) : (
          <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("admin.roles.colRole")}</Table.Th>
                <Table.Th w={100}>{t("admin.roles.colUsers")}</Table.Th>
                <Table.Th>{t("admin.roles.colPermissions")}</Table.Th>
                <Table.Th w={320} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {roles.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td>
                    <Text fw={500}>{r.name}</Text>
                  </Table.Td>
                  <Table.Td>{r.users_count}</Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={2} maw={480}>
                      {r.permissions.length ? r.permissions.join(", ") : "—"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group justify="flex-end" gap="xs" wrap="nowrap">
                      <Button size="xs" variant="light" onClick={() => openPermissions(r)}>
                        {t("admin.roles.editPermissions")}
                      </Button>
                      <Button size="xs" variant="default" onClick={() => openRename(r)}>
                        {t("admin.roles.rename")}
                      </Button>
                      <Button size="xs" color="red" variant="light" disabled={pending} onClick={() => void deleteRole(r)}>
                        {t("admin.roles.delete")}
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Title order={5} mb="sm">
          {t("admin.roles.permSection")}
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          {t("admin.roles.permSectionHint")}
        </Text>
        {loading ? null : (
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("admin.roles.colPermName")}</Table.Th>
                <Table.Th w={100} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {permissions.map((p) => (
                <Table.Tr key={p.id}>
                  <Table.Td>
                    <Text size="sm" ff="monospace">
                      {p.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Button size="compact-xs" color="red" variant="light" disabled={pending} onClick={() => void deletePermission(p)}>
                      {t("admin.roles.delete")}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal opened={createRoleOpen} onClose={createRoleHandlers.close} title={t("admin.roles.modalCreateRole")} radius="md">
        <Stack gap="sm">
          <TextInput
            label={t("admin.roles.roleName")}
            description={t("admin.roles.roleNameHint")}
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={createRoleHandlers.close}>
              {t("admin.roles.cancel")}
            </Button>
            <Button loading={pending} onClick={() => void createRole()} disabled={!/^[a-z0-9_]+$/.test(newRoleName.trim())}>
              {t("admin.roles.create")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={renameOpen} onClose={renameHandlers.close} title={t("admin.roles.modalRename")} radius="md">
        <Stack gap="sm">
          <TextInput
            label={t("admin.roles.roleName")}
            description={t("admin.roles.roleNameHint")}
            value={renameValue}
            onChange={(e) => setRenameValue(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={renameHandlers.close}>
              {t("admin.roles.cancel")}
            </Button>
            <Button loading={pending} onClick={() => void saveRename()} disabled={!/^[a-z0-9_]+$/.test(renameValue.trim())}>
              {t("admin.roles.save")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={permOpen} onClose={permHandlers.close} title={t("admin.roles.modalPermissions")} size="lg" radius="md">
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            {permRole?.name}
          </Text>
          <MultiSelect
            label={t("admin.roles.assignPermissions")}
            data={permOptions}
            value={permDraft}
            onChange={setPermDraft}
            searchable
            clearable
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={permHandlers.close}>
              {t("admin.roles.cancel")}
            </Button>
            <Button loading={pending} onClick={() => void savePermissions()}>
              {t("admin.roles.save")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={newPermOpen} onClose={newPermHandlers.close} title={t("admin.roles.modalCreatePerm")} radius="md">
        <Stack gap="sm">
          <TextInput
            label={t("admin.roles.permName")}
            description={t("admin.roles.permNameHint")}
            value={newPermName}
            onChange={(e) => setNewPermName(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={newPermHandlers.close}>
              {t("admin.roles.cancel")}
            </Button>
            <Button loading={pending} onClick={() => void createPermission()} disabled={!/^[a-z0-9_]+$/.test(newPermName.trim())}>
              {t("admin.roles.create")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
