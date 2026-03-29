import { Alert, Anchor, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core"
import { useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { env } from "../config/env"
import { adminFetch } from "./adminApi"
import { getAdminToken, setAdminToken } from "./authToken"

export function AdminLoginPage() {
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
      <Stack p="xl" maw={480} mx="auto" dir="rtl">
        <Title order={2}>دخول الإدارة</Title>
        <Alert color="orange">اضبط VITE_API_BASE_URL في .env.local ثم أعد تشغيل Vite.</Alert>
        <Anchor component={Link} to="/">
          العودة للموقع
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
      }
      if (!res.ok) {
        const msg =
          data.message ??
          (data.errors?.email?.[0] ?? data.errors?.password?.[0]) ??
          "فشل تسجيل الدخول"
        setError(msg)
        return
      }
      if (!data.token) {
        setError("لم يُرجع الخادم رمز الدخول")
        return
      }
      setAdminToken(data.token)
      navigate(from, { replace: true })
    } catch {
      setError("خطأ في الشبكة")
    } finally {
      setPending(false)
    }
  }

  return (
    <Stack align="center" justify="center" mih="100vh" bg="gray.0" p="md" dir="rtl">
      <Paper withBorder shadow="md" p="xl" radius="md" maw={420} w="100%">
        <Title order={2} ta="center" mb="xs">
          دخول لوحة الإدارة
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          حساب مُصرّح من فريق كون
        </Text>
        <form onSubmit={(e) => void onSubmit(e)}>
          <Stack gap="md">
            {error ? (
              <Alert color="red" title="تنبيه">
                {error}
              </Alert>
            ) : null}
            <TextInput label="البريد" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
            <PasswordInput
              label="كلمة المرور"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <Button type="submit" fullWidth loading={pending}>
              دخول
            </Button>
            <Anchor component={Link} to="/" size="sm" ta="center" display="block">
              العودة للموقع العام
            </Anchor>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}
