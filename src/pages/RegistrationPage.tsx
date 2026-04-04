import {
  Alert,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconBolt, IconCircleCheck, IconHeadset, IconShieldCheck } from "@tabler/icons-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { PageLayout } from "../components/PageLayout"
import { SitePageHero } from "../components/site/SitePageHero"
import { brand } from "../config/brand"
import { siteImagery } from "../content/siteImagery"
import { env } from "../config/env"
import { useRegistrationOptions } from "../hooks/useRegistrationOptions"
import type { RegistrationOptionLocale } from "../types/registrationOptions"

function focusFirstInvalidControl(formEl: HTMLFormElement | null) {
  if (!formEl) return
  const invalid = formEl.querySelector<HTMLElement>('[aria-invalid="true"]')
  invalid?.focus()
  invalid?.scrollIntoView({ block: "center", behavior: "smooth" })
}

export function RegistrationPage() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language.startsWith("ar")
  const lang: RegistrationOptionLocale = isRtl ? "ar" : "en"
  const { data: options, loading: optionsLoading, error: optionsError } = useRegistrationOptions()
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

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
    return [...options.grades]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((g) => ({
        value: g.code,
        label: g.labels[lang],
      }))
  }, [options, lang])

  const nationalityData = useMemo(() => {
    if (!options) {
      return []
    }
    return [...options.nationalities]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((n) => ({
        value: n.code,
        label: isRtl ? n.labels.ar : `${n.labels.en} — ${n.labels.ar}`,
      }))
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
      father_full_name: (v) => (v.trim() ? null : t("registrationPage.fieldRequired")),
      father_national_id: (v) => (v.trim() ? null : t("registrationPage.fieldRequired")),
      student_full_name: (v) => (v.trim() ? null : t("registrationPage.fieldRequired")),
      student_national_id: (v) => (v.trim() ? null : t("registrationPage.fieldRequired")),
      parent_mobile: (v) => (v.trim() ? null : t("registrationPage.fieldRequired")),
      gender: (v) => (v ? null : t("registrationPage.fieldRequired")),
      grade_level: (v) => (v.trim() ? null : t("registrationPage.fieldRequired")),
      nationality: (v) => (v.trim() ? null : t("registrationPage.fieldRequired")),
    },
  })

  useEffect(() => {
    if (done) {
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [done])

  const fieldDisabled = loading || !options || !!optionsError

  const inputClassNames = useMemo(
    () => ({
      input: "registration-field-control",
    }),
    [],
  )

  async function submitRegistration(values: typeof form.values) {
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
          t("registrationPage.errorSubmitFailed")
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

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const { hasErrors } = form.validate()
    if (hasErrors) {
      requestAnimationFrame(() => focusFirstInvalidControl(formRef.current))
      return
    }
    void submitRegistration(form.values)
  }

  const dividerLabelPos = isRtl ? "right" : "left"

  const optionsBlock =
    optionsError != null ? (
      <Alert color="red" title={t("registrationPage.alertErrorTitle")}>
        {optionsError}
      </Alert>
    ) : optionsLoading ? (
      <Group justify="center" gap="sm" py="md" c="dimmed" aria-live="polite">
        <Loader size="sm" />
        <Text size="sm">{t("registrationPage.optionsLoading")}</Text>
      </Group>
    ) : null

  return (
    <PageLayout>
      <div className="site-page-premium">
        <SitePageHero
          eyebrow={t("nav.registration")}
          title={t("registrationPage.title")}
          lead={t("registrationPage.lead")}
          sublead={t("registrationPage.heroLead")}
          imageSrc={siteImagery.pageHero.registration}
          imageAlt={t("registrationPage.heroImageAlt")}
        />
        <section className="home-section home-section--surface site-page-premium__band-first">
          <Container size="md" py="xl" className="site-registration-shell" dir={isRtl ? "rtl" : "ltr"}>
            {done ? (
              <Paper
                ref={successRef}
                className="registration-success-panel"
                shadow="md"
                p={{ base: "lg", sm: "xl" }}
                radius="lg"
                withBorder
                role="status"
                aria-live="polite"
              >
                <Stack gap="lg" align="stretch">
                  <Group gap="md" wrap="nowrap" align="flex-start">
                    <ThemeIcon size={54} radius="md" variant="light" color="teal" aria-hidden>
                      <IconCircleCheck size={30} stroke={1.75} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Title order={2} className="registration-success-panel__title">
                        {t("registrationPage.successTitle")}
                      </Title>
                      <Text size="md" c="dimmed" lh={1.65}>
                        {t("registrationPage.successBody")}
                      </Text>
                      <Text size="sm" c="dimmed" lh={1.6}>
                        {t("registrationPage.successNextSteps")}
                      </Text>
                    </Stack>
                  </Group>
                  <Alert color="blue" variant="light" title={brand.phoneDisplay}>
                    <Stack gap="xs">
                      <Text size="sm">{t("registrationPage.contactBanner")}</Text>
                      <Group gap="sm" justify="flex-start" wrap="wrap">
                        <Button component="a" href={`tel:${brand.phoneTel}`} size="sm" variant="filled">
                          {t("chatbot.call")}
                        </Button>
                        <Button component="a" href={brand.whatsappHref} target="_blank" size="sm" variant="light">
                          {t("chatbot.whatsapp")}
                        </Button>
                      </Group>
                    </Stack>
                  </Alert>
                  <Button
                    variant="default"
                    size="md"
                    fullWidth
                    onClick={() => {
                      setDone(false)
                      setError(null)
                    }}
                  >
                    {t("registrationPage.registerAnother")}
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Stack gap="xl">
                <Stack gap="xs" className="registration-form-intro">
                  <Title order={2} className="registration-form-intro__title">
                    {t("registrationPage.formHeadline")}
                  </Title>
                  <Text size="md" c="dimmed" lh={1.65}>
                    {t("registrationPage.formSubhead")}
                  </Text>
                </Stack>

                <div className="registration-trust-row" role="list">
                  <Paper className="registration-trust-item" p="sm" radius="md" withBorder role="listitem">
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <ThemeIcon size="36" radius="md" variant="light" color="koon" aria-hidden>
                        <IconBolt size={20} stroke={1.75} />
                      </ThemeIcon>
                      <Text size="sm" fw={600} lh={1.5} style={{ flex: 1 }}>
                        {t("registrationPage.trustFastResponse")}
                      </Text>
                    </Group>
                  </Paper>
                  <Paper className="registration-trust-item" p="sm" radius="md" withBorder role="listitem">
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <ThemeIcon size="36" radius="md" variant="light" color="koon" aria-hidden>
                        <IconShieldCheck size={20} stroke={1.75} />
                      </ThemeIcon>
                      <Text size="sm" fw={600} lh={1.5} style={{ flex: 1 }}>
                        {t("registrationPage.trustSafeData")}
                      </Text>
                    </Group>
                  </Paper>
                  <Paper className="registration-trust-item" p="sm" radius="md" withBorder role="listitem">
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <ThemeIcon size="36" radius="md" variant="light" color="koon" aria-hidden>
                        <IconHeadset size={20} stroke={1.75} />
                      </ThemeIcon>
                      <Text size="sm" fw={600} lh={1.5} style={{ flex: 1 }}>
                        {t("registrationPage.trustTeam")}
                      </Text>
                    </Group>
                  </Paper>
                </div>

                <Alert color="blue" variant="light" title={brand.phoneDisplay}>
                  <Stack gap="xs">
                    <Text size="sm">{t("registrationPage.contactBanner")}</Text>
                    <Group gap="sm" justify="flex-start" wrap="wrap">
                      <Button component="a" href={`tel:${brand.phoneTel}`} size="xs" variant="filled">
                        {t("chatbot.call")}
                      </Button>
                      <Button component="a" href={brand.whatsappHref} target="_blank" size="xs" variant="light">
                        {t("chatbot.whatsapp")}
                      </Button>
                    </Group>
                  </Stack>
                </Alert>

                <Paper shadow="sm" p={{ base: "md", sm: "lg" }} radius="lg" withBorder>
                  {optionsBlock}
                  <form
                    ref={formRef}
                    noValidate
                    onSubmit={handleFormSubmit}
                    aria-busy={loading}
                    className="registration-form"
                  >
                    <Stack gap="lg" mt={optionsError ? "md" : optionsLoading ? "sm" : 0}>
                      {error ? (
                        <Alert color="red" title={t("registrationPage.alertErrorTitle")} role="alert">
                          {error}
                        </Alert>
                      ) : null}

                      <div>
                        <Divider
                          label={t("registrationPage.sectionCampus")}
                          labelPosition={dividerLabelPos}
                          className="registration-section-divider"
                        />
                        <Text size="sm" c="dimmed" mt="xs" mb="md">
                          {t("registrationPage.sectionCampusHint")}
                        </Text>
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
                              disabled={fieldDisabled}
                              comboboxProps={{ withinPortal: true, transitionProps: { transition: "pop", duration: 150 } }}
                              classNames={inputClassNames}
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
                        </Grid>
                      </div>

                      <div>
                        <Divider
                          label={t("registrationPage.sectionGuardian")}
                          labelPosition={dividerLabelPos}
                          className="registration-section-divider"
                        />
                        <Text size="sm" c="dimmed" mt="xs" mb="md">
                          {t("registrationPage.sectionGuardianHint")}
                        </Text>
                        <Grid>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label={t("registrationPage.fatherFullNameLabel")}
                              required
                              withAsterisk
                              disabled={fieldDisabled}
                              classNames={inputClassNames}
                              {...form.getInputProps("father_full_name")}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label={t("registrationPage.fatherNationalIdLabel")}
                              required
                              withAsterisk
                              disabled={fieldDisabled}
                              classNames={inputClassNames}
                              {...form.getInputProps("father_national_id")}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label={t("registrationPage.parentMobileLabel")}
                              required
                              withAsterisk
                              disabled={fieldDisabled}
                              classNames={inputClassNames}
                              {...form.getInputProps("parent_mobile")}
                            />
                          </Grid.Col>
                        </Grid>
                      </div>

                      <div>
                        <Divider
                          label={t("registrationPage.sectionStudent")}
                          labelPosition={dividerLabelPos}
                          className="registration-section-divider"
                        />
                        <Text size="sm" c="dimmed" mt="xs" mb="md">
                          {t("registrationPage.sectionStudentHint")}
                        </Text>
                        <Grid>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label={t("registrationPage.studentFullNameLabel")}
                              required
                              withAsterisk
                              disabled={fieldDisabled}
                              classNames={inputClassNames}
                              {...form.getInputProps("student_full_name")}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label={t("registrationPage.studentNationalIdLabel")}
                              required
                              withAsterisk
                              disabled={fieldDisabled}
                              classNames={inputClassNames}
                              {...form.getInputProps("student_national_id")}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                              label={t("registrationPage.genderLabel")}
                              placeholder={t("registrationPage.genderPlaceholder")}
                              data={genderData}
                              required
                              disabled={fieldDisabled}
                              comboboxProps={{ withinPortal: true, transitionProps: { transition: "pop", duration: 150 } }}
                              classNames={inputClassNames}
                              {...form.getInputProps("gender")}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                              label={t("registrationPage.gradeLabel")}
                              placeholder={t("registrationPage.gradePlaceholder")}
                              searchable
                              nothingFoundMessage={t("registrationPage.gradeNothingFound")}
                              data={gradeData}
                              required
                              disabled={fieldDisabled}
                              comboboxProps={{ withinPortal: true, transitionProps: { transition: "pop", duration: 150 } }}
                              scrollAreaProps={{ type: "auto", mah: 280 }}
                              classNames={inputClassNames}
                              {...form.getInputProps("grade_level")}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 12 }}>
                            <Select
                              label={t("registrationPage.nationalityLabel")}
                              placeholder={t("registrationPage.nationalityPlaceholder")}
                              searchable
                              nothingFoundMessage={t("registrationPage.nationalityNothingFound")}
                              data={nationalityData}
                              required
                              disabled={fieldDisabled}
                              comboboxProps={{ withinPortal: true, transitionProps: { transition: "pop", duration: 150 } }}
                              scrollAreaProps={{ type: "auto", mah: 280 }}
                              classNames={inputClassNames}
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
                              disabled={fieldDisabled}
                              classNames={inputClassNames}
                              {...form.getInputProps("notes")}
                            />
                          </Grid.Col>
                        </Grid>
                      </div>

                      <Button
                        type="submit"
                        size="xl"
                        radius="md"
                        fullWidth
                        className="registration-form-submit"
                        loading={loading}
                        loaderProps={{ type: "dots" }}
                        disabled={fieldDisabled}
                      >
                        {loading ? t("registrationPage.submitSending") : t("registrationPage.submit")}
                      </Button>
                    </Stack>
                  </form>
                </Paper>
              </Stack>
            )}
          </Container>
        </section>
      </div>
    </PageLayout>
  )
}

export default RegistrationPage
