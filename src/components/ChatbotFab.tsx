import { ActionIcon, Modal, Stack, Text, Button } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export function ChatbotFab() {
  const { t } = useTranslation()
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Modal opened={opened} onClose={close} title={t("chatbot.title")} centered size="md">
        <Stack gap="md">
          <Text size="sm" style={{ lineHeight: 1.65 }}>
            {t("chatbot.body")}
          </Text>
          <Button component={Link} to="/contact" variant="light" onClick={close}>
            {t("chatbot.contactCta")}
          </Button>
          <Button variant="default" onClick={close}>
            {t("chatbot.close")}
          </Button>
        </Stack>
      </Modal>
      <ActionIcon
        className="chatbot-fab"
        size={56}
        radius="xl"
        variant="filled"
        color="blue"
        onClick={open}
        aria-label={t("chatbot.fabAria")}
        title={t("chatbot.fabAria")}
      >
        <span className="chatbot-fab__glyph" aria-hidden>
          AI
        </span>
      </ActionIcon>
    </>
  )
}
