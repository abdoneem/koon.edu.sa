import { Button, Checkbox, Group, Paper, Stack, TextInput } from "@mantine/core"
import type { SiteNavItem } from "../types/siteNav"
import { useAdminI18n } from "./adminI18n"

export function newSiteNavItemId(): string {
  return `nav_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export function newEmptySiteNavItem(): SiteNavItem {
  return { id: newSiteNavItemId(), label: "", href: "/" }
}

function NavItemEditor({
  item,
  depth,
  onChangeItem,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  item: SiteNavItem
  depth: number
  onChangeItem: (next: SiteNavItem) => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const { t } = useAdminI18n()
  const children = item.children ?? []

  const swapChild = (a: number, b: number) => {
    const nextChildren = [...children]
    ;[nextChildren[a], nextChildren[b]] = [nextChildren[b], nextChildren[a]]
    onChangeItem({ ...item, children: nextChildren })
  }

  return (
    <Paper withBorder p="sm" radius="sm" style={{ marginInlineStart: depth ? Math.min(depth * 14, 56) : 0 }}>
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Button.Group>
            {onMoveUp ? (
              <Button variant="default" type="button" size="xs" onClick={onMoveUp}>
                ↑
              </Button>
            ) : null}
            {onMoveDown ? (
              <Button variant="default" type="button" size="xs" onClick={onMoveDown}>
                ↓
              </Button>
            ) : null}
          </Button.Group>
          <Button color="red" variant="subtle" size="xs" type="button" onClick={onRemove}>
            {t("admin.siteNav.remove")}
          </Button>
        </Group>
        <TextInput
          label={t("admin.siteNav.label")}
          value={item.label}
          onChange={(e) => onChangeItem({ ...item, label: e.currentTarget.value })}
        />
        <TextInput
          label={t("admin.siteNav.href")}
          description={t("admin.siteNav.hrefHint")}
          value={item.href}
          onChange={(e) => onChangeItem({ ...item, href: e.currentTarget.value })}
        />
        <Checkbox
          label={t("admin.siteNav.openNewTab")}
          checked={item.openInNewTab === true}
          onChange={(e) => onChangeItem({ ...item, openInNewTab: e.currentTarget.checked })}
        />
        <Stack gap="sm">
          {children.map((child, ci) => (
            <NavItemEditor
              key={child.id}
              item={child}
              depth={depth + 1}
              onChangeItem={(next) => {
                const nextChildren = [...children]
                nextChildren[ci] = next
                onChangeItem({ ...item, children: nextChildren })
              }}
              onRemove={() => {
                const nextChildren = children.filter((_, j) => j !== ci)
                onChangeItem({ ...item, children: nextChildren.length ? nextChildren : undefined })
              }}
              onMoveUp={ci > 0 ? () => swapChild(ci, ci - 1) : undefined}
              onMoveDown={ci < children.length - 1 ? () => swapChild(ci, ci + 1) : undefined}
            />
          ))}
        </Stack>
        <Button
          size="xs"
          variant="light"
          type="button"
          onClick={() =>
            onChangeItem({
              ...item,
              children: [...children, newEmptySiteNavItem()],
            })
          }
        >
          {t("admin.siteNav.addChild")}
        </Button>
      </Stack>
    </Paper>
  )
}

export function SiteNavEditor({ value, onChange }: { value: SiteNavItem[]; onChange: (next: SiteNavItem[]) => void }) {
  const { t } = useAdminI18n()

  const swapTop = (a: number, b: number) => {
    const copy = [...value]
    ;[copy[a], copy[b]] = [copy[b], copy[a]]
    onChange(copy)
  }

  return (
    <Stack gap="md">
      {value.map((item, index) => (
        <NavItemEditor
          key={item.id}
          item={item}
          depth={0}
          onChangeItem={(next) => {
            const copy = [...value]
            copy[index] = next
            onChange(copy)
          }}
          onRemove={() => onChange(value.filter((_, i) => i !== index))}
          onMoveUp={index > 0 ? () => swapTop(index, index - 1) : undefined}
          onMoveDown={index < value.length - 1 ? () => swapTop(index, index + 1) : undefined}
        />
      ))}
      <Button variant="light" type="button" onClick={() => onChange([...value, newEmptySiteNavItem()])}>
        {t("admin.siteNav.addTopLevel")}
      </Button>
    </Stack>
  )
}
