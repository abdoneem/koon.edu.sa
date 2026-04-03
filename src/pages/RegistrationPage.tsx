import {
  Alert,
  Button,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { PageLayout } from "../components/PageLayout"
import { brand } from "../config/brand"
import { env } from "../config/env"
import { useRegistrationOptions } from "../hooks/useRegistrationOptions"
import type { RegistrationOptionLocale } from "../types/registrationOptions"

export function RegistrationPage() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language.startsWith("ar")
  const lang: RegistrationOptionLocale = isRtl ? "ar" : "en"
  const { data: options, loading: optionsLoading, error: optionsError } = useRegistrationOptions()

  const genderData = useMemo(
    () => [
      { value: "male", label: isRtl ? "ذكر" : "Male" },
      { value: "female", label: isRtl ? "أنثى" : "Female" },
    ],
    [isRtl],
  )

  const gradeData = useMemo(() => {
    if (!options) {
      return []
    }
    return options.grades.map((g) => ({
      value: g.code,
      label: g.labels[lang],
    }))
  }, [options, lang])

  const nationalityData = useMemo(() => {
    if (!options) {
      return []
    }
    return [...options.nationalities]
      .map((n) => ({
        value: n.code,
        label: isRtl ? n.labels.ar : `${n.labels.en} — ${n.labels.ar}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "ar"))
  }, [options, isRtl])

  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: {
      campus: "" as "" | "madinah" | "riyadh",
      father_full_name: "",
      father_national_id: "",
      student_full_name: "",
      student_national_id: "",
      parent_mobile: "",
      gender: "" as "" | "male" | "female",
      grade_level: "",
      nationality: "",
      notes: "",
    },
    validate: {
      campus: (v) => (v ? null : t("registrationPage.campusRequired")),
      father_full_name: (v) => (v.trim() ? null : "مطلوب"),
      father_national_id: (v) => (v.trim() ? null : "مطلوب"),
      student_full_name: (v) => (v.trim() ? null : "مطلوب"),
      student_national_id: (v) => (v.trim() ? null : "مطلوب"),
      parent_mobile: (v) => (v.trim() ? null : "مطلوب"),
      gender: (v) => (v ? null : "مطلوب"),
      grade_level: (v) => (v.trim() ? null : "مطلوب"),
      nationality: (v) => (v.trim() ? null : "مطلوب"),
    },
  })

  async function onSubmit(values: typeof form.values) {
    if (!env.apiBaseUrl) {
      setError(t("registrationPage.errorNoApi"))
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { campus, notes, ...rest } = values
      const campusNote =
        campus === "madinah"
          ? `${t("registrationPage.campusLabel")}: ${t("registrationPage.campusMadinah")}`
          : campus === "riyadh"
            ? `${t("registrationPage.campusLabel")}: ${t("registrationPage.campusRiyadh")}`
            : ""
      const pathNote =
        campus === "madinah"
          ? `${t("registrationPage.pathLabel")}: ${t("registrationPage.pathNationalBilingual")}`
          : campus === "riyadh"
            ? `${t("registrationPage.pathLabel")}: ${t("registrationPage.pathInternational")}`
            : ""
      const mergedNotes = [campusNote, pathNote, notes.trim()].filter(Boolean).join("\n")
      const payload = {
        ...rest,
        notes: mergedNotes || undefined,
      }
      const res = await fetch(`${env.apiBaseUrl.replace(/\/$/, "")}/api/registrations`, {
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
          "تعذر إرسال الطلب"
        setError(first)
        return
      }
      setDone(true)
      form.reset()
    } catch {
      setError(t("registrationPage.errorNetwork"))
    } finally {
      setLoading(false)
    }
  }

  const optionsBlock =
    optionsError != null ? (
      <Alert color="red" title="تنبيه">
        {optionsError}
      </Alert>
    ) : optionsLoading ? (
      <Group justify="center" gap="sm" py="xs" c="dimmed">
        <Loader size="sm" />
        <Text size="sm">{t("registrationPage.optionsLoading")}</Text>
      </Group>
    ) : null

  return (
    <PageLayout>
      <Container size="md" py="xl" dir={isRtl ? "rtl" : "ltr"}>
        <Title order={1} mb="xs" ta="center">
          {t("registrationPage.title")}
        </Title>
        <Text c="dimmed" ta="center" mb="md" maw={520} mx="auto">
          {t("registrationPage.lead")}
        </Text>
        <Text size="sm" ta="center" mb="lg" maw={560} mx="auto" fw={500}>
          {t("registrationPage.heroLead")}
        </Text>

        <Alert color="blue" variant="light" mb="lg" title={brand.phoneDisplay}>
          <Stack gap="xs">
            <Text size="sm">{t("registrationPage.contactBanner")}</Text>
            <Group gap="sm" justify="center" wrap="wrap">
              <Button component="a" href={`tel:${brand.phoneTel}`} size="xs" variant="filled">
                {t("chatbot.call")}
              </Button>
              <Button component="a" href={brand.whatsappHref} target="_blank" size="xs" variant="light">
                {t("chatbot.whatsapp")}
              </Button>
            </Group>
          </Stack>
        </Alert>

        {done ? (
          <Alert color="green" title={t("registrationPage.successTitle")}>
            {t("registrationPage.successBody")}
          </Alert>
        ) : (
          <Paper shadow="sm" p={{ base: "md", sm: "lg" }} radius="md" withBorder>
            {optionsBlock}
            <form onSubmit={form.onSubmit((v) => void onSubmit(v))}>
              <Stack gap="md" mt={optionsError ? "md" : 0}>
                {error ? (
                  <Alert color="red" title="تنبيه">
                    {error}
                  </Alert>
                ) : null}
                <Grid>
                  <Grid.Col span={12}>
                    <Select
                      label={t("registrationPage.campusLabel")}
                      placeholder={t("registrationPage.campusLabel")}
                      data={[
                        { value: "madinah", label: t("registrationPage.campusMadinah") },
                        { value: "riyadh", label: t("registrationPage.campusRiyadh") },
                      ]}
                      required
                      comboboxProps={{ withinPortal: true, transitionProps: { transition: "pop", duration: 150 } }}
                      {...form.getInputProps("campus")}
                    />
                    {form.values.campus === "madinah" || form.values.campus === "riyadh" ? (
                      <Text size="sm" c="dimmed" mt="xs">
                        <strong>{t("registrationPage.pathLabel")}:</strong>{" "}
                        {form.values.campus === "madinah"
                          ? t("registrationPage.pathNationalBilingual")
                          : t("registrationPage.pathInternational")}
                      </Text>
                    ) : null}
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput label="اسم الأب الرباعي" required withAsterisk {...form.getInputProps("father_full_name")} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="رقم هوية الأب"
                      required
                      withAsterisk
                      {...form.getInputProps("father_national_id")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="رقم جوال الأب/الأم"
                      required
                      withAsterisk
                      {...form.getInputProps("parent_mobile")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="اسم الطالب الرباعي"
                      required
                      withAsterisk
                      {...form.getInputProps("student_full_name")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="رقم هوية الطالب"
                      required
                      withAsterisk
                      {...form.getInputProps("student_national_id")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label="الجنس"
                      placeholder={t("registrationPage.genderPlaceholder")}
                      data={genderData}
                      required
                      disabled={!options || !!optionsError}
                      {...form.getInputProps("gender")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label="الصف الدراسي"
                      placeholder={t("registrationPage.gradePlaceholder")}
                      searchable
                      nothingFoundMessage={t("registrationPage.nationalityNothingFound")}
                      data={gradeData}
                      required
                      disabled={!options || !!optionsError}
                      comboboxProps={{ withinPortal: true, transitionProps: { transition: "pop", duration: 150 } }}
                      scrollAreaProps={{ type: "auto", mah: 280 }}
                      {...form.getInputProps("grade_level")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 12 }}>
                    <Select
                      label="الجنسية"
                      placeholder={t("registrationPage.nationalityPlaceholder")}
                      searchable
                      nothingFoundMessage={t("registrationPage.nationalityNothingFound")}
                      data={nationalityData}
                      required
                      disabled={!options || !!optionsError}
                      comboboxProps={{ withinPortal: true, transitionProps: { transition: "pop", duration: 150 } }}
                      scrollAreaProps={{ type: "auto", mah: 280 }}
                      {...form.getInputProps("nationality")}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Textarea
                      label={t("registrationPage.notesLabel")}
                      placeholder={t("registrationPage.notesPlaceholder")}
                      minRows={3}
                      autosize
                      maxRows={8}
                      {...form.getInputProps("notes")}
                    />
                  </Grid.Col>
                </Grid>
                <Button type="submit" loading={loading} size="md" fullWidth disabled={!options || !!optionsError}>
                  {t("registrationPage.submit")}
                </Button>
              </Stack>
            </form>
          </Paper>
        )}
      </Container>
    </PageLayout>
  )
}

export default RegistrationPage
