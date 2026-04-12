import { Accordion, Button, Group, NativeSelect, Paper, Stack, Text, TextInput, Textarea, Title } from "@mantine/core"
import { toDateInputValue, toDatetimeLocalInputValue } from "../utils/newsDateInput"
import { useAdminI18n } from "./adminI18n"
import { CmsMediaUploadField } from "./CmsMediaUploadField"

type Props = {
  restJson: string
  onChange: (next: string) => void
}

function parseRest(raw: string): Record<string, unknown> {
  try {
    const p = JSON.parse(raw) as unknown
    if (p && typeof p === "object" && !Array.isArray(p)) {
      return p as Record<string, unknown>
    }
  } catch {
    /* ignore */
  }
  return {}
}

function stringifyRest(r: Record<string, unknown>): string {
  return JSON.stringify(r, null, 2)
}

function asObjectArray(v: unknown): Record<string, unknown>[] {
  if (!Array.isArray(v)) {
    return []
  }
  return v.filter((x) => x && typeof x === "object" && !Array.isArray(x)) as Record<string, unknown>[]
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) {
    return []
  }
  return v.map((x) => (typeof x === "string" ? x : String(x ?? "")))
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v)
}

export function LandingCollectionsEditor({ restJson, onChange }: Props) {
  const { t } = useAdminI18n()
  const doc = parseRest(restJson)
  const patch = (p: Record<string, unknown>) => onChange(stringifyRest({ ...parseRest(restJson), ...p }))

  const programs = asObjectArray(doc.programs)
  const highlights = asObjectArray(doc.highlights)
  const stats = asObjectArray(doc.stats)
  const news = asObjectArray(doc.news)
  const gallery = asObjectArray(doc.gallery)
  const partners = asObjectArray(doc.partners)
  const admissionSteps = asObjectArray(doc.admissionSteps)
  const articleCards = asObjectArray(doc.articleCards)
  const mediaTicker = asStringArray(doc.mediaTicker)
  const policyBullets = asStringArray(doc.policyBullets)

  const ex = doc.excellence && typeof doc.excellence === "object" && !Array.isArray(doc.excellence)
    ? (doc.excellence as Record<string, unknown>)
    : {}
  const vt = doc.virtualTour && typeof doc.virtualTour === "object" && !Array.isArray(doc.virtualTour)
    ? (doc.virtualTour as Record<string, unknown>)
    : {}
  const articlesLead = str(doc.articlesSectionLead)

  const wk = doc.whyKoon && typeof doc.whyKoon === "object" && !Array.isArray(doc.whyKoon)
    ? (doc.whyKoon as Record<string, unknown>)
    : {}

  return (
    <Stack gap="md">
      <div>
        <Title order={5}>{t("admin.landingBlocks.title")}</Title>
        <Text size="sm" c="dimmed">
          {t("admin.landingBlocks.desc")}
        </Text>
      </div>

      <Accordion multiple variant="separated">
        <Accordion.Item value="programs">
          <Accordion.Control>{t("admin.landingBlocks.programs")}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {programs.map((row, i) => (
                <Paper key={i} withBorder p="sm" radius="sm">
                  <Group grow align="flex-start">
                    <TextInput
                      label={t("admin.landingBlocks.idOptional")}
                      value={str(row.id)}
                      onChange={(e) => {
                        const next = [...programs]
                        next[i] = { ...next[i], id: e.currentTarget.value }
                        patch({ programs: next })
                      }}
                    />
                    <TextInput
                      label={t("admin.contentEditor.pageTitleField")}
                      value={str(row.name)}
                      onChange={(e) => {
                        const next = [...programs]
                        next[i] = { ...next[i], name: e.currentTarget.value }
                        patch({ programs: next })
                      }}
                    />
                  </Group>
                  <Textarea
                    mt="xs"
                    label={t("admin.contentEditor.pageDescription")}
                    minRows={2}
                    value={str(row.description)}
                    onChange={(e) => {
                      const next = [...programs]
                      next[i] = { ...next[i], description: e.currentTarget.value }
                      patch({ programs: next })
                    }}
                  />
                  <TextInput
                    mt="xs"
                    label="annualFee"
                    value={str(row.annualFee)}
                    onChange={(e) => {
                      const next = [...programs]
                      next[i] = { ...next[i], annualFee: e.currentTarget.value }
                      patch({ programs: next })
                    }}
                  />
                  <Button
                    mt="xs"
                    size="compact-xs"
                    color="red"
                    variant="light"
                    onClick={() => patch({ programs: programs.filter((_, j) => j !== i) })}
                  >
                    {t("admin.landingBlocks.removeRow")}
                  </Button>
                </Paper>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() => patch({ programs: [...programs, { id: "", name: "", description: "", annualFee: "" }] })}
              >
                {t("admin.landingBlocks.addRow")}
              </Button>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="highlights">
          <Accordion.Control>{t("admin.landingBlocks.highlights")}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {highlights.map((row, i) => (
                <Paper key={i} withBorder p="sm" radius="sm">
                  <TextInput
                    label={t("admin.landingBlocks.idOptional")}
                    value={str(row.id)}
                    onChange={(e) => {
                      const next = [...highlights]
                      next[i] = { ...next[i], id: e.currentTarget.value }
                      patch({ highlights: next })
                    }}
                  />
                  <TextInput
                    mt="xs"
                    label={t("admin.contentEditor.heroTitle")}
                    value={str(row.title)}
                    onChange={(e) => {
                      const next = [...highlights]
                      next[i] = { ...next[i], title: e.currentTarget.value }
                      patch({ highlights: next })
                    }}
                  />
                  <Textarea
                    mt="xs"
                    label={t("admin.contentEditor.pageDescription")}
                    minRows={2}
                    value={str(row.description)}
                    onChange={(e) => {
                      const next = [...highlights]
                      next[i] = { ...next[i], description: e.currentTarget.value }
                      patch({ highlights: next })
                    }}
                  />
                  <Button
                    mt="xs"
                    size="compact-xs"
                    color="red"
                    variant="light"
                    onClick={() => patch({ highlights: highlights.filter((_, j) => j !== i) })}
                  >
                    {t("admin.landingBlocks.removeRow")}
                  </Button>
                </Paper>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() => patch({ highlights: [...highlights, { id: "", title: "", description: "" }] })}
              >
                {t("admin.landingBlocks.addRow")}
              </Button>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="stats">
          <Accordion.Control>{t("admin.landingBlocks.stats")}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {stats.map((row, i) => (
                <Paper key={i} withBorder p="sm" radius="sm">
                  <Group grow>
                    <TextInput
                      label={t("admin.landingBlocks.idOptional")}
                      value={str(row.id)}
                      onChange={(e) => {
                        const next = [...stats]
                        next[i] = { ...next[i], id: e.currentTarget.value }
                        patch({ stats: next })
                      }}
                    />
                    <TextInput
                      label="value"
                      value={str(row.value)}
                      onChange={(e) => {
                        const next = [...stats]
                        next[i] = { ...next[i], value: e.currentTarget.value }
                        patch({ stats: next })
                      }}
                    />
                    <TextInput
                      label="label"
                      value={str(row.label)}
                      onChange={(e) => {
                        const next = [...stats]
                        next[i] = { ...next[i], label: e.currentTarget.value }
                        patch({ stats: next })
                      }}
                    />
                  </Group>
                  <Button
                    mt="xs"
                    size="compact-xs"
                    color="red"
                    variant="light"
                    onClick={() => patch({ stats: stats.filter((_, j) => j !== i) })}
                  >
                    {t("admin.landingBlocks.removeRow")}
                  </Button>
                </Paper>
              ))}
              <Button size="xs" variant="light" onClick={() => patch({ stats: [...stats, { value: "", label: "" }] })}>
                {t("admin.landingBlocks.addRow")}
              </Button>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="news">
          <Accordion.Control>{t("admin.landingBlocks.news")}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {news.map((row, i) => (
                <Paper key={i} withBorder p="sm" radius="sm">
                  <TextInput
                    label={t("admin.landingBlocks.idOptional")}
                    value={str(row.id)}
                    onChange={(e) => {
                      const next = [...news]
                      next[i] = { ...next[i], id: e.currentTarget.value }
                      patch({ news: next })
                    }}
                  />
                  <TextInput
                    mt="xs"
                    label={t("admin.contentEditor.heroTitle")}
                    value={str(row.title)}
                    onChange={(e) => {
                      const next = [...news]
                      next[i] = { ...next[i], title: e.currentTarget.value }
                      patch({ news: next })
                    }}
                  />
                  <Textarea
                    mt="xs"
                    label={t("admin.contentEditor.pageDescription")}
                    minRows={2}
                    value={str(row.excerpt)}
                    onChange={(e) => {
                      const next = [...news]
                      next[i] = { ...next[i], excerpt: e.currentTarget.value }
                      patch({ news: next })
                    }}
                  />
                  <TextInput
                    mt="xs"
                    type="date"
                    label={t("admin.news.fieldDate")}
                    value={toDateInputValue(str(row.date))}
                    onChange={(e) => {
                      const next = [...news]
                      next[i] = { ...next[i], date: e.currentTarget.value }
                      patch({ news: next })
                    }}
                  />
                  <CmsMediaUploadField
                    label="image URL"
                    value={str(row.image)}
                    onChange={(url) => {
                      const next = [...news]
                      next[i] = { ...next[i], image: url }
                      patch({ news: next })
                    }}
                  />
                  <Button
                    mt="xs"
                    size="compact-xs"
                    color="red"
                    variant="light"
                    onClick={() => patch({ news: news.filter((_, j) => j !== i) })}
                  >
                    {t("admin.landingBlocks.removeRow")}
                  </Button>
                </Paper>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() => patch({ news: [...news, { id: "", title: "", excerpt: "", date: "", image: "" }] })}
              >
                {t("admin.landingBlocks.addRow")}
              </Button>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="gallery">
          <Accordion.Control>{t("admin.landingBlocks.gallery")}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {gallery.map((row, i) => (
                <Paper key={i} withBorder p="sm" radius="sm">
                  <TextInput
                    label={t("admin.landingBlocks.idOptional")}
                    value={str(row.id)}
                    onChange={(e) => {
                      const next = [...gallery]
                      next[i] = { ...next[i], id: e.currentTarget.value }
                      patch({ gallery: next })
                    }}
                  />
                  <CmsMediaUploadField
                    label="src URL"
                    value={str(row.src)}
                    onChange={(url) => {
                      const next = [...gallery]
                      next[i] = { ...next[i], src: url }
                      patch({ gallery: next })
                    }}
                  />
                  <TextInput
                    mt="xs"
                    label="alt"
                    value={str(row.alt)}
                    onChange={(e) => {
                      const next = [...gallery]
                      next[i] = { ...next[i], alt: e.currentTarget.value }
                      patch({ gallery: next })
                    }}
                  />
                  <TextInput
                    mt="xs"
                    label="caption"
                    value={str(row.caption)}
                    onChange={(e) => {
                      const next = [...gallery]
                      next[i] = { ...next[i], caption: e.currentTarget.value }
                      patch({ gallery: next })
                    }}
                  />
                  <NativeSelect
                    mt="xs"
                    label={t("admin.landingBlocks.mediaKind")}
                    data={[
                      { value: "image", label: "image" },
                      { value: "video", label: "video" },
                    ]}
                    value={row.mediaKind === "video" ? "video" : "image"}
                    onChange={(e) => {
                      const next = [...gallery]
                      next[i] = { ...next[i], mediaKind: e.currentTarget.value }
                      patch({ gallery: next })
                    }}
                  />
                  <Button
                    mt="xs"
                    size="compact-xs"
                    color="red"
                    variant="light"
                    onClick={() => patch({ gallery: gallery.filter((_, j) => j !== i) })}
                  >
                    {t("admin.landingBlocks.removeRow")}
                  </Button>
                </Paper>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() =>
                  patch({
                    gallery: [...gallery, { id: "", src: "", alt: "", caption: "", mediaKind: "image" }],
                  })
                }
              >
                {t("admin.landingBlocks.addRow")}
              </Button>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="partners">
          <Accordion.Control>{t("admin.landingBlocks.partners")}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {partners.map((row, i) => (
                <Paper key={i} withBorder p="sm" radius="sm">
                  <Group grow>
                    <TextInput
                      label={t("admin.landingBlocks.idOptional")}
                      value={str(row.id)}
                      onChange={(e) => {
                        const next = [...partners]
                        next[i] = { ...next[i], id: e.currentTarget.value }
                        patch({ partners: next })
                      }}
                    />
                    <TextInput
                      label="name"
                      value={str(row.name)}
                      onChange={(e) => {
                        const next = [...partners]
                        next[i] = { ...next[i], name: e.currentTarget.value }
                        patch({ partners: next })
                      }}
                    />
                    <TextInput
                      label="abbreviation"
                      value={str(row.abbreviation)}
                      onChange={(e) => {
                        const next = [...partners]
                        next[i] = { ...next[i], abbreviation: e.currentTarget.value }
                        patch({ partners: next })
                      }}
                    />
                  </Group>
                  <Button
                    mt="xs"
                    size="compact-xs"
                    color="red"
                    variant="light"
                    onClick={() => patch({ partners: partners.filter((_, j) => j !== i) })}
                  >
                    {t("admin.landingBlocks.removeRow")}
                  </Button>
                </Paper>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() => patch({ partners: [...partners, { id: "", name: "", abbreviation: "" }] })}
              >
                {t("admin.landingBlocks.addRow")}
              </Button>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="admissionSteps">
          <Accordion.Control>{t("admin.landingBlocks.admissionSteps")}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {admissionSteps.map((row, i) => (
                <Paper key={i} withBorder p="sm" radius="sm">
                  <TextInput
                    label={t("admin.landingBlocks.idOptional")}
                    value={str(row.id)}
                    onChange={(e) => {
                      const next = [...admissionSteps]
                      next[i] = { ...next[i], id: e.currentTarget.value }
                      patch({ admissionSteps: next })
                    }}
                  />
                  <TextInput
                    mt="xs"
                    label={t("admin.contentEditor.heroTitle")}
                    value={str(row.title)}
                    onChange={(e) => {
                      const next = [...admissionSteps]
                      next[i] = { ...next[i], title: e.currentTarget.value }
                      patch({ admissionSteps: next })
                    }}
                  />
                  <Textarea
                    mt="xs"
                    label="description (shown as blurb on site)"
                    minRows={2}
                    value={str(row.description)}
                    onChange={(e) => {
                      const next = [...admissionSteps]
                      next[i] = { ...next[i], description: e.currentTarget.value }
                      patch({ admissionSteps: next })
                    }}
                  />
                  <Button
                    mt="xs"
                    size="compact-xs"
                    color="red"
                    variant="light"
                    onClick={() => patch({ admissionSteps: admissionSteps.filter((_, j) => j !== i) })}
                  >
                    {t("admin.landingBlocks.removeRow")}
                  </Button>
                </Paper>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() =>
                  patch({ admissionSteps: [...admissionSteps, { id: "", title: "", description: "" }] })
                }
              >
                {t("admin.landingBlocks.addRow")}
              </Button>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="articleCards">
          <Accordion.Control>{t("admin.landingBlocks.articleCards")}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {articleCards.map((row, i) => (
                <Paper key={i} withBorder p="sm" radius="sm">
                  <TextInput
                    label={t("admin.landingBlocks.idOptional")}
                    value={str(row.id)}
                    onChange={(e) => {
                      const next = [...articleCards]
                      next[i] = { ...next[i], id: e.currentTarget.value }
                      patch({ articleCards: next })
                    }}
                  />
                  <TextInput
                    mt="xs"
                    label={t("admin.contentEditor.heroTitle")}
                    value={str(row.title)}
                    onChange={(e) => {
                      const next = [...articleCards]
                      next[i] = { ...next[i], title: e.currentTarget.value }
                      patch({ articleCards: next })
                    }}
                  />
                  <Textarea
                    mt="xs"
                    label={t("admin.contentEditor.pageDescription")}
                    minRows={2}
                    value={str(row.excerpt)}
                    onChange={(e) => {
                      const next = [...articleCards]
                      next[i] = { ...next[i], excerpt: e.currentTarget.value }
                      patch({ articleCards: next })
                    }}
                  />
                  <TextInput
                    mt="xs"
                    label="meta"
                    value={str(row.meta)}
                    onChange={(e) => {
                      const next = [...articleCards]
                      next[i] = { ...next[i], meta: e.currentTarget.value }
                      patch({ articleCards: next })
                    }}
                  />
                  <TextInput
                    mt="xs"
                    type="datetime-local"
                    label={t("admin.growing.fieldPublishedAt")}
                    value={toDatetimeLocalInputValue(str(row.publishedAt))}
                    onChange={(e) => {
                      const v = e.currentTarget.value
                      const next = [...articleCards]
                      next[i] = { ...next[i], publishedAt: v ? new Date(v).toISOString() : "" }
                      patch({ articleCards: next })
                    }}
                  />
                  <Button
                    mt="xs"
                    size="compact-xs"
                    color="red"
                    variant="light"
                    onClick={() => patch({ articleCards: articleCards.filter((_, j) => j !== i) })}
                  >
                    {t("admin.landingBlocks.removeRow")}
                  </Button>
                </Paper>
              ))}
              <Button
                size="xs"
                variant="light"
                onClick={() =>
                  patch({ articleCards: [...articleCards, { id: "", title: "", excerpt: "", meta: "", publishedAt: "" }] })
                }
              >
                {t("admin.landingBlocks.addRow")}
              </Button>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="lists">
          <Accordion.Control>{t("admin.landingBlocks.mediaTicker")} / {t("admin.landingBlocks.policyBullets")}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Textarea
                label={t("admin.landingBlocks.mediaTicker")}
                description={t("admin.landingBlocks.onePerLine")}
                minRows={4}
                value={mediaTicker.join("\n")}
                onChange={(e) =>
                  patch({
                    mediaTicker: e.currentTarget.value.split("\n"),
                  })
                }
              />
              <Textarea
                label={t("admin.landingBlocks.policyBullets")}
                description={t("admin.landingBlocks.onePerLine")}
                minRows={4}
                value={policyBullets.join("\n")}
                onChange={(e) =>
                  patch({
                    policyBullets: e.currentTarget.value.split("\n"),
                  })
                }
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="whyKoon">
          <Accordion.Control>{t("admin.landingBlocks.whyKoon")}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <TextInput
                label={t("admin.landingBlocks.whyKoonEyebrow")}
                value={str(wk.eyebrow)}
                onChange={(e) => patch({ whyKoon: { ...wk, eyebrow: e.currentTarget.value } })}
              />
              <TextInput
                label={t("admin.landingBlocks.whyKoonTitle")}
                value={str(wk.title)}
                onChange={(e) => patch({ whyKoon: { ...wk, title: e.currentTarget.value } })}
              />
              <Textarea
                label={t("admin.landingBlocks.whyKoonLead")}
                minRows={3}
                value={str(wk.lead)}
                onChange={(e) => patch({ whyKoon: { ...wk, lead: e.currentTarget.value } })}
              />
              <Text size="sm" fw={600}>
                {t("admin.landingBlocks.whyKoonVision")}
              </Text>
              <TextInput
                label={t("admin.landingBlocks.whyKoonColumnLabel")}
                value={str(wk.visionLabel)}
                onChange={(e) => patch({ whyKoon: { ...wk, visionLabel: e.currentTarget.value } })}
              />
              <Textarea
                label={t("admin.landingBlocks.whyKoonColumnBody")}
                minRows={2}
                value={str(wk.visionText)}
                onChange={(e) => patch({ whyKoon: { ...wk, visionText: e.currentTarget.value } })}
              />
              <Text size="sm" fw={600}>
                {t("admin.landingBlocks.whyKoonMission")}
              </Text>
              <TextInput
                label={t("admin.landingBlocks.whyKoonColumnLabel")}
                value={str(wk.missionLabel)}
                onChange={(e) => patch({ whyKoon: { ...wk, missionLabel: e.currentTarget.value } })}
              />
              <Textarea
                label={t("admin.landingBlocks.whyKoonColumnBody")}
                minRows={2}
                value={str(wk.missionText)}
                onChange={(e) => patch({ whyKoon: { ...wk, missionText: e.currentTarget.value } })}
              />
              <Text size="sm" fw={600}>
                {t("admin.landingBlocks.whyKoonPhilosophy")}
              </Text>
              <TextInput
                label={t("admin.landingBlocks.whyKoonColumnLabel")}
                value={str(wk.philosophyLabel)}
                onChange={(e) => patch({ whyKoon: { ...wk, philosophyLabel: e.currentTarget.value } })}
              />
              <Textarea
                label={t("admin.landingBlocks.whyKoonColumnBody")}
                minRows={2}
                value={str(wk.philosophyText)}
                onChange={(e) => patch({ whyKoon: { ...wk, philosophyText: e.currentTarget.value } })}
              />
              <Text size="sm" fw={600}>
                {t("admin.landingBlocks.whyKoonAccordion")}
              </Text>
              <TextInput
                label={t("admin.landingBlocks.whyKoonAccordionSummary")}
                value={str(wk.accordionSummary)}
                onChange={(e) => patch({ whyKoon: { ...wk, accordionSummary: e.currentTarget.value } })}
              />
              <Textarea
                label={t("admin.landingBlocks.whyKoonAccordionLead")}
                minRows={4}
                value={str(wk.accordionLead)}
                onChange={(e) => patch({ whyKoon: { ...wk, accordionLead: e.currentTarget.value } })}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="excellence">
          <Accordion.Control>{t("admin.landingBlocks.excellence")}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <TextInput
                label={t("admin.contentEditor.pageTitleField")}
                value={str(ex.title)}
                onChange={(e) => patch({ excellence: { ...ex, title: e.currentTarget.value } })}
              />
              <Textarea
                label={t("admin.contentEditor.pageDescription")}
                minRows={3}
                value={str(ex.body)}
                onChange={(e) => patch({ excellence: { ...ex, body: e.currentTarget.value } })}
              />
              <Textarea
                label={t("admin.landingBlocks.excellenceBullets")}
                description={t("admin.landingBlocks.onePerLine")}
                minRows={4}
                value={asStringArray(ex.bullets).join("\n")}
                onChange={(e) =>
                  patch({
                    excellence: {
                      ...ex,
                      bullets: e.currentTarget.value.split("\n").filter((l) => l.trim().length > 0),
                    },
                  })
                }
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="virtualTour">
          <Accordion.Control>{t("admin.landingBlocks.virtualTour")}</Accordion.Control>
          <Accordion.Panel>
            <Textarea
              label="note"
              minRows={2}
              value={str(vt.note)}
              onChange={(e) => patch({ virtualTour: { ...vt, note: e.currentTarget.value } })}
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="articlesLead">
          <Accordion.Control>{t("admin.landingBlocks.articlesLead")}</Accordion.Control>
          <Accordion.Panel>
            <Textarea
              minRows={3}
              value={articlesLead}
              onChange={(e) => patch({ articlesSectionLead: e.currentTarget.value })}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  )
}
