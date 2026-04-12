import { Alert, Button, Paper, Stack, Textarea, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { env } from "../../config/env"

export function ContactPageForm() {
  const { t, i18n } = useTranslation()
  const rtl = i18n.language.startsWith("ar")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const inputClassNames = useMemo(
    () => ({
      input: "registration-field-control",
      label: "site-contact-form__label",
    }),
    [],
  )

  const form = useForm({
    initialValues: { name: "", email: "", phone: "", subject: "", message: "" },
    validate: {
      name: (v) => (v.trim() ? null : t("contactPage.formFieldRequired")),
      email: (v) => {
        const s = v.trim()
        if (!s) {
          return t("contactPage.formFieldRequired")
        }
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? null : t("contactPage.formInvalidEmail")
      },
      subject: (v) => (v.trim() ? null : t("contactPage.formFieldRequired")),
      message: (v) => (v.trim() ? null : t("contactPage.formFieldRequired")),
    },
  })

  async function submit(values: typeof form.values) {
    if (!env.apiBaseUrl) {
      setError(t("contactPage.formErrorNoApi"))
      return
    }
    setError(null)
    setLoading(true)
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        subject: values.subject.trim(),
        message: values.message.trim(),
      }
      const res = await fetch(`${env.apiBaseUrl.replace(/\/$/, "")}/api/contact-messages`, {
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
          t("contactPage.formErrorSubmit")
        setError(first)
        return
      }
      setDone(true)
      form.reset()
    } catch {
      setError(t("contactPage.formErrorNetwork"))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="site-contact-form-shell" dir={rtl ? "rtl" : "ltr"}>
        <Paper
          radius="lg"
          p="lg"
          withBorder
          className="registration-success-panel"
          shadow="sm"
        >
          <Stack gap="md">
            <p className="registration-success-panel__title">{t("contactPage.formSuccessTitle")}</p>
            <p className="site-contact-form__success-lead">{t("contactPage.formSuccessBody")}</p>
            <Button variant="light" color="koon" radius="md" onClick={() => setDone(false)}>
              {t("contactPage.formSendAnother")}
            </Button>
          </Stack>
        </Paper>
      </div>
    )
  }

  return (
    <div className="site-contact-form-shell" dir={rtl ? "rtl" : "ltr"}>
      <form onSubmit={form.onSubmit((v) => void submit(v))} className="site-contact-form" noValidate>
        <div className="site-contact-form__panel">
          <Stack gap="lg">
            {error ? (
              <Alert color="red" variant="light" title={t("registrationPage.alertErrorTitle")} radius="md">
                {error}
              </Alert>
            ) : null}

            <TextInput
              label={t("contactPage.formName")}
              radius="md"
              size="md"
              classNames={inputClassNames}
              {...form.getInputProps("name")}
            />
            <TextInput
              label={t("contactPage.formEmail")}
              radius="md"
              size="md"
              classNames={inputClassNames}
              {...form.getInputProps("email")}
              type="email"
              inputMode="email"
              autoComplete="email"
            />
            <TextInput
              label={t("contactPage.formPhone")}
              radius="md"
              size="md"
              classNames={inputClassNames}
              {...form.getInputProps("phone")}
            />
            <TextInput
              label={t("contactPage.formSubject")}
              radius="md"
              size="md"
              classNames={inputClassNames}
              {...form.getInputProps("subject")}
            />
            <Textarea
              label={t("contactPage.formMessage")}
              minRows={5}
              autosize
              maxRows={12}
              radius="md"
              size="md"
              classNames={inputClassNames}
              {...form.getInputProps("message")}
            />

            <Button
              type="submit"
              size="xl"
              radius="md"
              fullWidth
              className="registration-form-submit"
              loading={loading}
              loaderProps={{ type: "dots" }}
            >
              {loading ? t("contactPage.formSubmitting") : t("contactPage.formSubmit")}
            </Button>
          </Stack>
        </div>
      </form>
    </div>
  )
}
