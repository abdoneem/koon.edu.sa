import { Anchor, Box, Grid, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core"
import { IconCalendarEvent, IconCheck, IconEye, IconFileText, IconUsers } from "@tabler/icons-react"
import { type ReactNode, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import type { RegistrationStats } from "../types/registration"
import { adminFetch } from "./adminApi"

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
  barFraction,
}: {
  label: string
  value: number
  icon: ReactNode
  color: string
  sub?: string
  barFraction?: number
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
            {value.toLocaleString("ar-SA")}
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
          setError("تعذر تحميل الإحصائيات.")
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const reviewedReplied = stats ? stats.reviewed + stats.replied : 0
  const pipelineHint =
    stats && stats.total > 0
      ? `${Math.round((stats.pending / stats.total) * 100)}% لا تزال قيد المراجعة`
      : undefined

  return (
    <Stack gap="xl">
      <div>
        <Title order={2}>لوحة التحكم</Title>
        <Text c="dimmed" size="sm" mt={4}>
          ملخص طلبات التسجيل وروابط العمل السريعة.
        </Text>
      </div>

      {error ? (
        <Paper withBorder p="sm" radius="md" bg="red.0" c="red.8">
          {error}
        </Paper>
      ) : !stats ? (
        <Text c="dimmed">جاري التحميل…</Text>
      ) : (
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label="إجمالي الطلبات"
              value={stats.total}
              color="koon"
              icon={<IconUsers size={26} />}
              sub="كل الطلبات المسجَّلة"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label="قيد المراجعة"
              value={stats.pending}
              color="yellow"
              icon={<IconEye size={26} />}
              sub={pipelineHint}
              barFraction={stats.total > 0 ? stats.pending / stats.total : 0}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label="تمت المراجعة"
              value={stats.reviewed}
              color="blue"
              icon={<IconCalendarEvent size={26} />}
              barFraction={stats.total > 0 ? stats.reviewed / stats.total : 0}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label="تم الرد"
              value={stats.replied}
              color="teal"
              icon={<IconCheck size={26} />}
              sub={reviewedReplied > 0 ? `${reviewedReplied} تمت معالجتهم (مراجعة أو رد)` : undefined}
              barFraction={stats.total > 0 ? stats.replied / stats.total : 0}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <StatCard
              label="جديد آخر 7 أيام"
              value={stats.last_7_days}
              color="koon"
              icon={<IconCalendarEvent size={26} />}
              barFraction={stats.total > 0 ? stats.last_7_days / stats.total : 0}
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
              <Text fw={700}>طلبات التسجيل</Text>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              تصفية، بحث، وترتيب الطلبات مع ترقيم الصفحات.
            </Text>
            <Anchor component={Link} to="/admin/registrations" fw={600}>
              فتح القائمة ←
            </Anchor>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder shadow="sm" p="lg" radius="md">
            <Group mb="md">
              <ThemeIcon variant="light" color="gray" radius="md">
                <IconFileText size={20} />
              </ThemeIcon>
              <Text fw={700}>محتوى الموقع</Text>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              تحرير الصفحات والنشر عبر واجهة منفصلة.
            </Text>
            <Anchor component={Link} to="/admin/content-pages" fw={600}>
              صفحات المحتوى ←
            </Anchor>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
