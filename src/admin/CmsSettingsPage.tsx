import { Button, Group, Paper, Tabs, Text, TextInput, Title } from "@mantine/core"
import { type FormEvent, useEffect, useState } from "react"
import { getDefaultSiteNav } from "../content/siteNavDefaults"
import { type SiteNavItem, parseSiteNavTreeJson } from "../types/siteNav"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"
import { SiteNavEditor } from "./SiteNavEditor"

function validateNavTree(items: SiteNavItem[]): boolean {
  for (const it of items) {
    if (!it.label.trim() || !it.href.trim()) {
      return false
    }
    if (it.children?.length && !validateNavTree(it.children)) {
      return false
    }
  }
  return true
}

export function CmsSettingsPage() {
  const { t, isRtl } = useAdminI18n()
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [logo, setLogo] = useState("")
  const [navEn, setNavEn] = useState<SiteNavItem[]>(() => getDefaultSiteNav("en"))
  const [navAr, setNavAr] = useState<SiteNavItem[]>(() => getDefaultSiteNav("ar"))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await adminFetch("/api/admin/cms-settings")
        if (!res.ok) {
          throw new Error("fail")
        }
        const body = (await res.json()) as { settings?: Record<string, string | null> }
        const s = body.settings ?? {}
        if (!cancelled) {
          setPhone(s.phone ?? "")
          setEmail(s.email ?? "")
          setWhatsapp(s.whatsapp ?? "")
          setLogo(s.logo ?? "")
          setNavEn(parseSiteNavTreeJson(s.nav_tree_en) ?? getDefaultSiteNav("en"))
          setNavAr(parseSiteNavTreeJson(s.nav_tree_ar) ?? getDefaultSiteNav("ar"))
        }
      } catch {
        if (!cancelled) {
          setError(t("admin.cmsSettings.loadError"))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [t])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!validateNavTree(navEn) || !validateNavTree(navAr)) {
      setError(t("admin.siteNav.validationEmpty"))
      return
    }
    setSaving(true)
    try {
      const res = await adminFetch("/api/admin/cms-settings", {
        method: "PUT",
        body: JSON.stringify({
          phone,
          email,
          whatsapp,
          logo,
          nav_tree_en: navEn,
          nav_tree_ar: navAr,
        }),
      })
      if (!res.ok) {
        setError(t("admin.cmsSettings.saveError"))
        return
      }
      const body = (await res.json()) as { settings?: Record<string, string | null> }
      const s = body.settings ?? {}
      setPhone(s.phone ?? "")
      setEmail(s.email ?? "")
      setWhatsapp(s.whatsapp ?? "")
      setLogo(s.logo ?? "")
      setNavEn(parseSiteNavTreeJson(s.nav_tree_en) ?? getDefaultSiteNav("en"))
      setNavAr(parseSiteNavTreeJson(s.nav_tree_ar) ?? getDefaultSiteNav("ar"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Paper
      withBorder
      shadow="sm"
      p="md"
      radius="md"
      component="form"
      onSubmit={(e) => void onSubmit(e)}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Title order={3} mb="md">
        {t("admin.cmsSettings.title")}
      </Title>
      <TextInput label={t("admin.cmsSettings.phone")} value={phone} onChange={(e) => setPhone(e.currentTarget.value)} mb="sm" />
      <TextInput
        label={t("admin.cmsSettings.email")}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        mb="sm"
      />
      <TextInput
        label={t("admin.cmsSettings.whatsapp")}
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.currentTarget.value)}
        mb="sm"
      />
      <TextInput
        label={t("admin.cmsSettings.logo")}
        description={t("admin.cmsSettings.logoHint")}
        value={logo}
        onChange={(e) => setLogo(e.currentTarget.value)}
        mb="lg"
      />

      <Title order={4} mb="xs">
        {t("admin.siteNav.sectionTitle")}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        {t("admin.siteNav.desc")}
      </Text>
      <Tabs defaultValue="en" mb="lg">
        <Tabs.List>
          <Tabs.Tab value="en">{t("admin.siteNav.tabEn")}</Tabs.Tab>
          <Tabs.Tab value="ar">{t("admin.siteNav.tabAr")}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="en" pt="md">
          <SiteNavEditor value={navEn} onChange={setNavEn} />
        </Tabs.Panel>
        <Tabs.Panel value="ar" pt="md">
          <SiteNavEditor value={navAr} onChange={setNavAr} />
        </Tabs.Panel>
      </Tabs>

      {error ? (
        <div style={{ color: "var(--mantine-color-red-6)", marginBottom: 12 }}>{error}</div>
      ) : null}
      {loading ? (
        <div>{t("admin.cmsSettings.loading")}</div>
      ) : (
        <Group>
          <Button type="submit" loading={saving}>
            {t("admin.cmsSettings.save")}
          </Button>
        </Group>
      )}
    </Paper>
  )
}
