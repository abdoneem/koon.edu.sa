import {
  Alert,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core"
import { IconCircleCheck } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { PageLayout } from "../components/PageLayout"
import { SitePageHero } from "../components/site/SitePageHero"
import { useCmsSite } from "../context/CmsSiteContext"
import { siteImagery } from "../content/siteImagery"
import { usePublicLocale } from "../hooks/usePublicLocale"

/** Thank-you path after registration submit (locale prefix added via `href()`). */
export const REGISTRATION_THANKYOU_PATH = "/registration/thankyou" as const

export function RegistrationThankYouPage() {
  const { phoneDisplay, phoneHref, whatsappHref } = useCmsSite()
  const { t, i18n } = useTranslation()
  const { href } = usePublicLocale()
  const isRtl = i18n.language.startsWith("ar")

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
            <Paper
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
                <Alert color="blue" variant="light" title={phoneDisplay}>
                  <Stack gap="xs">
                    <Text size="sm">{t("registrationPage.contactBanner")}</Text>
                    <Group gap="sm" justify="flex-start" wrap="wrap">
                      <Button component="a" href={phoneHref} size="sm" variant="filled">
                        {t("chatbot.call")}
                      </Button>
                      <Button component="a" href={whatsappHref} target="_blank" size="sm" variant="light">
                        {t("chatbot.whatsapp")}
                      </Button>
                    </Group>
                  </Stack>
                </Alert>
                <Button
                  component={Link}
                  to={href("/registration")}
                  variant="default"
                  size="md"
                  fullWidth
                >
                  {t("registrationPage.registerAnother")}
                </Button>
              </Stack>
            </Paper>
          </Container>
        </section>
      </div>
    </PageLayout>
  )
}

export default RegistrationThankYouPage
