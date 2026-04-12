import { Anchor, Box, Grid, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core"
import {
  IconArticle,
  IconCalendarEvent,
  IconCheck,
  IconEye,
  IconFileText,
  IconMail,
  IconNews,
  IconPhoto,
  IconSettings,
  IconStack2,
  IconUsers,
} from "@tabler/icons-react"
import { type ReactNode, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import type { RegistrationStats } from "../types/registration"
import { adminFetch } from "./adminApi"
import { ADMIN_PERMISSIONS } from "./adminPermissions"
import { useAdminI18n } from "./adminI18n"
import { hasAdminPermission } from "./authToken"

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
  barFraction,
  localeTag,
}: {
  label: string
  value: number
  icon: ReactNode
  color: string
  sub?: string
  barFraction?: number
  localeTag: string
}) {
  const pct = barFraction != null ? Math.round(Math.min(100, Math.max(0, barFraction * 100))) : null
  return (
    <Paper withBorder shadow="sm" p="lg" radius="md" pos="relative" style={{ overflow: "hidden" }}>
      <Box
        pos="absolute"
        top={0}
        w={4}
        h="100%"
        bg={`var(--mantine-color-${color}-filled)`}
        style={{ insetInlineStart: 0 }}
      />
      <Group justify="space-between" align="flex-start" wrap="nowrap" pl="xs">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={6}>
            {label}
          </Text>
          <Title order={2} lh={1.2}>
            {value.toLocaleString(localeTag)}
          </Title>
          {sub ? (
            <Text size="xs" c="dimmed" mt={6}>
              {sub}
            </Text>
          ) : null}
          {pct != null ? (
            <Box mt="md" h={4} bg="gray.2" style={{ borderRadius: 2 }}>
              <Box h={4} w={`${pct}%`} bg={`var(--mantine-color-${color}-4)`} style={{ borderRadius: 2 }} />
            </Box>
          ) : null}
        </div>
        <ThemeIcon size={52} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  )
}

export type DashboardSummary = {
  registrations: { total: number; pending: number; by_status: Record<string, number> }
  cms: { pages: number; sections: number; items: number }
  content_pages: number
  users: number
  contact_messages?: { total: number; pending: number; replied: number }
  book_tour_requests?: { total: number; pending: number; replied: number }
}

