import { NavLink } from "react-router-dom"
import type { SiteNavItem } from "../types/siteNav"

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

/** Hash or mailto/tel — use native anchor. */
function useNativeAnchor(href: string): boolean {
  return isExternalHref(href) || href.includes("#") || href.toLowerCase().startsWith("mailto:") || href.toLowerCase().startsWith("tel:")
}

type NavLinkClass = ({ isActive }: { isActive: boolean }) => string | undefined

function NavMenuLeaf({
  item,
  navLinkClassName,
  localizeHref,
  onClick,
}: {
  item: SiteNavItem
  navLinkClassName: NavLinkClass
  localizeHref?: (href: string) => string
  onClick?: () => void
}) {
  const rel = item.openInNewTab ? "noopener noreferrer" : undefined
  const target = item.openInNewTab ? "_blank" : undefined
  const native = useNativeAnchor(item.href)

  if (native) {
    return (
      <a
        href={item.href}
        className={navLinkClassName({ isActive: false }) ?? undefined}
        onClick={onClick}
        target={target}
        rel={rel}
      >
        {item.label}
      </a>
    )
  }

  const to = localizeHref ? localizeHref(item.href) : item.href
  return (
    <NavLink to={to} className={navLinkClassName} onClick={onClick} end={item.href === "/"}>
      {item.label}
    </NavLink>
  )
}

function filteredChildren(item: SiteNavItem): SiteNavItem[] {
  if (!item.children?.length) {
    return []
  }
  return item.children.filter((c) => c.label.trim() && c.href.trim())
}

function MainNavDesktopBranch({
  items,
  navLinkClassName,
  localizeHref,
}: {
  items: SiteNavItem[]
  navLinkClassName: NavLinkClass
  localizeHref?: (href: string) => string
}) {
  return (
    <>
      {items.map((item) => {
        const kids = filteredChildren(item)
        if (kids.length > 0) {
          return (
            <details key={item.id} className="main-nav__dropdown">
              <summary className="main-nav__summary">{item.label}</summary>
              <div className="main-nav__dropdown-panel">
                <MainNavDesktopBranch items={kids} navLinkClassName={navLinkClassName} localizeHref={localizeHref} />
              </div>
            </details>
          )
        }
        return <NavMenuLeaf key={item.id} item={item} navLinkClassName={navLinkClassName} localizeHref={localizeHref} />
      })}
    </>
  )
}

export function MainNavMenuDesktop({
  items,
  navLinkClassName,
  localizeHref,
}: {
  items: SiteNavItem[]
  navLinkClassName: NavLinkClass
  localizeHref?: (href: string) => string
}) {
  return <MainNavDesktopBranch items={items} navLinkClassName={navLinkClassName} localizeHref={localizeHref} />
}

export function MainNavMenuMobile({
  items,
  navLinkClassName,
  localizeHref,
  onNavigate,
  depth = 0,
}: {
  items: SiteNavItem[]
  navLinkClassName: NavLinkClass
  localizeHref?: (href: string) => string
  onNavigate?: () => void
  depth?: number
}) {
  return (
    <div className={depth > 0 ? "mobile-nav__sub" : undefined} data-depth={depth}>
      {items.map((item) => {
        const kids = filteredChildren(item)
        if (kids.length > 0) {
          return (
            <div key={item.id} className="mobile-nav__group">
              <div className="mobile-nav__group-label">{item.label}</div>
              <MainNavMenuMobile
                items={kids}
                navLinkClassName={navLinkClassName}
                localizeHref={localizeHref}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            </div>
          )
        }
        return (
          <NavMenuLeaf
            key={item.id}
            item={item}
            navLinkClassName={navLinkClassName}
            localizeHref={localizeHref}
            onClick={onNavigate}
          />
        )
      })}
    </div>
  )
}
