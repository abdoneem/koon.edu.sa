import { Button, Group, Text, TextInput } from "@mantine/core"
import { useRef, useState } from "react"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"
import { hasAdminPermission } from "./authToken"
import { downscaleImageFileIfNeeded } from "../utils/downscaleImageFile"

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
  disabled?: boolean
  /** Show compact layout for inline modals */
  compact?: boolean
}

export function CmsMediaUploadField({ label, value, onChange, disabled, compact }: Props) {
  const { t } = useAdminI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canUpload = hasAdminPermission("media_manage")

  async function onPickFile(file: File | null) {
    if (!file || disabled) {
      return
    }
    setPending(true)
    setError(null)
    try {
      const prepared = await downscaleImageFileIfNeeded(file)
      const fd = new FormData()
      fd.append("file", prepared)
      const res = await adminFetch("/api/admin/cms-media", { method: "POST", body: fd })
      const data = (await res.json().catch(() => ({}))) as { url?: string; message?: string }
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : t("admin.mediaUpload.failed"))
        return
      }
      if (typeof data.url === "string" && data.url.length > 0) {
        onChange(data.url)
      }
    } catch {
      setError(t("admin.mediaUpload.networkError"))
    } finally {
      setPending(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <div>
      <TextInput
        label={label}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        disabled={disabled}
        size={compact ? "xs" : "sm"}
      />
      {canUpload ? (
        <Group gap="xs" mt={compact ? 4 : 6} wrap="nowrap" align="flex-start">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            disabled={disabled || pending}
            className="visually-hidden"
            aria-label={t("admin.mediaUpload.fileInputAria")}
            onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="light"
            size={compact ? "compact-xs" : "xs"}
            loading={pending}
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {t("admin.mediaUpload.chooseFile")}
          </Button>
          {!compact ? (
            <Text size="xs" c="dimmed" style={{ flex: 1 }}>
              {t("admin.mediaUpload.hint")}
            </Text>
          ) : null}
        </Group>
      ) : (
        <Text size="xs" c="dimmed" mt={4}>
          {t("admin.mediaUpload.noPermission")}
        </Text>
      )}
      {error ? (
        <Text size="xs" c="red" mt={4}>
          {error}
        </Text>
      ) : null}
    </div>
  )
}
