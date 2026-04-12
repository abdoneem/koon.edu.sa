import { AppShell, Burger, Button, Group, NavLink, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconArticle,
  IconCalendarEvent,
  IconFileText,
  IconMail,
  IconLayoutDashboard,
  IconLogout,
  IconNews,
  IconSettings,
  IconStack2,
  IconShieldLock,
  IconUserCog,
  IconUsers,
} from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { adminFetch } from "./adminApi"
import { ADMIN_PERMISSIONS } from "./adminPermissions"
import { useAdminI18n } from "./adminI18n"
import { AdminLanguageSwitcher } from "./AdminLanguageSwitcher"
import { getAdminSession, hasAdminPermission, setAdminSession, setAdminToken } from "./authToken"

export function AdminLayout() {
  const { t, isRtl } = useAdminI18n()
  const [opened, { toggle }] = useDisclosure()
  const [, bump] = useState(0)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const session = getAdminSession()
    if (!session?.token) {
      return
    }
    let cancelled = false
    ;(async () => {
      const res = await adminFetch("/api/user")
      if (!res.ok || cancelled) {
        return
      }
      const u = (await res.json()) as { roles?: string[]; permissions?: string[] }
      setAdminSession({
        token: session.token,
        roles: u.roles ?? [],
        permissions: u.permissions ?? [],
      })
      bump((n) => n + 1)
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
        {hasAdminPermission(ADMIN_PERMISSIONS.dashboardView) ? (
          <NavLink
            component={Link}
            to="/admin"
            label={t("admin.layout.navDashboard")}
            leftSection={<IconLayoutDashboard size={18} />}
            active={pathname === "/admin"}
          />
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.registrationsView) ? (
          <NavLink
            component={Link}
            to="/admin/registrations"
            label={t("admin.layout.navRegistrations")}
            leftSection={<IconUsers size={18} />}
            active={pathname.startsWith("/admin/registrations")}
          />
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.bookTourView) ? (
          <NavLink
            component={Link}
            to="/admin/book-tour-requests"
            label={t("admin.layout.navBookTour")}
            leftSection={<IconCalendarEvent size={18} />}
            active={pathname.startsWith("/admin/book-tour-requests")}
          />
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.contactMessagesView) ? (
          <NavLink
            component={Link}
            to="/admin/contact-messages"
            label={t("admin.layout.navContactMessages")}
            leftSection={<IconMail size={18} />}
            active={pathname.startsWith("/admin/contact-messages")}
          />
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.contentPagesManage) ? (
          <NavLink
            component={Link}
            to="/admin/content-pages"
            label={t("admin.layout.navContentPages")}
            leftSection={<IconFileText size={18} />}
            active={pathname.startsWith("/admin/content-pages")}
          />
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.contentPagesManage) ? (
          <>
            <NavLink
              component={Link}
              to="/admin/news"
              label={t("admin.layout.navNews")}
              leftSection={<IconNews size={18} />}
              active={pathname.startsWith("/admin/news")}
            />
            <NavLink
              component={Link}
              to="/admin/articles"
              label={t("admin.layout.navArticles")}
              leftSection={<IconArticle size={18} />}
              active={pathname.startsWith("/admin/articles")}
            />
          </>
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.cmsManage) ? (
          <NavLink
            component={Link}
            to="/admin/cms-pages"
            label={t("admin.layout.navCmsPages")}
            leftSection={<IconStack2 size={18} />}
            active={pathname.startsWith("/admin/cms-pages")}
          />
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.cmsSettingsManage) ? (
          <NavLink
            component={Link}
            to="/admin/cms-settings"
            label={t("admin.layout.navCmsSettings")}
            leftSection={<IconSettings size={18} />}
            active={pathname.startsWith("/admin/cms-settings")}
          />
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.usersManage) ? (
          <>
            <NavLink
              component={Link}
              to="/admin/users"
              label={t("admin.layout.navUsers")}
              leftSection={<IconUserCog size={18} />}
              active={pathname === "/admin/users"}
            />
            <NavLink
              component={Link}
              to="/admin/roles"
              label={t("admin.layout.navRoles")}
              leftSection={<IconShieldLock size={18} />}
              active={pathname.startsWith("/admin/roles")}
            />
          </>
        ) : null}
        <NavLink component={Link} to="/" label={t("admin.layout.navPublicSite")} />
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
