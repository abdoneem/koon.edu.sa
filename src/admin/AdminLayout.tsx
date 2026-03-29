import { AppShell, Burger, Button, Group, NavLink, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconFileText, IconLayoutDashboard, IconLogout, IconUsers } from "@tabler/icons-react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { adminFetch } from "./adminApi"
import { setAdminToken } from "./authToken"

export function AdminLayout() {
  const [opened, { toggle }] = useDisclosure()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  async function logout() {
    try {
      await adminFetch("/api/auth/logout", { method: "POST" })
    } catch {
      /* ignore */
    }
    setAdminToken(null)
    navigate("/admin/login", { replace: true })
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      dir="rtl"
    >
      <AppShell.Header px="md" bg="var(--mantine-color-body)" withBorder>
        <Group h="100%" justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="القائمة" />
            <Text fw={700} size="lg">
              كون — لوحة الإدارة
            </Text>
          </Group>
          <Button
            variant="light"
            color="red"
            leftSection={<IconLogout size={18} />}
            onClick={() => void logout()}
          >
            خروج
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="gray.0" withBorder>
        <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs" px="sm">
          القائمة
        </Text>
        <NavLink
          component={Link}
          to="/admin"
          label="لوحة التحكم"
          leftSection={<IconLayoutDashboard size={18} />}
          active={pathname === "/admin"}
        />
        <NavLink
          component={Link}
          to="/admin/registrations"
          label="طلبات التسجيل"
          leftSection={<IconUsers size={18} />}
          active={pathname.startsWith("/admin/registrations")}
        />
        <NavLink
          component={Link}
          to="/admin/content-pages"
          label="صفحات المحتوى"
          leftSection={<IconFileText size={18} />}
          active={pathname.startsWith("/admin/content-pages")}
        />
        <NavLink component={Link} to="/" label="الموقع العام" />
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
