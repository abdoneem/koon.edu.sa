import { Button, Paper, Stack, Textarea, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useTranslation } from "react-i18next"

const fieldClassNames = {
  root: "home-book-field",
  label: "home-book-field__label",
  input: "home-book-field__input",
  wrapper: "home-book-field__wrap",
} as const

export function HomeBookTourForm() {
  const { t, i18n } = useTranslation()
  const rtl = i18n.language.startsWith("ar")
  const form = useForm({
    initialValues: { name: "", phone: "", email: "", date: "", notes: "" },
  })

  return (
    <Paper shadow="md" p="xl" radius="lg" withBorder className="home-book-tour__paper home-book-tour__paper--premium" dir={rtl ? "rtl" : "ltr"}>
      <form onSubmit={form.onSubmit(() => {})}>
        <Stack gap="lg">
          <TextInput label={t("bookTourPage.name")} classNames={fieldClassNames} {...form.getInputProps("name")} />
          <TextInput label={t("bookTourPage.phone")} classNames={fieldClassNames} {...form.getInputProps("phone")} />
          <TextInput label={t("bookTourPage.email")} type="email" classNames={fieldClassNames} {...form.getInputProps("email")} />
          <TextInput label={t("bookTourPage.date")} classNames={fieldClassNames} {...form.getInputProps("date")} />
          <Textarea
            label={t("bookTourPage.notes")}
            minRows={3}
            classNames={{
              ...fieldClassNames,
              input: "home-book-field__input home-book-field__input--multi",
            }}
            {...form.getInputProps("notes")}
          />
          <Button type="submit" size="md" fullWidth className="home-book-field__submit">
            {t("bookTourPage.submit")}
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}
