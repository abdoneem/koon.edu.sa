import { Button, Group, Modal, Stack, Text } from "@mantine/core"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { usePublicLocale } from "../hooks/usePublicLocale"

const STORAGE_KEY = "koon-madinah-launch-banner-v1"

export function LaunchAnnouncementModal() {
  const { t } = useTranslation()
  const { href } = usePublicLocale()
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpened(true)
      }
    } catch {
      setOpened(true)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      /* ignore */
    }
    setOpened(false)
  }

  return (
    <Modal
      opened={opened}
      onClose={dismiss}
      title={t("launchModal.title")}
      centered
      size="lg"
      padding="lg"
      overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
    >
      <Stack gap="md">
        <Text size="sm" style={{ lineHeight: 1.65 }}>
          {t("launchModal.body")}
        </Text>
        <Group justify="flex-end" gap="sm" wrap="wrap">
          <Button variant="default" onClick={dismiss}>
            {t("launchModal.ctaDismiss")}
          </Button>
          <Button component={Link} to={href("/contact")} variant="light" onClick={dismiss}>
            {t("launchModal.ctaContact")}
          </Button>
          <Button component={Link} to={href("/registration")} onClick={dismiss}>
            {t("launchModal.ctaRegister")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
