import { ActionIcon, Anchor, Group, Paper, Switch, Text } from "@mantine/core"
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react"
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { adminFetch } from "../admin/adminApi"
import { ADMIN_SESSION_CHANGED_EVENT, ADMIN_SESSION_STORAGE_KEY } from "../admin/authToken"
import { env } from "../config/env"
import { contentPageSlugFromPublicPath } from "../inline/contentPageSlugFromPath"
import { canUseInlineEdit } from "../inline/inlineEditGate"

const STORAGE_KEY = "koon_inline_edit_mode"
const TOOLBAR_COLLAPSED_KEY = "koon_inline_edit_toolbar_collapsed"

type InlineEditContextValue = {
  /** User may use inline tools (logged in + permissions). */
  available: boolean
  /** User turned on edit mode for this tab. */
  enabled: boolean
  setEnabled: (on: boolean) => void
}

const InlineEditContext = createContext<InlineEditContextValue | null>(null)

export function InlineEditProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [available, setAvailable] = useState(false)
  const [enabled, setEnabledState] = useState(false)

  useEffect(() => {
    setAvailable(canUseInlineEdit())
  }, [pathname])

  useEffect(() => {
    const sync = () => setAvailable(canUseInlineEdit())
    const onStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_SESSION_STORAGE_KEY || e.key === "koon_admin_token") {
        sync()
      }
    }
    window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, sync)
    window.addEventListener("storage", onStorage)
    window.addEventListener("focus", sync)
    return () => {
      window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, sync)
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("focus", sync)
    }
  }, [])

  useEffect(() => {
    if (!available) {
      return
    }
    setEnabledState(sessionStorage.getItem(STORAGE_KEY) === "1")
  }, [available])

  const setEnabled = useCallback((on: boolean) => {
    setEnabledState(on)
    sessionStorage.setItem(STORAGE_KEY, on ? "1" : "0")
  }, [])

  const value = useMemo(
    () => ({
      available,
      enabled,
      setEnabled,
    }),
    [available, enabled, setEnabled],
  )

  return (
    <InlineEditContext.Provider value={value}>
      {children}
      <InlineEditPublicToolbar />
    </InlineEditContext.Provider>
  )
}

export function useInlineEdit(): InlineEditContextValue {
  const ctx = useContext(InlineEditContext)
  if (!ctx) {
    throw new Error("useInlineEdit must be used within InlineEditProvider")
  }
  return ctx
}

const STRUCTURED_EDITOR_LABEL: Record<string, string> = {
  "landing-page": "inlineEdit.structuredEditorHome",
  "about-page": "inlineEdit.structuredEditorAbout",
  "contact-page": "inlineEdit.structuredEditorContact",
  "admissions-page": "inlineEdit.structuredEditorAdmissions",
}