export function AdminDashboard() {
  const { t, localeTag } = useAdminI18n()
  const [stats, setStats] = useState<RegistrationStats | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (hasAdminPermission(ADMIN_PERMISSIONS.dashboardView)) {
          const sres = await adminFetch("/api/admin/dashboard/summary")
          if (sres.ok) {
            const sdata = (await sres.json()) as DashboardSummary
            if (!cancelled) {
              setSummary(sdata)
            }
          }
        }
        if (!hasAdminPermission(ADMIN_PERMISSIONS.registrationsView)) {
          return
        }
        const res = await adminFetch("/api/admin/registrations/stats")
        if (!res.ok) {
          throw new Error("stats")
        }
        const data = (await res.json()) as RegistrationStats
        if (!cancelled) {
          setStats(data)
        }
      } catch {
        if (!cancelled) {
          setError(t("admin.dashboard.statsLoadError"))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [t])

  const reviewedReplied = stats ? stats.reviewed + stats.replied : 0
  const pipelineHint =
    stats && stats.total > 0
      ? t("admin.dashboard.pipelineHint", { pct: Math.round((stats.pending / stats.total) * 100) })
      : undefined

  return (
    <Stack gap="xl">
      <div>
        <Title order={2}>{t("admin.dashboard.title")}</Title>
        <Text c="dimmed" size="sm" mt={4}>
          {t("admin.dashboard.subtitle")}
        </Text>
      </div>

      {summary ? (
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <StatCard
              label={t("admin.dashboard.summaryCmsPages")}
              value={summary.cms.pages}
              color="koon"
              icon={<IconStack2 size={26} />}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <StatCard
              label={t("admin.dashboard.summarySections")}
              value={summary.cms.sections}
              color="blue"
              icon={<IconPhoto size={26} />}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <StatCard
              label={t("admin.dashboard.summaryContentPages")}
              value={summary.content_pages}
              color="gray"
              icon={<IconFileText size={26} />}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <StatCard
              label={t("admin.dashboard.summaryUsers")}
              value={summary.users}
              color="teal"
              icon={<IconUsers size={26} />}
              localeTag={localeTag}
            />
          </Grid.Col>
        </Grid>
      ) : null}

      {summary?.contact_messages ? (
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.summaryContactTotal")}
              value={summary.contact_messages.total}
              color="violet"
              icon={<IconMail size={26} />}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.summaryContactPending")}
              value={summary.contact_messages.pending}
              color="yellow"
              icon={<IconEye size={26} />}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.summaryContactReplied")}
              value={summary.contact_messages.replied}
              color="teal"
              icon={<IconCheck size={26} />}
              localeTag={localeTag}
            />
          </Grid.Col>
        </Grid>
      ) : null}

      {summary?.book_tour_requests ? (
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.summaryTourTotal")}
              value={summary.book_tour_requests.total}
              color="indigo"
              icon={<IconCalendarEvent size={26} />}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.summaryTourPending")}
              value={summary.book_tour_requests.pending}
              color="yellow"
              icon={<IconEye size={26} />}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.summaryTourReplied")}
              value={summary.book_tour_requests.replied}
              color="teal"
              icon={<IconCheck size={26} />}
              localeTag={localeTag}
            />
          </Grid.Col>
        </Grid>
      ) : null}

      {error ? (
        <Paper withBorder p="sm" radius="md" bg="red.0" c="red.8">
          {error}
        </Paper>
      ) : !stats && hasAdminPermission(ADMIN_PERMISSIONS.registrationsView) ? (
        <Text c="dimmed">{t("admin.dashboard.loading")}</Text>
      ) : stats ? (
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.statTotal")}
              value={stats.total}
              color="koon"
              icon={<IconUsers size={26} />}
              sub={t("admin.dashboard.statTotalSub")}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.statPending")}
              value={stats.pending}
              color="yellow"
              icon={<IconEye size={26} />}
              sub={pipelineHint}
              barFraction={stats.total > 0 ? stats.pending / stats.total : 0}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.statReviewed")}
              value={stats.reviewed}
              color="blue"
              icon={<IconCalendarEvent size={26} />}
              barFraction={stats.total > 0 ? stats.reviewed / stats.total : 0}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.statReplied")}
              value={stats.replied}
              color="teal"
              icon={<IconCheck size={26} />}
              sub={
                reviewedReplied > 0 ? t("admin.dashboard.statRepliedSub", { count: reviewedReplied }) : undefined
              }
              barFraction={stats.total > 0 ? stats.replied / stats.total : 0}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.statLast7")}
              value={stats.last_7_days}
              color="koon"
              icon={<IconCalendarEvent size={26} />}
              barFraction={stats.total > 0 ? stats.last_7_days / stats.total : 0}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.statStatusNew")}
              value={stats.new ?? 0}
              color="gray"
              icon={<IconUsers size={26} />}
              barFraction={stats.total > 0 ? (stats.new ?? 0) / stats.total : 0}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.statStatusContacted")}
              value={stats.contacted ?? 0}
              color="cyan"
              icon={<IconCheck size={26} />}
              barFraction={stats.total > 0 ? (stats.contacted ?? 0) / stats.total : 0}
              localeTag={localeTag}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label={t("admin.dashboard.statStatusClosed")}
              value={stats.closed ?? 0}
              color="red"
              icon={<IconEye size={26} />}
              barFraction={stats.total > 0 ? (stats.closed ?? 0) / stats.total : 0}
              localeTag={localeTag}
            />
          </Grid.Col>
        </Grid>
      ) : null}

      <Grid gutter="md">
        {hasAdminPermission(ADMIN_PERMISSIONS.registrationsView) ? (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder shadow="sm" p="lg" radius="md">
              <Group mb="md">
                <ThemeIcon variant="light" color="koon" radius="md">
                  <IconUsers size={20} />
                </ThemeIcon>
                <Text fw={700}>{t("admin.dashboard.cardRegTitle")}</Text>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                {t("admin.dashboard.cardRegDesc")}
              </Text>
              <Anchor component={Link} to="/admin/registrations" fw={600}>
                {t("admin.dashboard.cardRegLink")}
              </Anchor>
            </Paper>
          </Grid.Col>
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.bookTourView) ? (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder shadow="sm" p="lg" radius="md">
              <Group mb="md">
                <ThemeIcon variant="light" color="indigo" radius="md">
                  <IconCalendarEvent size={20} />
                </ThemeIcon>
                <Text fw={700}>{t("admin.dashboard.cardBookTourTitle")}</Text>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                {t("admin.dashboard.cardBookTourDesc")}
              </Text>
              <Anchor component={Link} to="/admin/book-tour-requests" fw={600}>
                {t("admin.dashboard.cardBookTourLink")}
              </Anchor>
            </Paper>
          </Grid.Col>
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.contactMessagesView) ? (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder shadow="sm" p="lg" radius="md">
              <Group mb="md">
                <ThemeIcon variant="light" color="violet" radius="md">
                  <IconMail size={20} />
                </ThemeIcon>
                <Text fw={700}>{t("admin.dashboard.cardContactTitle")}</Text>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                {t("admin.dashboard.cardContactDesc")}
              </Text>
              <Anchor component={Link} to="/admin/contact-messages" fw={600}>
                {t("admin.dashboard.cardContactLink")}
              </Anchor>
            </Paper>
          </Grid.Col>
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.contentPagesManage) ? (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder shadow="sm" p="lg" radius="md">
              <Group mb="md">
                <ThemeIcon variant="light" color="gray" radius="md">
                  <IconFileText size={20} />
                </ThemeIcon>
                <Text fw={700}>{t("admin.dashboard.cardContentTitle")}</Text>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                {t("admin.dashboard.cardContentDesc")}
              </Text>
              <Anchor component={Link} to="/admin/content-pages" fw={600}>
                {t("admin.dashboard.cardContentLink")}
              </Anchor>
            </Paper>
          </Grid.Col>
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.contentPagesManage) ? (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder shadow="sm" p="lg" radius="md">
              <Group mb="md">
                <ThemeIcon variant="light" color="koon" radius="md">
                  <IconNews size={20} />
                </ThemeIcon>
                <Text fw={700}>{t("admin.dashboard.cardNewsTitle")}</Text>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                {t("admin.dashboard.cardNewsDesc")}
              </Text>
              <Anchor component={Link} to="/admin/news" fw={600}>
                {t("admin.dashboard.cardNewsLink")}
              </Anchor>
            </Paper>
          </Grid.Col>
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.contentPagesManage) ? (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder shadow="sm" p="lg" radius="md">
              <Group mb="md">
                <ThemeIcon variant="light" color="gray" radius="md">
                  <IconArticle size={20} />
                </ThemeIcon>
                <Text fw={700}>{t("admin.dashboard.cardArticlesTitle")}</Text>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                {t("admin.dashboard.cardArticlesDesc")}
              </Text>
              <Anchor component={Link} to="/admin/articles" fw={600}>
                {t("admin.dashboard.cardArticlesLink")}
              </Anchor>
            </Paper>
          </Grid.Col>
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.cmsManage) ? (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder shadow="sm" p="lg" radius="md">
              <Group mb="md">
                <ThemeIcon variant="light" color="koon" radius="md">
                  <IconStack2 size={20} />
                </ThemeIcon>
                <Text fw={700}>{t("admin.dashboard.cardCmsTitle")}</Text>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                {t("admin.dashboard.cardCmsDesc")}
              </Text>
              <Anchor component={Link} to="/admin/cms-pages" fw={600}>
                {t("admin.dashboard.cardCmsLink")}
              </Anchor>
            </Paper>
          </Grid.Col>
        ) : null}
        {hasAdminPermission(ADMIN_PERMISSIONS.cmsSettingsManage) ? (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder shadow="sm" p="lg" radius="md">
              <Group mb="md">
                <ThemeIcon variant="light" color="blue" radius="md">
                  <IconSettings size={20} />
                </ThemeIcon>
                <Text fw={700}>{t("admin.dashboard.cardSettingsTitle")}</Text>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                {t("admin.dashboard.cardSettingsDesc")}
              </Text>
              <Anchor component={Link} to="/admin/cms-settings" fw={600}>
                {t("admin.dashboard.cardSettingsLink")}
              </Anchor>
            </Paper>
          </Grid.Col>
        ) : null}
      </Grid>
    </Stack>
  )
}
