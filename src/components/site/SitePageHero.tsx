/**
 * Internal page hero — optional full-bleed photo with scrim; otherwise premium gradient band.
 */
interface SitePageHeroProps {
  /** Optional small label above the title (hidden when empty). */
  eyebrow?: string
  title: string
  /** Optional intro under the title (hidden when empty). */
  lead?: string
  /** Optional second line (e.g. registration hotline context) */
  sublead?: string
  /** Background photo (cover); paired with imageAlt for accessibility */
  imageSrc?: string
  imageAlt?: string
}

export function SitePageHero({ eyebrow, title, lead, sublead, imageSrc, imageAlt = "" }: SitePageHeroProps) {
  const hasMedia = Boolean(imageSrc)
  const showEyebrow = Boolean(eyebrow?.trim())
  const showLead = Boolean(lead?.trim())

  return (
    <header
      className={["site-page-hero", hasMedia ? "site-page-hero--media" : "site-page-hero--gradient"].filter(Boolean).join(" ")}
    >
      {hasMedia ? (
        <div className="site-page-hero__media">
          <img
            className="site-page-hero__img"
            src={imageSrc}
            alt={imageAlt}
            width={1600}
            height={900}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      ) : null}
      {hasMedia ? <div className="site-page-hero__scrim" aria-hidden /> : null}

      <div className="container site-page-hero__inner">
        {showEyebrow ? <span className="home-eyebrow home-eyebrow--on-dark">{eyebrow}</span> : null}
        <h1 className="home-display home-display--light">{title}</h1>
        {showLead ? <p className="home-lead home-lead--light site-page-hero__lead">{lead}</p> : null}
        {sublead ? (
          <p className="home-lead home-lead--light site-page-hero__sublead">{sublead}</p>
        ) : null}
      </div>
    </header>
  )
}
