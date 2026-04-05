import { AppShell, Burger, Button, Group, NavLink, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconFileText, IconLayoutDashboard, IconLogout, IconSettings, IconStack2, IconUsers } from "@tabler/icons-react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"
import { AdminLanguageSwitcher } from "./AdminLanguageSwitcher"
import { setAdminToken } from "./authToken"

export function AdminLayout() {
  const { t, isRtl } = useAdminI18n()
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
      dir={isRtl ? "rtl" : "ltr"}
    >
      <AppShell.Header px="md" bg="var(--mantine-color-body)" withBorder>
        <Group h="100%" justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label={t("admin.layout.burgerAria")} />
            <Text fw={700} size="lg">
              {t("admin.layout.appTitle")}
            </Text>
          </Group>
          <Group gap="sm" wrap="nowrap">
            <AdminLanguageSwitcher />
            <Button
              variant="light"
              color="red"
              leftSection={<IconLogout size={18} />}
              onClick={() => void logout()}
            >
              {t("admin.layout.logout")}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="gray.0" withBorder>
        <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs" px="sm">
          {t("admin.layout.menu")}
        </Text>
        <NavLink
          component={Link}
          to="/admin"
          label={t("admin.layout.navDashboard")}
          leftSection={<IconLayoutDashboard size={18} />}
          active={pathname === "/admin"}
        />
        <NavLink
          component={Link}
          to="/admin/registrations"
          label={t("admin.layout.navRegistrations")}
          leftSection={<IconUsers size={18} />}
          active={pathname.startsWith("/admin/registrations")}
        />
        <NavLink
          component={Link}
          to="/admin/content-pages"
          label={t("admin.layout.navContentPages")}
          leftSection={<IconFileText size={18} />}
          active={pathname.startsWith("/admin/content-pages")}
        />
        <NavLink
          component={Link}
          to="/admin/cms-pages"
          label={t("admin.layout.navCmsPages")}
          leftSection={<IconStack2 size={18} />}
          active={pathname.startsWith("/admin/cms-pages")}
        />
        <NavLink
          component={Link}
          to="/admin/cms-settings"
          label={t("admin.layout.navCmsSettings")}
          leftSection={<IconSettings size={18} />}
          active={pathname.startsWith("/admin/cms-settings")}
        />
        <NavLink component={Link} to="/" label={t("admin.layout.navPublicSite")} />
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
