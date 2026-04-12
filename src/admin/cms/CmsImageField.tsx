import { Button, Group, Image, Select, Stack, Text, TextInput } from "@mantine/core"
import type { TFunction } from "i18next"
import { useEffect, useRef, useState } from "react"
import { uploadCmsImage } from "./cmsMediaUpload"

function displaySrc(url: string): string {
  const u = url.trim()
  if (!u) {
    return ""
  }
  if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/")) {
    return u
  }
  return `/${u.replace(/^\/+/, "")}`
}

type Props = {
  label: string
  description?: string
  value: string
  onCommit: (next: string) => void
  recentUrls: string[]
  disabled?: boolean
  t: TFunction
}

export function CmsImageField({ label, description, value, onCommit, recentUrls, disabled, t }: Props) {
  const [local, setLocal] = useState(value)
  useEffect(() => setLocal(value), [value])
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const preview = displaySrc(local)
  return (
    <Stack gap="xs">
      <TextInput
        label={label}
        description={description}
        value={local}
        disabled={disabled}
        onChange={(e) => {
          setLocal(e.currentTarget.value)
          setErr(null)
        }}
        onBlur={() => {
          if (local !== value) {
            onCommit(local.trim())
          }
        }}
      />
      {recentUrls.length > 0 ? (
        <Select
          label={t("admin.cmsEditor.imageReuseLabel")}
          description={t("admin.cmsEditor.imageReuseDesc")}
          placeholder={t("admin.cmsEditor.imageReusePlaceholder")}
          data={recentUrls.map((u) => ({
            value: u,
            label: u.length > 64 ? `${u.slice(0, 30)}…${u.slice(-28)}` : u,
          }))}
          searchable
          clearable
          disabled={disabled}
          onChange={(v) => {
            if (v) {
              setLocal(v)
              onCommit(v)
            }
          }}
        />
      ) : null}
      <Group align="flex-end" wrap="wrap">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.currentTarget.files?.[0]
            e.currentTarget.value = ""
            if (!f) {
              return
            }
            setUploading(true)
            setErr(null)
            void uploadCmsImage(f)
              .then((url) => {
                setLocal(url)
                onCommit(url)
              })
              .catch((e: Error) => setErr(e.message))
              .finally(() => setUploading(false))
          }}
        />
        <Button type="button" variant="light" size="xs" loading={uploading} disabled={disabled} onClick={() => fileRef.current?.click()}>
          {t("admin.cmsEditor.imageUpload")}
        </Button>
      </Group>
      {err ? (
        <Text size="xs" c="red">
          {err}
        </Text>
      ) : null}
      {preview ? (
        <Image
          src={preview}
          alt=""
          radius="sm"
          h={160}
          fit="contain"
          style={{ alignSelf: "flex-start", maxWidth: "100%", background: "var(--mantine-color-gray-1)" }}
        />
      ) : null}
    </Stack>
  )
}
