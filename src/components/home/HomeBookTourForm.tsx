import { Alert, Button, Paper, Stack, Textarea, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { env } from "../../config/env"

const fieldClassNames = {
  root: "home-book-field",
  label: "home-book-field__label",
  input: "home-book-field__input",
  wrapper: "home-book-field__wrap",
} as const

export function HomeBookTourForm() {
  const { t, i18n } = useTranslation()
  const rtl = i18n.language.startsWith("ar")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const form = useForm({
    initialValues: { name: "", phone: "", email: "", date: "", notes: "" },
    validate: {
      name: (v) => (v.trim() ? null : t("bookTourPage.fieldRequired")),
      phone: (v) => (v.trim() ? null : t("bookTourPage.fieldRequired")),
      email: (v) => {
        const s = v.trim()
        if (!s) {
          return null
        }
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? null : t("bookTourPage.invalidEmail")
      },
    },
  })

  async function submit(values: typeof form.values) {
    if (!env.apiBaseUrl) {
      setError(t("bookTourPage.errorNoApi"))
      return
    }
    setError(null)
    setLoading(true)
    try {
      const payload = {
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim() || undefined,
        preferred_date: values.date.trim() || undefined,
        notes: values.notes.trim() || undefined,
      }
      const res = await fetch(`${env.apiBaseUrl.replace(/\/$/, "")}/api/book-tour`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { message?: string; errors?: Record<string, string[]> }
      if (!res.ok) {
        const first =
          data.message ??
          (data.errors ? Object.values(data.errors).flat()[0] : null) ??
          t("bookTourPage.errorSubmitFailed")
        setError(first)
        return
      }
      setDone(true)
      form.reset()
    } catch {
      setError(t("bookTourPage.errorNetwork"))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <Paper shadow="md" p="xl" radius="lg" withBorder className="home-book-tour__paper home-book-tour__paper--premium" dir={rtl ? "rtl" : "ltr"}>
        <Stack gap="md">
          <Alert color="teal" title={t("bookTourPage.successTitle")}>
            {t("bookTourPage.successBody")}
          </Alert>
          <Button variant="light" onClick={() => setDone(false)}>
            {t("bookTourPage.submit")}
          </Button>
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper shadow="md" p="xl" radius="lg" withBorder className="home-book-tour__paper home-book-tour__paper--premium" dir={rtl ? "rtl" : "ltr"}>
      <form onSubmit={form.onSubmit((v) => void submit(v))}>
        <Stack gap="lg">
          {error ? (
            <Alert color="red" title={t("registrationPage.alertErrorTitle")}>
              {error}
            </Alert>
          ) : null}
          <TextInput label={t("bookTourPage.name")} classNames={fieldClassNames} {...form.getInputProps("name")} />
          <TextInput label={t("bookTourPage.phone")} classNames={fieldClassNames} {...form.getInputProps("phone")} />
          <TextInput
            label={t("bookTourPage.email")}
            classNames={fieldClassNames}
            {...form.getInputProps("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
          />
          <TextInput type="date" label={t("bookTourPage.date")} classNames={fieldClassNames} {...form.getInputProps("date")} />
          <Textarea
            label={t("bookTourPage.notes")}
            minRows={3}
            classNames={{
              ...fieldClassNames,
              input: "home-book-field__input home-book-field__input--multi",
            }}
            {...form.getInputProps("notes")}
          />
          <Button type="submit" size="md" fullWidth className="home-book-field__submit" loading={loading}>
            {loading ? t("bookTourPage.submitSending") : t("bookTourPage.submit")}
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}
