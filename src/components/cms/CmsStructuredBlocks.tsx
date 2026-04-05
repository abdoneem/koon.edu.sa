import { motion, useReducedMotion } from "framer-motion"
import type { CmsPageBundleItem, CmsPageBundleSection } from "../../types/structuredCms"
import { useCmsPageForPath } from "../../hooks/useCmsPageForPath"

function safeAssetUrl(src: string | null | undefined): string | null {
  const s = typeof src === "string" ? src.trim() : ""
  if (!s) {
    return null
  }
  if (s.startsWith("https://") || s.startsWith("http://") || s.startsWith("/")) {
    return s
  }
  return `/${s.replace(/^\/+/, "")}`
}

function sortedItems(items: CmsPageBundleItem[]) {
  return [...items].sort((a, b) => a.order - b.order)
}

function CmsSectionBody({ section }: { section: CmsPageBundleSection }) {
  const items = sortedItems(section.items ?? [])
  const reduce = useReducedMotion()
  const motionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 } as const,
        whileInView: { opacity: 1, y: 0 } as const,
        viewport: { once: true, margin: "-24px" } as const,
        transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
      }

  if (section.type === "faq" && items.length > 0) {
    return (
      <div className="home-section__inner site-page-prose" style={{ maxWidth: "48rem" }}>
        {items.map((it) => (
          <details key={it.id} className="home-m-accordion home-m-accordion--cms">
            <summary className="home-m-accordion__summary">{it.title ?? ""}</summary>
            <div className="home-m-accordion__panel">
              {it.description ? <p className="home-lead">{it.description}</p> : null}
            </div>
          </details>
        ))}
      </div>
    )
  }

  if (section.type === "gallery" && items.some((it) => safeAssetUrl(it.image))) {
    return (
      <ul className="site-pillar-grid" role="list" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
        {items.map((it) => {
          const img = safeAssetUrl(it.image)
          if (!img) {
            return null
          }
          return (
            <li key={it.id}>
              <motion.figure className="card-elevated" style={{ margin: 0, overflow: "hidden" }} {...motionProps}>
                <img src={img} alt={it.title ?? ""} loading="lazy" decoding="async" style={{ width: "100%", display: "block" }} />
                {it.title ? (
                  <figcaption className="site-pillar-card__desc" style={{ padding: "0.75rem 1rem" }}>
                    {it.link ? (
                      <a href={it.link} className="home-text-link">
                        {it.title}
                      </a>
                    ) : (
                      it.title
                    )}
                  </figcaption>
                ) : null}
              </motion.figure>
            </li>
          )
        })}
      </ul>
    )
  }

  if ((section.type === "cards" || section.type === "hero") && items.length > 0) {
    return (
      <ul className="site-pillar-grid" role="list">
        {items.map((it) => {
          const ext = Boolean(it.link && /^https?:\/\//i.test(it.link))
          return (
            <li key={it.id}>
              <motion.article className="card-elevated site-pillar-card" {...motionProps}>
                {safeAssetUrl(it.image) ? (
                  <img
                    src={safeAssetUrl(it.image)!}
                    alt=""
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", borderRadius: "var(--radius-md, 8px)", marginBottom: "0.75rem" }}
                  />
                ) : null}
                {it.title ? <h3 className="home-display home-display--sm">{it.title}</h3> : null}
                {it.description ? <p className="site-pillar-card__desc">{it.description}</p> : null}
                {it.link ? (
                  <p className="site-pillar-card__desc">
                    <a
                      href={it.link}
                      className="home-text-link"
                      target={ext ? "_blank" : undefined}
                      rel={ext ? "noopener noreferrer" : undefined}
                    >
                      {it.title ?? it.link}
                    </a>
                  </p>
                ) : null}
              </motion.article>
            </li>
          )
        })}
      </ul>
    )
  }

  /* text, custom, or items as prose */
  if (items.length === 0) {
    return null
  }

  if (items.length === 1 && !items[0].title && items[0].description) {
    return (
      <div className="site-page-prose">
        <p className="home-lead site-page-prose__para">{items[0].description}</p>
      </div>
    )
  }

  return (
    <ul className="site-pillar-grid" role="list">
      {items.map((it) => {
        const ext = Boolean(it.link && /^https?:\/\//i.test(it.link))
        return (
          <li key={it.id}>
            <motion.article className="card-elevated site-content-card" {...motionProps}>
              {it.title ? <h3 className="home-display home-display--sm">{it.title}</h3> : null}
              {it.description ? <p className="site-pillar-card__desc">{it.description}</p> : null}
              {it.link ? (
                <p className="site-pillar-card__desc">
                  <a
                    href={it.link}
                    className="home-text-link"
                    target={ext ? "_blank" : undefined}
                    rel={ext ? "noopener noreferrer" : undefined}
                  >
                    {it.title ?? it.link}
                  </a>
                </p>
              ) : null}
            </motion.article>
          </li>
        )
      })}
    </ul>
  )
}

function CmsSectionBlock({ section, surface }: { section: CmsPageBundleSection; surface: "surface" | "muted" }) {
  const mod = surface === "surface" ? "home-section--surface" : "home-section--muted"
  const hasHeader = Boolean(section.title?.trim() || section.subtitle?.trim())

  return (
    <section className={`home-section ${mod}`} aria-labelledby={hasHeader ? `cms-sec-${section.id}` : undefined}>
      <div className="container home-section__inner">
        {hasHeader ? (
          <header className="home-section__head">
            {section.title?.trim() ? (
              <h2 id={`cms-sec-${section.id}`} className="home-display">
                {section.title}
              </h2>
            ) : null}
            {section.subtitle?.trim() ? <p className="home-lead">{section.subtitle}</p> : null}
          </header>
        ) : null}
        <CmsSectionBody section={section} />
      </div>
    </section>
  )
}

type Props = {
  /** Normalized path, e.g. `/about` */
  pathKey: string
}

/**
 * Renders structured CMS sections when a published page exists for this path.
 * Uses existing premium page layout classes only (no new visual system).
 */
export function CmsStructuredBlocks({ pathKey }: Props) {
  const { active, loading, sections } = useCmsPageForPath(pathKey)

  if (loading || !active || sections.length === 0) {
    return null
  }

  return (
    <>
      {sections.map((sec, i) => (
        <CmsSectionBlock key={sec.id} section={sec} surface={i % 2 === 0 ? "surface" : "muted"} />
      ))}
    </>
  )
}
