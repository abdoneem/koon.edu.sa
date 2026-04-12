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
  onClick,
}: {
  item: SiteNavItem
  navLinkClassName: NavLinkClass
  onClick?: () => void
}) {
  const rel = item.openInNewTab ? "noopener noreferrer" : undefined
  const target = item.openInNewTab ? "_blank" : undefined

  if (useNativeAnchor(item.href)) {
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

  return (
    <NavLink to={item.href} className={navLinkClassName} onClick={onClick} end={item.href === "/"}>
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

function MainNavDesktopBranch({ items, navLinkClassName }: { items: SiteNavItem[]; navLinkClassName: NavLinkClass }) {
  return (
    <>
      {items.map((item) => {
        const kids = filteredChildren(item)
        if (kids.length > 0) {
          return (
            <details key={item.id} className="main-nav__dropdown">
              <summary className="main-nav__summary">{item.label}</summary>
              <div className="main-nav__dropdown-panel">
                <MainNavDesktopBranch items={kids} navLinkClassName={navLinkClassName} />
              </div>
            </details>
          )
        }
        return <NavMenuLeaf key={item.id} item={item} navLinkClassName={navLinkClassName} />
      })}
    </>
  )
}

export function MainNavMenuDesktop({
  items,
  navLinkClassName,
}: {
  items: SiteNavItem[]
  navLinkClassName: NavLinkClass
}) {
  return <MainNavDesktopBranch items={items} navLinkClassName={navLinkClassName} />
}

export function MainNavMenuMobile({
  items,
  navLinkClassName,
  onNavigate,
  depth = 0,
}: {
  items: SiteNavItem[]
  navLinkClassName: NavLinkClass
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
              <MainNavMenuMobile items={kids} navLinkClassName={navLinkClassName} onNavigate={onNavigate} depth={depth + 1} />
            </div>
          )
        }
        return (
          <NavMenuLeaf key={item.id} item={item} navLinkClassName={navLinkClassName} onClick={onNavigate} />
        )
      })}
    </div>
  )
}
