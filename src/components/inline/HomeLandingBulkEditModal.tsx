import { Button, Group, Modal, NativeSelect, ScrollArea, Stack, Text, TextInput, Textarea } from "@mantine/core"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { CmsMediaUploadField } from "../../admin/CmsMediaUploadField"
import {
  patchLandingArticlesLead,
  patchLandingExcellence,
  patchLandingProgramsSection,
  patchLandingVirtualTour,
  patchLandingWhyKoon,
  putLandingCollection,
} from "../../services/landingPayloadAdmin"
import type { Locale, ProgramContent } from "../../types/cms"
import type {
  HomeAdmissionStep,
  HomeArticleCard,
  HomeGalleryItem,
  HomeNewsItem,
  HomePageBundle,
  HomePartner,
  HomeStat,
  HomeWhyKoonIntro,
} from "../../types/homePageBundle"
import { toDateInputValue, toDatetimeLocalInputValue } from "../../utils/newsDateInput"

export type LandingBulkSection =
  | "programs"
  | "stats"
  | "news"
  | "gallery"
  | "partners"
  | "admissionSteps"
  | "articleCards"
  | "mediaTicker"
  | "policyBullets"
  | "excellence"
  | "virtualTour"
  | "articlesLead"
  | "whyKoon"

type Props = {
  opened: boolean
  onClose: () => void
  locale: Locale
  section: LandingBulkSection | null
  bundle: HomePageBundle
  onSaved: () => void
}

function sectionTitleKey(s: LandingBulkSection): string {
  const map: Record<LandingBulkSection, string> = {
    programs: "admin.landingBlocks.programs",
    stats: "admin.landingBlocks.stats",
    news: "admin.landingBlocks.news",
    gallery: "admin.landingBlocks.gallery",
    partners: "admin.landingBlocks.partners",
    admissionSteps: "admin.landingBlocks.admissionSteps",
    articleCards: "admin.landingBlocks.articleCards",
    mediaTicker: "admin.landingBlocks.mediaTicker",
    policyBullets: "admin.landingBlocks.policyBullets",
    excellence: "admin.landingBlocks.excellence",
    virtualTour: "admin.landingBlocks.virtualTour",
    articlesLead: "admin.landingBlocks.articlesLead",
    whyKoon: "admin.landingBlocks.whyKoon",
  }
  return map[s]
}

