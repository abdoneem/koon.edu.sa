import { Anchor, Box, Grid, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core"
import { IconCalendarEvent, IconCheck, IconEye, IconFileText, IconSettings, IconStack2, IconUsers } from "@tabler/icons-react"
import { type ReactNode, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import type { RegistrationStats } from "../types/registration"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"

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

export function AdminDashboard() {
  const { t, localeTag } = useAdminI18n()
  const [stats, setStats] = useState<RegistrationStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
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

      {error ? (
        <Paper withBorder p="sm" radius="md" bg="red.0" c="red.8">
          {error}
        </Paper>
      ) : !stats ? (
        <Text c="dimmed">{t("admin.dashboard.loading")}</Text>
      ) : (
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
      )}

      <Grid gutter="md">
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
      </Grid>
    </Stack>
  )
}
