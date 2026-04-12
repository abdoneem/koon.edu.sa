import { Alert, Anchor, Button, Group, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core"
import { useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { env } from "../config/env"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"
import { AdminLanguageSwitcher } from "./AdminLanguageSwitcher"
import { getAdminToken, setAdminSession } from "./authToken"

export function AdminLoginPage() {
  const { t, isRtl } = useAdminI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (getAdminToken()) {
    return <Navigate to={from} replace />
  }

  if (!env.apiBaseUrl) {
    return (
      <Stack p="xl" maw={480} mx="auto" dir={isRtl ? "rtl" : "ltr"}>
        <Group justify="flex-end">
          <AdminLanguageSwitcher />
        </Group>
        <Title order={2}>{t("admin.login.title")}</Title>
        <Alert color="orange">{t("admin.login.configureApi")}</Alert>
        <Anchor component={Link} to="/">
          {t("admin.login.backToSite")}
        </Anchor>
      </Stack>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await adminFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      const data = (await res.json()) as {
        token?: string
        message?: string
        errors?: Record<string, string[]>
        user?: {
          roles?: string[]
          permissions?: string[]
        }
      }
      if (!res.ok) {
        const msg =
          data.message ??
          (data.errors?.email?.[0] ?? data.errors?.password?.[0]) ??
          t("admin.login.loginFailed")
        setError(msg)
        return
      }
      if (!data.token) {
        setError(t("admin.login.noToken"))
        return
      }
      setAdminSession({
        token: data.token,
        roles: data.user?.roles ?? [],
        permissions: data.user?.permissions ?? [],
      })
      navigate(from, { replace: true })
    } catch {
      setError(t("admin.login.networkError"))
    } finally {
      setPending(false)
    }
  }

  return (
    <Stack align="center" justify="center" mih="100vh" bg="gray.0" p="md" dir={isRtl ? "rtl" : "ltr"}>
      <Group w="100%" maw={420} justify="flex-end" mb="xs">
        <AdminLanguageSwitcher />
      </Group>
      <Paper withBorder shadow="md" p="xl" radius="md" maw={420} w="100%">
        <Title order={2} ta="center" mb="xs">
          {t("admin.login.title")}
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          {t("admin.login.subtitle")}
        </Text>
        <form onSubmit={(e) => void onSubmit(e)}>
          <Stack gap="md">
            {error ? (
              <Alert color="red" title={t("admin.login.alertTitle")}>
                {error}
              </Alert>
            ) : null}
            <TextInput
              label={t("admin.login.email")}
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <PasswordInput
              label={t("admin.login.password")}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <Button type="submit" fullWidth loading={pending}>
              {t("admin.login.submit")}
            </Button>
            <Anchor component={Link} to="/" size="sm" ta="center" display="block">
              {t("admin.login.backToSite")}
            </Anchor>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}
