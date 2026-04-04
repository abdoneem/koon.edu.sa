import {
  IconBolt,
  IconBooks,
  IconBrandSnapchat,
  IconBrandX,
  IconBrandYoutube,
  IconClock,
  IconEye,
  IconFileCheck,
  IconFlag,
  IconHeadset,
  IconMail,
  IconMapPin,
  IconPhone,
  IconRocket,
  IconSend,
  IconSparkles,
  IconTrendingUp,
} from "@tabler/icons-react"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { brand } from "../../config/brand"
import { studentLifeBlockImage } from "../../content/siteImagery"
import type { HomePageBundle } from "../../types/homePageBundle"
import { coalesceArray, coalesceString } from "../../utils/coalesce"
import { HomeBookTourForm } from "./HomeBookTourForm"
import { HomePortalCards } from "./HomePortalCards"

interface Props {
  bundle: HomePageBundle
}

const VALUE_ICONS = [IconFlag, IconTrendingUp, IconSparkles, IconEye, IconBolt] as const

const ADMISSIONS_STEP_ICONS = [IconMapPin, IconBooks, IconSend, IconFileCheck] as const

export function HomeLandingSections({ bundle }: Props) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  const highlights = coalesceArray(
    t("highlights.items", { returnObjects: true }) as { id: string; title: string; description: string }[],
    bundle.highlights,
  )
  const stages = t("academicsStagesDetail", { returnObjects: true }) as Record<string, string>
  const studentBlocks = t("studentLifePage.blocks", { returnObjects: true }) as {
    title: string
    description: string
    photoAlt: string
  }[]
  const policiesBullets = coalesceArray(
    t("admissionsPage.policiesBullets", { returnObjects: true }) as string[],
    bundle.policyBullets,
  )
  const admissionsSteps = t("homePage.admissionsSteps", { returnObjects: true }) as {
    id: string
    title: string
    blurb: string
  }[]

  const excellenceBody = coalesceString(t("excellenceCorner.body"), bundle.excellence.body)
  const articlesIntro = coalesceString(t("articlesTeaser.body"), bundle.articlesSectionLead)

  return (
    <>
      <section id="why-koon" className="home-section home-section--why" aria-labelledby="home-why-heading">
        <div className="home-section__bg home-section__bg--mesh" aria-hidden />
        <div className="container home-section__inner">
          <div className="home-why-bento">
            <div className="home-why-bento__intro">
              <span className="home-eyebrow">{t("highlights.eyebrow")}</span>
              <h2 id="home-why-heading" className="home-display">
                {t("highlights.title")}
              </h2>
              {t("highlights.lead") ? (
                <p className="home-lead home-lead--on-dark home-lead--tight">{t("highlights.lead")}</p>
              ) : null}
              <div className="home-identity-strip" aria-label={t("homePage.identityAria")}>
                <div className="home-identity-strip__item">
                  <span className="home-identity-strip__label">{t("aboutExtended.visionBlockTitle")}</span>
                  <p className="home-identity-strip__text">{t("aboutExtended.visionBlockBody")}</p>
                </div>
                <div className="home-identity-strip__item">
                  <span className="home-identity-strip__label">{t("aboutExtended.missionBlockTitle")}</span>
                  <p className="home-identity-strip__text">{t("homePage.missionSummary")}</p>
                </div>
                <div className="home-identity-strip__item">
                  <span className="home-identity-strip__label">{t("homePage.philosophyLabel")}</span>
                  <p className="home-identity-strip__text">{t("homePage.philosophySummary")}</p>
                </div>
              </div>
              <details className="home-m-accordion home-m-accordion--why">
                <summary className="home-m-accordion__summary">{t("homePage.accordionPhilosophy")}</summary>
                <div className="home-m-accordion__panel">
                  <p className="home-lead home-lead--on-dark home-why-lead-columns">{t("whyKoonPage.lead")}</p>
                </div>
              </details>
            </div>
            <ul className="home-value-grid home-value-grid--bento">
              {highlights.map((item, i) => {
                const ValueIcon = VALUE_ICONS[i % VALUE_ICONS.length]
                return (
                  <li key={item.id ?? item.title} className="home-grid-item-li">
                    <motion.div
                      className={`home-value-tile home-value-tile--${(i % 5) + 1}`}
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.42, delay: reduce ? 0 : i * 0.04 }}
                    >
                      <span className="home-value-tile__icon" aria-hidden>
                        <ValueIcon size={28} stroke={1.5} />
                      </span>
                      <span className="home-value-tile__idx" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </motion.div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      <section id="academics-preview" className="home-section home-section--muted">
        <div className="container home-section__inner">
          <div className="home-split">
            <div className="home-split__intro">
              <span className="home-eyebrow home-eyebrow--navy">{stages.title}</span>
              <h2 className="home-display">{t("academicsPage.title")}</h2>
              <p className="home-lead home-lead--tight">{t("academicsPage.lead")}</p>
              <Link to="/academics" className="home-btn home-btn--primary">
                {t("homePage.ctaFullPage")}
              </Link>
            </div>
            <details className="home-m-accordion home-m-accordion--stages">
              <summary className="home-m-accordion__summary">{t("homePage.accordionStages")}</summary>
              <div className="home-m-accordion__panel">
                <div className="home-stage-list">
                  <article className="home-stage-pill">
                    <h3>{stages.earlyTitle}</h3>
                    <p>{stages.earlyBody}</p>
                  </article>
                  <article className="home-stage-pill">
                    <h3>{stages.primaryTitle}</h3>
                    <p>{stages.primaryBody}</p>
                  </article>
                  <article className="home-stage-pill">
                    <h3>{stages.middleTitle}</h3>
                    <p>{stages.middleBody}</p>
                  </article>
                  <article className="home-stage-pill">
                    <h3>{stages.highTitle}</h3>
                    <p>{stages.highBody}</p>
                  </article>
                </div>
              </div>
            </details>
          </div>

          <div className="home-programs-block">
            <div className="home-programs-block__head">
              <span className="home-eyebrow">{t("homePage.programsEyebrow")}</span>
              <h3 className="home-display home-display--sm">{t("homePage.programsGridTitle")}</h3>
              <p className="home-lead home-lead--tight">{t("homePage.programsLead")}</p>
            </div>
            <ul className="home-program-grid home-program-grid--three">
              {bundle.programs.map((prog, i) => (
                <li key={prog.id ?? prog.name} className="home-grid-item-li">
                  <motion.div
                    className="home-program-card"
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-24px" }}
                    transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.03 }}
                  >
                    <h3 className="home-program-card__title">{prog.name}</h3>
                    <p className="home-program-card__desc">{prog.description}</p>
                    <p className="home-program-card__fee">{prog.annualFee}</p>
                    <Link to="/academics" className="home-program-card__cta">
                      {t("homePage.programDetailCta")}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <div className="home-programs-block__foot">
              <a href="#book-tour" className="home-btn home-btn--hero-book home-btn--lg">
                {t("nav.bookVisit")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="admissions" className="home-section home-section--surface home-section--admissions">
        <div className="container home-section__inner">
          <header className="home-adm-section-head">
            <span className="home-eyebrow home-eyebrow--navy">{t("homePage.admissionsEyebrow")}</span>
            <h2 className="home-display">{t("homePage.admissionsHeadline")}</h2>
            <p className="home-lead home-lead--tight">{t("homePage.admissionsSubline")}</p>
          </header>

          <div className="home-adm-trust" role="list" aria-label={t("homePage.admissionsTrustAria")}>
            <div className="home-adm-trust__item" role="listitem">
              <span className="home-adm-trust__icon" aria-hidden>
                <IconRocket size={22} stroke={1.6} />
              </span>
              <div>
                <span className="home-adm-trust__label">{t("homePage.admissionsTrustFast")}</span>
                <span className="home-adm-trust__hint">{t("homePage.admissionsTrustFastHint")}</span>
              </div>
            </div>
            <div className="home-adm-trust__item" role="listitem">
              <span className="home-adm-trust__icon" aria-hidden>
                <IconHeadset size={22} stroke={1.6} />
              </span>
              <div>
                <span className="home-adm-trust__label">{t("homePage.admissionsTrustSupport")}</span>
                <span className="home-adm-trust__hint">{t("homePage.admissionsTrustSupportHint")}</span>
              </div>
            </div>
            <div className="home-adm-trust__item" role="listitem">
              <span className="home-adm-trust__icon" aria-hidden>
                <IconClock size={22} stroke={1.6} />
              </span>
              <div>
                <span className="home-adm-trust__label">{t("homePage.admissionsTrustResponse")}</span>
                <span className="home-adm-trust__hint">{t("homePage.admissionsTrustResponseHint")}</span>
              </div>
            </div>
          </div>

          <div className="home-adm-layout home-adm-layout--conversion">
            <div className="home-adm-track card-elevated">
              <ol className="home-adm-funnel-steps" aria-label={t("admissionsPage.title")}>
                {admissionsSteps.map((step, i) => {
                  const StepIcon = ADMISSIONS_STEP_ICONS[i] ?? IconBolt
                  return (
                    <li key={step.id} className="home-adm-funnel-step">
                      <div className="home-adm-funnel-step__iconWrap" aria-hidden>
                        <StepIcon size={24} stroke={1.5} />
                      </div>
                      <div className="home-adm-funnel-step__body">
                        <span className="home-adm-funnel-step__num">{i + 1}</span>
                        <h3 className="home-adm-funnel-step__title">{step.title}</h3>
                        <p className="home-adm-funnel-step__blurb">{step.blurb}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>

              <details className="home-m-accordion home-m-accordion--adm-policies">
                <summary className="home-m-accordion__summary">{t("homePage.accordionAdmissionPolicies")}</summary>
                <div className="home-m-accordion__panel">
                  <ul className="home-adm-checks home-adm-checks--policies">
                    {policiesBullets.map((b) => (
                      <li key={b.slice(0, 40)}>{b}</li>
                    ))}
                  </ul>
                </div>
              </details>
            </div>

            <div className="home-adm-cta card-elevated home-adm-cta--accent home-adm-cta--mobile-first">
              <span className="home-eyebrow home-eyebrow--on-dark">{t("homePage.admissionsEyebrow")}</span>
              <p className="home-adm-cta__hook">{t("homePage.admissionsCtaHook")}</p>
              <div className="home-adm-cta__actions">
                <Link
                  to="/registration"
                  className="home-btn home-btn--primary home-btn--lg home-btn--wide home-adm-cta__primary"
                >
                  {t("nav.registration")}
                </Link>
                <a href="#book-tour" className="home-btn home-btn--hero-book home-btn--lg home-btn--wide">
                  {t("nav.bookVisit")}
                </a>
                <Link to="/admissions" className="home-btn home-btn--on-dark home-btn--lg home-btn--wide">
                  {t("homePage.ctaAdmissionsDetail")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="student-life" className="home-section">
        <div className="container home-section__inner">
          <header className="home-section__head home-section__head--center">
            <h2 className="home-display">{t("studentLifePage.title")}</h2>
            <p className="home-lead">{t("studentLifePage.lead")}</p>
            <div className="home-section__cta-row">
              <Link to="/student-life" className="home-btn home-btn--primary">
                {t("homePage.ctaFullPage")}
              </Link>
              <a href="#book-tour" className="home-btn home-btn--hero-book">
                {t("nav.bookVisit")}
              </a>
            </div>
          </header>
          <div className="home-life-grid home-life-grid--adaptive" role="list">
            {studentBlocks.map((b, i) => (
              <article key={b.title} className="home-life-card" role="listitem">
                <div className="home-life-card__media">
                  <img src={studentLifeBlockImage(i)} alt={b.photoAlt} width={640} height={360} loading="lazy" />
                </div>
                <div className="home-life-card__body">
                  <h3>{b.title}</h3>
                  <p>{b.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="facilities" className="home-section home-section--mint">
        <div className="container home-section__inner">
          <header className="home-section__head">
            <h2 className="home-display">{t("facilitiesPage.title")}</h2>
            <p className="home-lead">{t("facilitiesPage.lead")}</p>
          </header>
          <ul className="home-facility-grid" aria-label={t("facilitiesPage.title")}>
            {[t("homePage.facilitiesSpotlight1"), t("homePage.facilitiesSpotlight2"), t("homePage.facilitiesSpotlight3"), t("homePage.facilitiesSpotlight4")].map((label, i) => (
              <li key={label} className="home-facility-card">
                <span className="home-facility-card__idx" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="home-facility-card__label">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="accreditations" className="home-section home-section--trust">
        <div className="container home-section__inner">
          <header className="home-section__head home-section__head--center">
            <h2 className="home-display">{t("accreditations.title")}</h2>
            <p className="home-lead">{t("accreditations.body")}</p>
          </header>
          <ul className="home-partner-row" role="list" aria-label={t("accreditations.title")}>
            {bundle.partners.map((p) => (
              <li key={p.id} className="home-partner-badge">
                <span className="home-partner-badge__mark" aria-hidden>
                  {p.abbreviation}
                </span>
                <span className="home-partner-badge__name">{p.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="excellence" className="home-section home-section--surface">
        <div className="container home-section__inner">
          <div className="home-excellence-bento card-elevated">
            <div className="home-excellence-bento__copy">
              <span className="home-eyebrow">{t("excellenceCorner.subtitle")}</span>
              <h2 className="home-display home-display--sm">{t("excellenceCorner.title")}</h2>
              <p className="home-lead home-lead--tight">{excellenceBody}</p>
            </div>
            <details className="home-m-accordion home-m-accordion--excellence">
              <summary className="home-m-accordion__summary">{t("homePage.accordionExcellenceBullets")}</summary>
              <div className="home-m-accordion__panel">
                <ul className="home-excellence-bullets" aria-label={t("homePage.excellenceListAria")}>
                  {bundle.excellence.bullets.map((line) => (
                    <li key={line} className="home-excellence-bullet-card">
                      <span className="home-excellence-bullet-card__mark" aria-hidden>
                        ✓
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section id="articles" className="home-section home-section--muted">
        <div className="container home-section__inner">
          <header className="home-section__head">
            <h2 className="home-display">{t("articlesTeaser.title")}</h2>
            <p className="home-lead">{articlesIntro}</p>
          </header>
          <details className="home-m-accordion home-m-accordion--articles">
            <summary className="home-m-accordion__summary">{t("homePage.accordionArticles")}</summary>
            <div className="home-m-accordion__panel">
              <ul className="home-editorial-grid" role="list">
                {bundle.articleCards.map((a) => (
                  <li key={a.id} className="home-editorial-card">
                    <span className="home-editorial-card__meta">{a.meta}</span>
                    <h3>{a.title}</h3>
                    <p>{a.excerpt}</p>
                    <span className="home-editorial-card__faux-link">{t("homePage.ctaFullPage")}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </section>

      <section id="media" className="home-section home-section--dark">
        <div className="container home-section__inner">
          <header className="home-section__head home-section__head--center home-section__head--light">
            <h2 className="home-display home-display--light">{t("mediaCenterPage.title")}</h2>
            <p className="home-lead home-lead--light">{t("mediaCenterPage.intro")}</p>
          </header>
          {bundle.news.length > 0 ? (
            <div className="home-media-news-block">
              <div className="home-media-news-block__head">
                <h3 className="home-subdisplay home-subdisplay--light">{t("mediaCenterPage.newsTitle")}</h3>
                <Link to="/news" className="home-text-link home-text-link--on-dark">
                  {t("mediaCenterPage.newsAllLabel")}
                </Link>
              </div>
              <ul className="home-media-news-list" aria-label={t("mediaCenterPage.newsTitle")}>
                {bundle.news.slice(0, 4).map((item) => (
                  <li key={item.id} className="home-media-news-list__item">
                    <a href="#news" className="home-media-news-list__link">
                      <span className="home-media-news-list__title">{item.title}</span>
                      {item.date ? (
                        <time className="home-media-news-list__date" dateTime={item.date}>
                          {item.date}
                        </time>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {bundle.mediaTicker.length > 0 ? (
            <ul className="home-media-spotlight-grid" aria-label={t("mediaCenterPage.spotlightAria")}>
              {bundle.mediaTicker.slice(0, 4).map((line, i) => (
                <li key={`${i}-${line.slice(0, 24)}`} className="home-media-spotlight-card">
                  <span className="home-media-spotlight-card__text">{line}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <ul
            className="home-gallery-grid home-gallery-grid--four"
            aria-label={t("mediaCenterPage.galleryTitle")}
          >
            {bundle.gallery.map((g) => {
              const kind = g.mediaKind === "video" ? "video" : "image"
              return (
                <li key={g.id} className="home-gallery-tile">
                  <div className="home-gallery-tile__media">
                    <span className={`home-gallery-tile__badge home-gallery-tile__badge--${kind}`}>
                      {kind === "video" ? t("mediaCenterPage.badgeVideo") : t("mediaCenterPage.badgeImage")}
                    </span>
                    <img src={g.src} alt={g.alt} width={960} height={540} loading="lazy" />
                    <div className="home-gallery-tile__overlay">
                      <span className="home-gallery-tile__title">{g.caption}</span>
                      <span className="home-gallery-tile__link">{t("homePage.galleryCta")}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="home-media-social-label">{t("mediaCenterPage.socialTitle")}</p>
          <div className="home-social-chips">
            <a
              className="home-social-chip"
              href={brand.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("mediaCenterPage.socialYoutubeAria")}
            >
              <IconBrandYoutube size={22} stroke={1.5} aria-hidden />
            </a>
            <a
              className="home-social-chip"
              href={brand.social.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("mediaCenterPage.socialXAria")}
            >
              <IconBrandX size={22} stroke={1.5} aria-hidden />
            </a>
            <a
              className="home-social-chip"
              href={brand.social.snapchat}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("mediaCenterPage.socialSnapchatAria")}
            >
              <IconBrandSnapchat size={22} stroke={1.5} aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <section id="portals" className="home-section">
        <div className="container home-section__inner">
          <header className="home-section__head home-section__head--center">
            <h2 className="home-display">{t("portalsPage.title")}</h2>
            <p className="home-lead">{t("portalsPage.intro")}</p>
          </header>
          <HomePortalCards />
        </div>
      </section>

      <section id="book-tour" className="home-section home-section--book">
        <div className="container home-section__inner home-book-split">
          <div className="home-book-copy card-elevated">
            <h2 className="home-display">{t("bookTourPage.title")}</h2>
            <details className="home-m-accordion home-m-accordion--book">
              <summary className="home-m-accordion__summary">{t("homePage.accordionBookDetails")}</summary>
              <div className="home-m-accordion__panel">
                <p className="home-lead">{t("bookTourPage.intro")}</p>
                <ul className="home-contact-links">
                  <li>
                    <a className="home-contact-links__row" href={`tel:${t("footer.phone")}`}>
                      <span className="home-contact-links__icon" aria-hidden>
                        <IconPhone size={22} stroke={1.75} />
                      </span>
                      <span className="home-contact-links__text">{t("footer.phone")}</span>
                    </a>
                  </li>
                  <li>
                    <a className="home-contact-links__row" href={`mailto:${t("footer.email")}`}>
                      <span className="home-contact-links__icon" aria-hidden>
                        <IconMail size={22} stroke={1.75} />
                      </span>
                      <span className="home-contact-links__text">{t("footer.email")}</span>
                    </a>
                  </li>
                </ul>
              </div>
            </details>
          </div>
          <div className="home-book-form-shell home-book-form-shell--mobile-first">
            <HomeBookTourForm />
          </div>
        </div>
      </section>

      <section id="virtual-tour" className="home-section home-section--surface">
        <div className="container home-section__inner home-virtual-split">
          <div className="home-virtual-copy card-elevated">
            <h2 className="home-display">{t("virtualTourPage.title")}</h2>
            <details className="home-m-accordion home-m-accordion--virtual">
              <summary className="home-m-accordion__summary">{t("homePage.accordionVirtualMore")}</summary>
              <div className="home-m-accordion__panel">
                <p className="home-lead">{t("virtualTourPage.body")}</p>
              </div>
            </details>
          </div>
          <div
            className="home-virtual-preview card-elevated home-virtual-preview--mobile-first"
            role="region"
            aria-label={t("virtualTourPage.title")}
          >
            <div className="home-virtual-preview__icon" aria-hidden>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <p className="home-virtual-preview__note">{bundle.virtualTour.note}</p>
            <a href="#book-tour" className="home-btn home-btn--hero-book home-btn--wide">
              {t("homePage.virtualOpen")}
            </a>
          </div>
        </div>
      </section>

      <section id="ai-assistant" className="home-section home-section--ai">
        <div className="container home-section__inner">
          <div className="home-ai-panel card-elevated card-elevated--dark">
            <span className="home-ai-panel__badge" aria-hidden>
              AI
            </span>
            <div>
              <h2 className="home-display home-display--sm home-display--light">{t("chatbot.title")}</h2>
              <details className="home-m-accordion home-m-accordion--ai">
                <summary className="home-m-accordion__summary home-m-accordion__summary--on-dark">
                  {t("homePage.accordionAiMore")}
                </summary>
                <div className="home-m-accordion__panel">
                  <p className="home-lead home-lead--light">{t("chatbot.body")}</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