export function HomeLandingBulkEditModal({ opened, onClose, locale, section, bundle, onSaved }: Props) {
  const { t } = useTranslation()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [programs, setPrograms] = useState<ProgramContent[]>([])
  const [programsEyebrow, setProgramsEyebrow] = useState("")
  const [programsTitle, setProgramsTitle] = useState("")
  const [programsLead, setProgramsLead] = useState("")
  const [stats, setStats] = useState<HomeStat[]>([])
  const [news, setNews] = useState<HomeNewsItem[]>([])
  const [gallery, setGallery] = useState<HomeGalleryItem[]>([])
  const [partners, setPartners] = useState<HomePartner[]>([])
  const [admissionSteps, setAdmissionSteps] = useState<HomeAdmissionStep[]>([])
  const [articleCards, setArticleCards] = useState<HomeArticleCard[]>([])
  const [mediaLines, setMediaLines] = useState("")
  const [policyLines, setPolicyLines] = useState("")
  const [exTitle, setExTitle] = useState("")
  const [exSubtitle, setExSubtitle] = useState("")
  const [exBody, setExBody] = useState("")
  const [exBullets, setExBullets] = useState("")
  const [vtNote, setVtNote] = useState("")
  const [articlesLead, setArticlesLead] = useState("")
  const [articlesSectionTitle, setArticlesSectionTitle] = useState("")
  const [whyKoonDraft, setWhyKoonDraft] = useState<HomeWhyKoonIntro | null>(null)

  useEffect(() => {
    if (!opened || !section) {
      return
    }
    setError(null)
    switch (section) {
      case "programs":
        setPrograms(bundle.programs.map((p) => ({ ...p })))
        setProgramsEyebrow(bundle.programsSection.eyebrow)
        setProgramsTitle(bundle.programsSection.title)
        setProgramsLead(bundle.programsSection.lead)
        break
      case "stats":
        setStats(bundle.stats.map((s) => ({ ...s })))
        break
      case "news":
        setNews(bundle.news.map((n) => ({ ...n })))
        break
      case "gallery":
        setGallery(bundle.gallery.map((g) => ({ ...g })))
        break
      case "partners":
        setPartners(bundle.partners.map((p) => ({ ...p })))
        break
      case "admissionSteps":
        setAdmissionSteps(bundle.admissionSteps.map((s) => ({ ...s })))
        break
      case "articleCards":
        setArticleCards(bundle.articleCards.map((a) => ({ ...a })))
        break
      case "mediaTicker":
        setMediaLines(bundle.mediaTicker.join("\n"))
        break
      case "policyBullets":
        setPolicyLines(bundle.policyBullets.join("\n"))
        break
      case "excellence":
        setExTitle(bundle.excellence.title)
        setExSubtitle(bundle.excellence.subtitle)
        setExBody(bundle.excellence.body)
        setExBullets(bundle.excellence.bullets.join("\n"))
        break
      case "virtualTour":
        setVtNote(bundle.virtualTour.note)
        break
      case "articlesLead":
        setArticlesLead(bundle.articlesSectionLead)
        setArticlesSectionTitle(bundle.articlesSectionTitle)
        break
      case "whyKoon":
        setWhyKoonDraft({ ...bundle.whyKoon })
        break
      default:
        break
    }
  }, [opened, section, bundle])

  async function save() {
    if (!section) {
      return
    }
    setPending(true)
    setError(null)
    try {
      let res: Response
      switch (section) {
        case "programs": {
          const headRes = await patchLandingProgramsSection(locale, {
            eyebrow: programsEyebrow,
            title: programsTitle,
            lead: programsLead,
          })
          if (!headRes.ok) {
            res = headRes
            break
          }
          res = await putLandingCollection(
            locale,
            "programs",
            programs.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              annualFee: p.annualFee,
            })),
          )
          break
        }
        case "stats":
          res = await putLandingCollection(
            locale,
            "stats",
            stats.map((s) => ({ value: s.value, label: s.label })),
          )
          break
        case "news":
          res = await putLandingCollection(
            locale,
            "news",
            news.map((n) => ({
              id: n.id,
              slug: n.slug?.trim() || null,
              title: n.title,
              excerpt: n.excerpt,
              date: n.date,
              publishedAt: n.publishedAt?.trim() || null,
              image: n.image?.trim() || "",
              body: n.body?.trim() || null,
            })),
          )
          break
        case "gallery":
          res = await putLandingCollection(
            locale,
            "gallery",
            gallery.map((g) => ({
              id: g.id,
              src: g.src,
              alt: g.alt,
              caption: g.caption,
              mediaKind: g.mediaKind === "video" ? "video" : "image",
            })),
          )
          break
        case "partners":
          res = await putLandingCollection(
            locale,
            "partners",
            partners.map((p) => ({ id: p.id, name: p.name, abbreviation: p.abbreviation })),
          )
          break
        case "admissionSteps":
          res = await putLandingCollection(
            locale,
            "admissionSteps",
            admissionSteps.map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description,
            })),
          )
          break
        case "articleCards":
          res = await putLandingCollection(
            locale,
            "articleCards",
            articleCards.map((a) => ({
              id: a.id,
              slug: a.slug?.trim() || null,
              title: a.title,
              excerpt: a.excerpt,
              meta: a.meta,
              publishedAt: a.publishedAt?.trim() || null,
              body: a.body?.trim() || null,
            })),
          )
          break
        case "mediaTicker":
          res = await putLandingCollection(
            locale,
            "mediaTicker",
            mediaLines
              .split("\n")
              .map((l) => l.trim())
              .filter((l) => l.length > 0),
          )
          break
        case "policyBullets":
          res = await putLandingCollection(
            locale,
            "policyBullets",
            policyLines
              .split("\n")
              .map((l) => l.trim())
              .filter((l) => l.length > 0),
          )
          break
        case "excellence":
          res = await patchLandingExcellence(locale, {
            title: exTitle,
            subtitle: exSubtitle,
            body: exBody,
            bullets: exBullets
              .split("\n")
              .map((l) => l.trim())
              .filter((l) => l.length > 0),
          })
          break
        case "virtualTour":
          res = await patchLandingVirtualTour(locale, vtNote)
          break
        case "articlesLead":
          res = await patchLandingArticlesLead(locale, {
            articlesSectionLead: articlesLead,
            articlesSectionTitle: articlesSectionTitle,
          })
          break
        case "whyKoon":
          res = await patchLandingWhyKoon(locale, whyKoonDraft ?? bundle.whyKoon)
          break
        default:
          setPending(false)
          return
      }
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : t("inlineEdit.saveError"))
        return
      }
      onSaved()
      onClose()
    } catch {
      setError(t("inlineEdit.saveError"))
    } finally {
      setPending(false)
    }
  }

  const title = section ? t(sectionTitleKey(section)) : ""

  return (
    <Modal opened={opened && section !== null} onClose={onClose} title={title} radius="md" size="xl">
      <ScrollArea h="min(70vh, 36rem)" type="auto" offsetScrollbars>
        <Stack gap="md" pr="xs">
          {error ? (
            <Text size="sm" c="red">
              {error}
            </Text>
          ) : null}

          {section === "programs" ? (
            <>
              <TextInput
                label={t("inlineEdit.fieldProgramsSectionEyebrow")}
                value={programsEyebrow}
                onChange={(e) => setProgramsEyebrow(e.currentTarget.value)}
              />
              <TextInput
                label={t("inlineEdit.fieldProgramsSectionTitle")}
                value={programsTitle}
                onChange={(e) => setProgramsTitle(e.currentTarget.value)}
              />
              <Textarea
                label={t("inlineEdit.fieldProgramsSectionLead")}
                minRows={2}
                value={programsLead}
                onChange={(e) => setProgramsLead(e.currentTarget.value)}
              />
              {programs.map((row, i) => (
                <Stack key={row.id ?? i} gap="xs" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <Text size="xs" fw={700} c="dimmed">
                    {t("inlineEdit.highlightsCardLabel", { n: i + 1 })}
                  </Text>
                  <TextInput
                    label={t("inlineEdit.fieldTitle")}
                    value={row.name}
                    onChange={(e) => setPrograms((prev) => prev.map((r, j) => (j === i ? { ...r, name: e.currentTarget.value } : r)))}
                  />
                  <Textarea
                    label={t("inlineEdit.fieldDescription")}
                    value={row.description}
                    onChange={(e) =>
                      setPrograms((prev) => prev.map((r, j) => (j === i ? { ...r, description: e.currentTarget.value } : r)))
                    }
                    minRows={2}
                  />
                  <TextInput
                    label={t("inlineEdit.fieldAnnualFee")}
                    value={row.annualFee}
                    onChange={(e) =>
                      setPrograms((prev) => prev.map((r, j) => (j === i ? { ...r, annualFee: e.currentTarget.value } : r)))
                    }
                  />
                  <Button
                    size="compact-xs"
                    color="red"
                    variant="light"
                    onClick={() => setPrograms((prev) => prev.filter((_, j) => j !== i))}
                  >
                    {t("inlineEdit.removeRow")}
                  </Button>
                </Stack>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() =>
                  setPrograms((prev) => [...prev, { id: `gen_${Date.now()}`, name: "", description: "", annualFee: "" }])
                }
              >
                {t("inlineEdit.addRow")}
              </Button>
            </>
          ) : null}

          {section === "stats" ? (
            <>
              {stats.map((row, i) => (
                <Stack key={i} gap="xs" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <Group grow align="flex-start">
                    <TextInput
                      label={t("inlineEdit.fieldStatValue")}
                      value={row.value}
                      onChange={(e) => setStats((prev) => prev.map((r, j) => (j === i ? { ...r, value: e.currentTarget.value } : r)))}
                    />
                    <TextInput
                      label={t("inlineEdit.fieldStatLabel")}
                      value={row.label}
                      onChange={(e) => setStats((prev) => prev.map((r, j) => (j === i ? { ...r, label: e.currentTarget.value } : r)))}
                    />
                  </Group>
                  <Button size="compact-xs" color="red" variant="light" onClick={() => setStats((prev) => prev.filter((_, j) => j !== i))}>
                    {t("inlineEdit.removeRow")}
                  </Button>
                </Stack>
              ))}
              <Button size="xs" variant="light" onClick={() => setStats((prev) => [...prev, { value: "", label: "" }])}>
                {t("inlineEdit.addRow")}
              </Button>
            </>
          ) : null}

          {section === "news" ? (
            <>
              {news.map((row, i) => (
                <Stack key={row.id ?? i} gap="xs" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <TextInput
                    label={t("inlineEdit.fieldTitle")}
                    value={row.title}
                    onChange={(e) => setNews((prev) => prev.map((r, j) => (j === i ? { ...r, title: e.currentTarget.value } : r)))}
                  />
                  <Textarea
                    label={t("inlineEdit.fieldDescription")}
                    value={row.excerpt}
                    onChange={(e) => setNews((prev) => prev.map((r, j) => (j === i ? { ...r, excerpt: e.currentTarget.value } : r)))}
                    minRows={2}
                  />
                  <TextInput
                    type="date"
                    label={t("inlineEdit.fieldDate")}
                    value={toDateInputValue(row.date ?? "")}
                    onChange={(e) => setNews((prev) => prev.map((r, j) => (j === i ? { ...r, date: e.currentTarget.value } : r)))}
                  />
                  <CmsMediaUploadField
                    compact
                    label={t("inlineEdit.fieldNewsImage")}
                    value={row.image ?? ""}
                    onChange={(url) => setNews((prev) => prev.map((r, j) => (j === i ? { ...r, image: url } : r)))}
                  />
                  <Button size="compact-xs" color="red" variant="light" onClick={() => setNews((prev) => prev.filter((_, j) => j !== i))}>
                    {t("inlineEdit.removeRow")}
                  </Button>
                </Stack>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() =>
                  setNews((prev) => [
                    ...prev,
                    {
                      id: `gen_${Date.now()}`,
                      title: "",
                      excerpt: "",
                      date: "",
                      image: "",
                      slug: "",
                      body: "",
                      publishedAt: "",
                    },
                  ])
                }
              >
                {t("inlineEdit.addRow")}
              </Button>
            </>
          ) : null}

          {section === "gallery" ? (
            <>
              {gallery.map((row, i) => (
                <Stack key={row.id ?? i} gap="xs" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <CmsMediaUploadField
                    compact
                    label={t("inlineEdit.fieldGallerySrc")}
                    value={row.src}
                    onChange={(url) => setGallery((prev) => prev.map((r, j) => (j === i ? { ...r, src: url } : r)))}
                  />
                  <TextInput
                    label={t("inlineEdit.fieldBgAlt")}
                    value={row.alt}
                    onChange={(e) => setGallery((prev) => prev.map((r, j) => (j === i ? { ...r, alt: e.currentTarget.value } : r)))}
                  />
                  <TextInput
                    label={t("inlineEdit.fieldCaption")}
                    value={row.caption}
                    onChange={(e) => setGallery((prev) => prev.map((r, j) => (j === i ? { ...r, caption: e.currentTarget.value } : r)))}
                  />
                  <NativeSelect
                    label={t("admin.landingBlocks.mediaKind")}
                    data={[
                      { value: "image", label: "image" },
                      { value: "video", label: "video" },
                    ]}
                    value={row.mediaKind === "video" ? "video" : "image"}
                    onChange={(e) =>
                      setGallery((prev) =>
                        prev.map((r, j) => (j === i ? { ...r, mediaKind: e.currentTarget.value as "image" | "video" } : r)),
                      )
                    }
                  />
                  <Button size="compact-xs" color="red" variant="light" onClick={() => setGallery((prev) => prev.filter((_, j) => j !== i))}>
                    {t("inlineEdit.removeRow")}
                  </Button>
                </Stack>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() =>
                  setGallery((prev) => [...prev, { id: `gen_${Date.now()}`, src: "", alt: "", caption: "", mediaKind: "image" }])
                }
              >
                {t("inlineEdit.addRow")}
              </Button>
            </>
          ) : null}

          {section === "partners" ? (
            <>
              {partners.map((row, i) => (
                <Stack key={row.id ?? i} gap="xs" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <Group grow>
                    <TextInput
                      label={t("inlineEdit.fieldPartnerName")}
                      value={row.name}
                      onChange={(e) =>
                        setPartners((prev) => prev.map((r, j) => (j === i ? { ...r, name: e.currentTarget.value } : r)))
                      }
                    />
                    <TextInput
                      label={t("inlineEdit.fieldAbbrev")}
                      value={row.abbreviation}
                      onChange={(e) =>
                        setPartners((prev) => prev.map((r, j) => (j === i ? { ...r, abbreviation: e.currentTarget.value } : r)))
                      }
                    />
                  </Group>
                  <Button size="compact-xs" color="red" variant="light" onClick={() => setPartners((prev) => prev.filter((_, j) => j !== i))}>
                    {t("inlineEdit.removeRow")}
                  </Button>
                </Stack>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() => setPartners((prev) => [...prev, { id: `gen_${Date.now()}`, name: "", abbreviation: "" }])}
              >
                {t("inlineEdit.addRow")}
              </Button>
            </>
          ) : null}

          {section === "admissionSteps" ? (
            <>
              {admissionSteps.map((row, i) => (
                <Stack key={row.id ?? i} gap="xs" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <TextInput
                    label={t("inlineEdit.fieldTitle")}
                    value={row.title}
                    onChange={(e) =>
                      setAdmissionSteps((prev) => prev.map((r, j) => (j === i ? { ...r, title: e.currentTarget.value } : r)))
                    }
                  />
                  <Textarea
                    label={t("inlineEdit.fieldBlurb")}
                    value={row.description}
                    onChange={(e) =>
                      setAdmissionSteps((prev) => prev.map((r, j) => (j === i ? { ...r, description: e.currentTarget.value } : r)))
                    }
                    minRows={2}
                  />
                  <Button
                    size="compact-xs"
                    color="red"
                    variant="light"
                    onClick={() => setAdmissionSteps((prev) => prev.filter((_, j) => j !== i))}
                  >
                    {t("inlineEdit.removeRow")}
                  </Button>
                </Stack>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() =>
                  setAdmissionSteps((prev) => [...prev, { id: `gen_${Date.now()}`, title: "", description: "" }])
                }
              >
                {t("inlineEdit.addRow")}
              </Button>
            </>
          ) : null}

          {section === "articleCards" ? (
            <>
              {articleCards.map((row, i) => (
                <Stack key={row.id ?? i} gap="xs" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                  <TextInput
                    label={t("inlineEdit.fieldTitle")}
                    value={row.title}
                    onChange={(e) =>
                      setArticleCards((prev) => prev.map((r, j) => (j === i ? { ...r, title: e.currentTarget.value } : r)))
                    }
                  />
                  <Textarea
                    label={t("inlineEdit.fieldDescription")}
                    value={row.excerpt}
                    onChange={(e) =>
                      setArticleCards((prev) => prev.map((r, j) => (j === i ? { ...r, excerpt: e.currentTarget.value } : r)))
                    }
                    minRows={2}
                  />
                  <TextInput
                    label={t("inlineEdit.fieldMeta")}
                    value={row.meta}
                    onChange={(e) =>
                      setArticleCards((prev) => prev.map((r, j) => (j === i ? { ...r, meta: e.currentTarget.value } : r)))
                    }
                  />
                  <TextInput
                    type="datetime-local"
                    label={t("admin.growing.fieldPublishedAt")}
                    value={toDatetimeLocalInputValue(row.publishedAt ?? "")}
                    onChange={(e) => {
                      const v = e.currentTarget.value
                      setArticleCards((prev) =>
                        prev.map((r, j) => (j === i ? { ...r, publishedAt: v ? new Date(v).toISOString() : "" } : r)),
                      )
                    }}
                  />
                  <Button
                    size="compact-xs"
                    color="red"
                    variant="light"
                    onClick={() => setArticleCards((prev) => prev.filter((_, j) => j !== i))}
                  >
                    {t("inlineEdit.removeRow")}
                  </Button>
                </Stack>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() =>
                  setArticleCards((prev) => [
                    ...prev,
                    { id: `gen_${Date.now()}`, title: "", excerpt: "", meta: "", slug: "", publishedAt: "", body: "" },
                  ])
                }
              >
                {t("inlineEdit.addRow")}
              </Button>
            </>
          ) : null}

          {section === "mediaTicker" ? (
            <Textarea
              label={t("admin.landingBlocks.mediaTicker")}
              description={t("admin.landingBlocks.onePerLine")}
              minRows={8}
              value={mediaLines}
              onChange={(e) => setMediaLines(e.currentTarget.value)}
            />
          ) : null}

          {section === "policyBullets" ? (
            <Textarea
              label={t("admin.landingBlocks.policyBullets")}
              description={t("admin.landingBlocks.onePerLine")}
              minRows={8}
              value={policyLines}
              onChange={(e) => setPolicyLines(e.currentTarget.value)}
            />
          ) : null}

          {section === "excellence" ? (
            <>
              <TextInput
                label={t("inlineEdit.fieldExcellenceEyebrow")}
                value={exSubtitle}
                onChange={(e) => setExSubtitle(e.currentTarget.value)}
              />
              <TextInput label={t("inlineEdit.fieldTitle")} value={exTitle} onChange={(e) => setExTitle(e.currentTarget.value)} />
              <Textarea label={t("inlineEdit.fieldBody")} minRows={3} value={exBody} onChange={(e) => setExBody(e.currentTarget.value)} />
              <Textarea
                label={t("admin.landingBlocks.excellenceBullets")}
                description={t("admin.landingBlocks.onePerLine")}
                minRows={5}
                value={exBullets}
                onChange={(e) => setExBullets(e.currentTarget.value)}
              />
            </>
          ) : null}

          {section === "virtualTour" ? (
            <Textarea label={t("inlineEdit.fieldVirtualNote")} minRows={3} value={vtNote} onChange={(e) => setVtNote(e.currentTarget.value)} />
          ) : null}

          {section === "articlesLead" ? (
            <>
              <TextInput
                label={t("inlineEdit.fieldArticlesSectionTitle")}
                value={articlesSectionTitle}
                onChange={(e) => setArticlesSectionTitle(e.currentTarget.value)}
              />
              <Textarea
                label={t("admin.landingBlocks.articlesLead")}
                minRows={4}
                value={articlesLead}
                onChange={(e) => setArticlesLead(e.currentTarget.value)}
              />
            </>
          ) : null}

          {section === "whyKoon" ? (
            (() => {
              const d = whyKoonDraft ?? bundle.whyKoon
              const set = (patch: Partial<HomeWhyKoonIntro>) => setWhyKoonDraft({ ...d, ...patch })
              return (
                <>
                  <TextInput
                    label={t("admin.landingBlocks.whyKoonEyebrow")}
                    value={d.eyebrow}
                    onChange={(e) => set({ eyebrow: e.currentTarget.value })}
                  />
                  <TextInput
                    label={t("admin.landingBlocks.whyKoonTitle")}
                    value={d.title}
                    onChange={(e) => set({ title: e.currentTarget.value })}
                  />
                  <Textarea
                    label={t("admin.landingBlocks.whyKoonLead")}
                    minRows={3}
                    value={d.lead}
                    onChange={(e) => set({ lead: e.currentTarget.value })}
                  />
                  <Text size="sm" fw={600}>
                    {t("admin.landingBlocks.whyKoonVision")}
                  </Text>
                  <TextInput
                    label={t("admin.landingBlocks.whyKoonColumnLabel")}
                    value={d.visionLabel}
                    onChange={(e) => set({ visionLabel: e.currentTarget.value })}
                  />
                  <Textarea
                    label={t("admin.landingBlocks.whyKoonColumnBody")}
                    minRows={2}
                    value={d.visionText}
                    onChange={(e) => set({ visionText: e.currentTarget.value })}
                  />
                  <Text size="sm" fw={600}>
                    {t("admin.landingBlocks.whyKoonMission")}
                  </Text>
                  <TextInput
                    label={t("admin.landingBlocks.whyKoonColumnLabel")}
                    value={d.missionLabel}
                    onChange={(e) => set({ missionLabel: e.currentTarget.value })}
                  />
                  <Textarea
                    label={t("admin.landingBlocks.whyKoonColumnBody")}
                    minRows={2}
                    value={d.missionText}
                    onChange={(e) => set({ missionText: e.currentTarget.value })}
                  />
                  <Text size="sm" fw={600}>
                    {t("admin.landingBlocks.whyKoonPhilosophy")}
                  </Text>
                  <TextInput
                    label={t("admin.landingBlocks.whyKoonColumnLabel")}
                    value={d.philosophyLabel}
                    onChange={(e) => set({ philosophyLabel: e.currentTarget.value })}
                  />
                  <Textarea
                    label={t("admin.landingBlocks.whyKoonColumnBody")}
                    minRows={2}
                    value={d.philosophyText}
                    onChange={(e) => set({ philosophyText: e.currentTarget.value })}
                  />
                  <Text size="sm" fw={600}>
                    {t("admin.landingBlocks.whyKoonAccordion")}
                  </Text>
                  <TextInput
                    label={t("admin.landingBlocks.whyKoonAccordionSummary")}
                    value={d.accordionSummary}
                    onChange={(e) => set({ accordionSummary: e.currentTarget.value })}
                  />
                  <Textarea
                    label={t("admin.landingBlocks.whyKoonAccordionLead")}
                    minRows={4}
                    value={d.accordionLead}
                    onChange={(e) => set({ accordionLead: e.currentTarget.value })}
                  />
                </>
              )
            })()
          ) : null}
        </Stack>
      </ScrollArea>
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          {t("inlineEdit.cancel")}
        </Button>
        <Button loading={pending} onClick={() => void save()}>
          {t("inlineEdit.save")}
        </Button>
      </Group>
    </Modal>
  )
}
