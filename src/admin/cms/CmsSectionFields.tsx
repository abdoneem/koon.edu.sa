import { Button, Divider, Group, Paper, Select, Stack, Switch, Text, Textarea, TextInput, Title } from "@mantine/core"
import type { TFunction } from "i18next"
import type { ComponentProps } from "react"
import { useEffect, useState } from "react"
import { CmsImageField } from "./CmsImageField"
import type { CmsSectionItemRow, CmsSectionRow } from "./cmsEditorTypes"

type Props = {
  section: CmsSectionRow
  imageUrlOptions: string[]
  pending: boolean
  t: TFunction
  sectionTypes: readonly { value: string; label: string }[]
  onPatchSection: (s: CmsSectionRow, p: Partial<CmsSectionRow>) => void | Promise<void>
  onPatchItem: (it: CmsSectionItemRow, p: Partial<CmsSectionItemRow>) => void | Promise<void>
  onDeleteItem: (itemId: number) => void | Promise<void>
  onSwapItems: (a: CmsSectionItemRow, b: CmsSectionItemRow) => void | Promise<void>
  onAddItem: (sectionId: number, initial?: Partial<CmsSectionItemRow>) => void | Promise<void>
  onDeleteSection: (sectionId: number) => void | Promise<void>
}

function BlurTextInput({
  value,
  onCommit,
  ...rest
}: Omit<ComponentProps<typeof TextInput>, "onChange"> & {
  value: string
  onCommit: (v: string) => void
}) {
  const [local, setLocal] = useState(value)
  useEffect(() => setLocal(value), [value])
  return (
    <TextInput
      {...rest}
      value={local}
      onChange={(e) => setLocal(e.currentTarget.value)}
      onBlur={() => {
        if (local !== value) {
          onCommit(local)
        }
      }}
    />
  )
}

function BlurTextarea({
  value,
  onCommit,
  minRows = 3,
  ...rest
}: Omit<ComponentProps<typeof Textarea>, "onChange"> & {
  value: string
  onCommit: (v: string) => void
}) {
  const [local, setLocal] = useState(value)
  useEffect(() => setLocal(value), [value])
  return (
    <Textarea
      {...rest}
      minRows={minRows}
      value={local}
      onChange={(e) => setLocal(e.currentTarget.value)}
      onBlur={() => {
        if (local !== value) {
          onCommit(local)
        }
      }}
    />
  )
}

