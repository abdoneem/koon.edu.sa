import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { adminFetch } from "./adminApi"
import { useAdminI18n } from "./adminI18n"
import { templateForSlug } from "./defaultPayloads"

const SLUGS = ["landing-page", "about-page", "admissions-page", "contact-page"] as const
type Slug = (typeof SLUGS)[number]

type PageRow = {
  id: number
  slug: string
  locale: string
  published_at: string | null
  payload: Record<string, unknown>
}

export function ContentPageEditor() {
  const { t, isRtl } = useAdminI18n()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === undefined

  const [slug, setSlug] = useState<Slug>("landing-page")
  const [locale, setLocale] = useState<"en" | "ar">("en")
  const [publishedAt, setPublishedAt] = useState("")
  const [payloadText, setPayloadText] = useState(templateForSlug("landing-page"))
  const [heroAlt, setHeroAlt] = useState("")
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (isNew) {
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await adminFetch(`/api/admin/content-pages/${id}`)
        if (!res.ok) {
          throw new Error("Not found")
        }
        const row = (await res.json()) as PageRow
        if (cancelled) {
          return
        }
        setSlug(row.slug as Slug)
        setLocale(row.locale as "en" | "ar")
        setPublishedAt(row.published_at ? row.published_at.slice(0, 16) : "")
        setPayloadText(JSON.stringify(row.payload, null, 2))
      } catch {
        if (!cancelled) {
          setError(t("admin.contentEditor.loadFailed"))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, isNew, t])

  useEffect(() => {
    if (isNew) {
      setPayloadText(templateForSlug(slug))
    }
  }, [slug, isNew])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(payloadText) as Record<string, unknown>
    } catch {
      setError(t("admin.contentEditor.invalidJson"))
      return
    }

    setPending(true)
    try {
      if (isNew) {
        const fd = new FormData()
        fd.append("slug", slug)
        fd.append("locale", locale)
        if (publishedAt) {
          fd.append("published_at", new Date(publishedAt).toISOString())
        }
        fd.append("payload", JSON.stringify(payload))
        if (heroAlt) {
          fd.append("hero_image_alt", heroAlt)
        }
        if (heroFile) {
          fd.append("hero_image", heroFile)
        }
        const res = await adminFetch("/api/admin/content-pages", { method: "POST", body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg =
            typeof data === "object" && data !== null && "message" in data
              ? String((data as { message: string }).message)
              : t("admin.contentEditor.saveFailed")
          setError(msg)
          return
        }
        navigate(`/admin/content-pages/${(data as PageRow).id}/edit`, { replace: true })
        return
      }

      const hasFile = heroFile !== null
      if (hasFile || heroAlt) {
        const fd = new FormData()
        fd.append("payload", JSON.stringify(payload))
        if (publishedAt) {
          fd.append("published_at", new Date(publishedAt).toISOString())
        }
        if (heroAlt) {
          fd.append("hero_image_alt", heroAlt)
        }
        if (heroFile) {
          fd.append("hero_image", heroFile)
        }
        fd.append("_method", "PUT")
        const res = await adminFetch(`/api/admin/content-pages/${id}`, { method: "POST", body: fd })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(
            typeof data === "object" && data !== null && "message" in data
              ? String((data as { message: string }).message)
              : t("admin.contentEditor.updateFailed"),
          )
          return
        }
      } else {
        const body: { payload: Record<string, unknown>; published_at?: string } = { payload }
        if (publishedAt) {
          body.published_at = new Date(publishedAt).toISOString()
        }
        const res = await adminFetch(`/api/admin/content-pages/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(
            typeof data === "object" && data !== null && "message" in data
              ? String((data as { message: string }).message)
              : t("admin.contentEditor.updateFailed"),
          )
          return
        }
      }
      navigate("/admin/content-pages", { replace: true })
    } catch {
      setError(t("admin.contentEditor.networkError"))
    } finally {
      setPending(false)
    }
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <p style={{ marginBottom: "1rem" }}>
        <Link to="/admin/content-pages">{t("admin.contentEditor.backLink")}</Link>
      </p>
      <h1 style={{ marginTop: 0 }}>
        {isNew ? t("admin.contentEditor.newTitle") : t("admin.contentEditor.editTitle", { id })}
      </h1>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      <form onSubmit={(e) => void onSubmit(e)} style={{ display: "grid", gap: "1rem", maxWidth: "720px" }}>
        {isNew ? (
          <>
            <label style={{ display: "grid", gap: "0.25rem" }}>
              {t("admin.contentEditor.slug")}
              <select value={slug} onChange={(e) => setSlug(e.target.value as Slug)}>
                {SLUGS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: "0.25rem" }}>
              {t("admin.contentEditor.locale")}
              <select value={locale} onChange={(e) => setLocale(e.target.value as "en" | "ar")}>
                <option value="en">en</option>
                <option value="ar">ar</option>
              </select>
            </label>
          </>
        ) : (
          <p>
            <strong>{slug}</strong> · <strong>{locale}</strong>
          </p>
        )}
        <label style={{ display: "grid", gap: "0.25rem" }}>
          {t("admin.contentEditor.publishedAt")}
          <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
        </label>
        {slug === "landing-page" ? (
          <>
            <label style={{ display: "grid", gap: "0.25rem" }}>
              {t("admin.contentEditor.heroImage")}
              <input type="file" accept="image/*" onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)} />
            </label>
            <label style={{ display: "grid", gap: "0.25rem" }}>
              {t("admin.contentEditor.heroAlt")}
              <input type="text" value={heroAlt} onChange={(e) => setHeroAlt(e.currentTarget.value)} />
            </label>
          </>
        ) : null}
        <label style={{ display: "grid", gap: "0.25rem" }}>
          {t("admin.contentEditor.payload")}
          <textarea
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            rows={22}
            style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.85rem" }}
          />
        </label>
        <button type="submit" disabled={pending}>
          {pending ? t("admin.contentEditor.saving") : t("admin.contentEditor.save")}
        </button>
      </form>
    </div>
  )
}