function InlineEditPublicToolbar() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const { available, enabled, setEnabled } = useInlineEdit()
  const [structuredHref, setStructuredHref] = useState<string | null>(null)
  const [structuredState, setStructuredState] = useState<"idle" | "loading" | "missing">("idle")
  const [toolbarCollapsed, setToolbarCollapsed] = useState(() => sessionStorage.getItem(TOOLBAR_COLLAPSED_KEY) === "1")

  const setCollapsed = useCallback((collapsed: boolean) => {
    setToolbarCollapsed(collapsed)
    sessionStorage.setItem(TOOLBAR_COLLAPSED_KEY, collapsed ? "1" : "0")
  }, [])

  const contentSlug = contentPageSlugFromPublicPath(pathname)
  const locale = i18n.language.startsWith("ar") ? "ar" : "en"

  useEffect(() => {
    if (!available || !enabled || !contentSlug || !env.apiBaseUrl) {
      setStructuredHref(null)
      setStructuredState("idle")
      return
    }
    let cancelled = false
    setStructuredState("loading")
    setStructuredHref(null)
    ;(async () => {
      try {
        const res = await adminFetch("/api/admin/content-pages")
        if (!res.ok || cancelled) {
          if (!cancelled) {
            setStructuredState("missing")
          }
          return
        }
        const body = (await res.json()) as { data?: { id: number; slug: string; locale: string }[] }
        const row = body.data?.find((r) => r.slug === contentSlug && r.locale === locale)
        if (cancelled) {
          return
        }
        if (row) {
          setStructuredHref(`/admin/content-pages/${row.id}/edit`)
          setStructuredState("idle")
        } else {
          setStructuredState("missing")
        }
      } catch {
        if (!cancelled) {
          setStructuredState("missing")
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [available, enabled, contentSlug, locale, pathname])

  if (!available || pathname.startsWith("/admin")) {
    return null
  }

  const structuredLabelKey = contentSlug ? (STRUCTURED_EDITOR_LABEL[contentSlug] ?? null) : null

  if (toolbarCollapsed) {
    return (
      <Paper
        shadow="md"
        px="xs"
        py={4}
        radius="xl"
        withBorder
        className={`inline-edit-toolbar inline-edit-toolbar--collapsed inline-edit-toolbar--collapsed--${enabled ? "on" : "off"}`}
        role="button"
        tabIndex={0}
        aria-expanded={false}
        aria-label={enabled ? t("inlineEdit.toolbarExpandPillAriaOn") : t("inlineEdit.toolbarExpandPillAriaOff")}
        onClick={() => setCollapsed(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setCollapsed(false)
          }
        }}
      >
        <Group gap={4} wrap="nowrap" justify="center" align="center">
          <span className="inline-edit-toolbar__collapsed-dot" aria-hidden />
          <IconChevronUp size={16} stroke={1.75} aria-hidden />
          <Text component="span" size="xs" fw={700}>
            {t("inlineEdit.toolbarExpandShort")}
          </Text>
        </Group>
      </Paper>
    )
  }

  return (
    <Paper
      shadow="md"
      p="sm"
      radius="md"
      withBorder
      className="inline-edit-toolbar"
      role="region"
      aria-label={t("inlineEdit.toolbarAria")}
      aria-expanded
    >
      <Group gap="xs" align="flex-start" justify="space-between" wrap="nowrap" mb={6}>
        <Switch
          style={{ flex: 1, minWidth: 0 }}
          label={t("inlineEdit.modeLabel")}
          description={t("inlineEdit.modeHint")}
          checked={enabled}
          onChange={(e) => setEnabled(e.currentTarget.checked)}
          size="sm"
        />
        <ActionIcon
          type="button"
          variant="subtle"
          color="gray"
          size="lg"
          radius="md"
          aria-label={t("inlineEdit.toolbarMinimizeAria", { state: enabled ? t("inlineEdit.toolbarCollapsedStatusOn") : t("inlineEdit.toolbarCollapsedStatusOff") })}
          title={t("inlineEdit.toolbarMinimizeAria", { state: enabled ? t("inlineEdit.toolbarCollapsedStatusOn") : t("inlineEdit.toolbarCollapsedStatusOff") })}
          onClick={() => setCollapsed(true)}
        >
          <IconChevronDown size={18} stroke={1.75} />
        </ActionIcon>
      </Group>
      {enabled && contentSlug && structuredLabelKey ? (
        <div className="inline-edit-toolbar__structured">
          {structuredState === "loading" ? (
            <Text size="xs" c="dimmed" mt="xs">
              {t("inlineEdit.structuredEditorLoading")}
            </Text>
          ) : null}
          {structuredHref ? (
            <Anchor component={Link} to={structuredHref} size="xs" fw={600} mt="xs" display="block">
              {t(structuredLabelKey)}
            </Anchor>
          ) : null}
          {structuredState === "missing" && !structuredHref ? (
            <Text size="xs" c="dimmed" mt="xs">
              {t("inlineEdit.structuredEditorMissing")}
            </Text>
          ) : null}
          <Anchor component={Link} to="/admin/content-pages" size="xs" c="dimmed" mt={4} display="block">
            {t("inlineEdit.structuredEditorList")}
          </Anchor>
        </div>
      ) : null}
      <Text size="xs" c="dimmed" mt={4}>
        {t("inlineEdit.toolbarFooter")}
      </Text>
    </Paper>
  )
}