export function CmsSectionFields({
  section: sec,
  imageUrlOptions,
  pending,
  t,
  sectionTypes,
  onPatchSection,
  onPatchItem,
  onDeleteItem,
  onSwapItems,
  onAddItem,
  onDeleteSection,
}: Props) {
  const sortedItems = [...sec.items].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
  const type = sec.type

  const sectionMeta = (
    <Stack gap="sm">
      <Group grow>
        <Select
          label={t("admin.cmsEditor.sectionType")}
          data={[...sectionTypes]}
          value={sec.type}
          disabled={pending}
          onChange={(v) => {
            if (v) {
              void onPatchSection(sec, { type: v })
            }
          }}
        />
        <TextInput
          label={t("admin.cmsEditor.orderLabel")}
          type="number"
          defaultValue={String(sec.sort_order)}
          key={`sec-ord-${sec.id}-${sec.sort_order}`}
          disabled={pending}
          onBlur={(e) => {
            const v = parseInt(e.currentTarget.value, 10)
            if (!Number.isNaN(v)) {
              void onPatchSection(sec, { sort_order: v })
            }
          }}
        />
      </Group>
      <BlurTextInput
        label={t("admin.cmsEditor.sectionTitle")}
        value={sec.title ?? ""}
        disabled={pending}
        onCommit={(v) => void onPatchSection(sec, { title: v || null })}
      />
      <BlurTextInput
        label={t("admin.cmsEditor.sectionSubtitle")}
        value={sec.subtitle ?? ""}
        disabled={pending}
        description={type === "text" ? t("admin.cmsEditor.textSectionSubtitleHint") : undefined}
        onCommit={(v) => void onPatchSection(sec, { subtitle: v || null })}
      />
      <Switch
        label={t("admin.cmsEditor.sectionActive")}
        checked={sec.is_active}
        disabled={pending}
        onChange={(e) => void onPatchSection(sec, { is_active: e.currentTarget.checked })}
      />
    </Stack>
  )

  if (type === "text") {
    const first = sortedItems[0]
    const body = first?.description ?? ""
    return (
      <Stack gap="md">
        {sectionMeta}
        <Divider label={t("admin.cmsEditor.textBodyHeading")} labelPosition="center" />
        <BlurTextarea
          label={t("admin.cmsEditor.textBodyLabel")}
          description={t("admin.cmsEditor.textBodyDesc")}
          value={body}
          disabled={pending}
          minRows={6}
          onCommit={(v) => {
            if (!first) {
              void onAddItem(sec.id, { title: null, description: v || null, sort_order: 0 })
              return
            }
            void onPatchItem(first, { description: v || null })
          }}
        />
        {!first ? (
          <Button size="xs" variant="light" disabled={pending} onClick={() => void onAddItem(sec.id, { sort_order: 0 })}>
            {t("admin.cmsEditor.textCreateBodyItem")}
          </Button>
        ) : null}
        {first && sortedItems.length > 1 ? (
          <Text size="sm" c="dimmed">
            {t("admin.cmsEditor.textMultipleItemsNote")}
          </Text>
        ) : null}
        <Button color="red" variant="light" size="xs" disabled={pending} onClick={() => void onDeleteSection(sec.id)}>
          {t("admin.cmsEditor.deleteSection")}
        </Button>
      </Stack>
    )
  }

  if (type === "faq") {
    return (
      <Stack gap="md">
        {sectionMeta}
        <Divider label={t("admin.cmsEditor.faqItemsHeading")} labelPosition="center" />
        <Group justify="space-between">
          <Title order={6}>{t("admin.cmsEditor.faqItemsTitle")}</Title>
          <Button size="xs" leftSection={"+"} disabled={pending} onClick={() => void onAddItem(sec.id)}>
            {t("admin.cmsEditor.addFaqItem")}
          </Button>
        </Group>
        {sortedItems.length === 0 ? (
          <Text c="dimmed" size="sm">
            {t("admin.cmsEditor.noItemsYet")}
          </Text>
        ) : (
          <Stack gap="md">
            {sortedItems.map((it, itemIdx) => (
              <Paper key={it.id} withBorder p="md" radius="md">
                <Stack gap="sm">
                  <BlurTextInput
                    label={t("admin.cmsEditor.faqQuestion")}
                    value={it.title ?? ""}
                    disabled={pending}
                    onCommit={(v) => void onPatchItem(it, { title: v || null })}
                  />
                  <BlurTextarea
                    label={t("admin.cmsEditor.faqAnswer")}
                    value={it.description ?? ""}
                    disabled={pending}
                    minRows={3}
                    onCommit={(v) => void onPatchItem(it, { description: v || null })}
                  />
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Button
                        size="compact-xs"
                        variant="default"
                        disabled={pending || itemIdx === 0}
                        onClick={() => {
                          const prev = sortedItems[itemIdx - 1]
                          if (prev) {
                            void onSwapItems(it, prev)
                          }
                        }}
                      >
                        {t("admin.cmsEditor.moveUp")}
                      </Button>
                      <Button
                        size="compact-xs"
                        variant="default"
                        disabled={pending || itemIdx >= sortedItems.length - 1}
                        onClick={() => {
                          const next = sortedItems[itemIdx + 1]
                          if (next) {
                            void onSwapItems(it, next)
                          }
                        }}
                      >
                        {t("admin.cmsEditor.moveDown")}
                      </Button>
                    </Group>
                    <Button size="compact-xs" color="red" variant="light" disabled={pending} onClick={() => void onDeleteItem(it.id)}>
                      {t("admin.cmsEditor.delete")}
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
        <Button color="red" variant="light" size="xs" disabled={pending} onClick={() => void onDeleteSection(sec.id)}>
          {t("admin.cmsEditor.deleteSection")}
        </Button>
      </Stack>
    )
  }

  if (type === "gallery") {
    return (
      <Stack gap="md">
        {sectionMeta}
        <Divider label={t("admin.cmsEditor.galleryItemsHeading")} labelPosition="center" />
        <Group justify="flex-end">
          <Button size="xs" disabled={pending} onClick={() => void onAddItem(sec.id)}>
            {t("admin.cmsEditor.addGalleryItem")}
          </Button>
        </Group>
        {sortedItems.length === 0 ? (
          <Text c="dimmed" size="sm">
            {t("admin.cmsEditor.noItemsYet")}
          </Text>
        ) : (
          <Stack gap="lg">
            {sortedItems.map((it, itemIdx) => (
              <Paper key={it.id} withBorder p="md" radius="md">
                <Stack gap="sm">
                  <CmsImageField
                    label={t("admin.cmsEditor.galleryImage")}
                    description={t("admin.cmsEditor.galleryImageDesc")}
                    value={it.image ?? ""}
                    recentUrls={imageUrlOptions}
                    disabled={pending}
                    t={t}
                    onCommit={(url) => void onPatchItem(it, { image: url || null })}
                  />
                  <BlurTextInput
                    label={t("admin.cmsEditor.galleryCaption")}
                    value={it.title ?? ""}
                    disabled={pending}
                    onCommit={(v) => void onPatchItem(it, { title: v || null })}
                  />
                  <BlurTextInput
                    label={t("admin.cmsEditor.itemLink")}
                    description={t("admin.cmsEditor.galleryLinkDesc")}
                    value={it.link ?? ""}
                    disabled={pending}
                    onCommit={(v) => void onPatchItem(it, { link: v || null })}
                  />
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Button
                        size="compact-xs"
                        variant="default"
                        disabled={pending || itemIdx === 0}
                        onClick={() => {
                          const prev = sortedItems[itemIdx - 1]
                          if (prev) {
                            void onSwapItems(it, prev)
                          }
                        }}
                      >
                        {t("admin.cmsEditor.moveUp")}
                      </Button>
                      <Button
                        size="compact-xs"
                        variant="default"
                        disabled={pending || itemIdx >= sortedItems.length - 1}
                        onClick={() => {
                          const next = sortedItems[itemIdx + 1]
                          if (next) {
                            void onSwapItems(it, next)
                          }
                        }}
                      >
                        {t("admin.cmsEditor.moveDown")}
                      </Button>
                    </Group>
                    <Button size="compact-xs" color="red" variant="light" disabled={pending} onClick={() => void onDeleteItem(it.id)}>
                      {t("admin.cmsEditor.delete")}
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
        <Button color="red" variant="light" size="xs" disabled={pending} onClick={() => void onDeleteSection(sec.id)}>
          {t("admin.cmsEditor.deleteSection")}
        </Button>
      </Stack>
    )
  }

  /* hero, cards, custom — card-style items */
  const isHero = type === "hero"
  const heading = isHero ? t("admin.cmsEditor.heroItemsHeading") : type === "cards" ? t("admin.cmsEditor.cardsItemsHeading") : t("admin.cmsEditor.customItemsHeading")

  return (
    <Stack gap="md">
      {sectionMeta}
      <Divider label={heading} labelPosition="center" />
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {isHero ? t("admin.cmsEditor.heroItemsHint") : type === "cards" ? t("admin.cmsEditor.cardsItemsHint") : t("admin.cmsEditor.customItemsHint")}
        </Text>
        <Button size="xs" disabled={pending} onClick={() => void onAddItem(sec.id)}>
          {t("admin.cmsEditor.addBlockItem")}
        </Button>
      </Group>
      {sortedItems.length === 0 ? (
        <Text c="dimmed" size="sm">
          {t("admin.cmsEditor.noItemsYet")}
        </Text>
      ) : (
        <Stack gap="lg">
          {sortedItems.map((it, itemIdx) => (
            <Paper key={it.id} withBorder p="md" radius="md">
              <Stack gap="sm">
                <BlurTextInput
                  label={t("admin.cmsEditor.itemTitle")}
                  value={it.title ?? ""}
                  disabled={pending}
                  onCommit={(v) => void onPatchItem(it, { title: v || null })}
                />
                <BlurTextarea
                  label={t("admin.cmsEditor.itemDescription")}
                  value={it.description ?? ""}
                  disabled={pending}
                  minRows={3}
                  onCommit={(v) => void onPatchItem(it, { description: v || null })}
                />
                <CmsImageField
                  label={t("admin.cmsEditor.itemImage")}
                  description={t("admin.cmsEditor.itemImageDesc")}
                  value={it.image ?? ""}
                  recentUrls={imageUrlOptions}
                  disabled={pending}
                  t={t}
                  onCommit={(url) => void onPatchItem(it, { image: url || null })}
                />
                {(type === "hero" || type === "custom") && (
                  <BlurTextInput
                    label={t("admin.cmsEditor.itemIcon")}
                    description={t("admin.cmsEditor.itemIconDesc")}
                    value={it.icon ?? ""}
                    disabled={pending}
                    onCommit={(v) => void onPatchItem(it, { icon: v || null })}
                  />
                )}
                <BlurTextInput
                  label={t("admin.cmsEditor.itemLink")}
                  value={it.link ?? ""}
                  disabled={pending}
                  onCommit={(v) => void onPatchItem(it, { link: v || null })}
                />
                <TextInput
                  label={t("admin.cmsEditor.itemOrder")}
                  type="number"
                  defaultValue={String(it.sort_order)}
                  key={`ord-${it.id}-${it.sort_order}`}
                  disabled={pending}
                  onBlur={(e) => {
                    const v = parseInt(e.currentTarget.value, 10)
                    if (!Number.isNaN(v)) {
                      void onPatchItem(it, { sort_order: v })
                    }
                  }}
                />
                <Group justify="space-between">
                  <Group gap="xs">
                    <Button
                      size="compact-xs"
                      variant="default"
                      disabled={pending || itemIdx === 0}
                      onClick={() => {
                        const prev = sortedItems[itemIdx - 1]
                        if (prev) {
                          void onSwapItems(it, prev)
                        }
                      }}
                    >
                      {t("admin.cmsEditor.moveUp")}
                    </Button>
                    <Button
                      size="compact-xs"
                      variant="default"
                      disabled={pending || itemIdx >= sortedItems.length - 1}
                      onClick={() => {
                        const next = sortedItems[itemIdx + 1]
                        if (next) {
                          void onSwapItems(it, next)
                        }
                      }}
                    >
                      {t("admin.cmsEditor.moveDown")}
                    </Button>
                  </Group>
                  <Button size="compact-xs" color="red" variant="light" disabled={pending} onClick={() => void onDeleteItem(it.id)}>
                    {t("admin.cmsEditor.delete")}
                  </Button>
                </Group>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
      <Button color="red" variant="light" size="xs" disabled={pending} onClick={() => void onDeleteSection(sec.id)}>
        {t("admin.cmsEditor.deleteSection")}
      </Button>
    </Stack>
  )
}
