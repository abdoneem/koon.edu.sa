import { IconBolt, IconEye, IconFlag, IconSparkles, IconTrendingUp } from "@tabler/icons-react"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { brand } from "../../config/brand"
import { studentLifeBlockImage } from "../../content/siteImagery"
import type { HomeAdmissionStep, HomePageBundle } from "../../types/homePageBundle"
import { coalesceArray, coalesceString } from "../../utils/coalesce"
import { NewsTicker } from "../NewsTicker"
import { HomeBookTourForm } from "./HomeBookTourForm"
import { HomePortalCards } from "./HomePortalCards"

interface Props {
  bundle: HomePageBundle
}

const VALUE_ICONS = [IconFlag, IconTrendingUp, IconSparkles, IconEye, IconBolt] as const

function admissionKey(step: HomeAdmissionStep | { title: string; description: string }, i: number) {
  if ("id" in step && step.id) {
    return step.id
  }
  return `${i}-${step.title.slice(0, 24)}`
}

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
  const i18nAdmissionSteps = t("admissionsPage.steps", { returnObjects: true }) as HomeAdmissionStep[] | undefined
  const admissionSteps = coalesceArray(i18nAdmissionSteps, bundle.admissionSteps)

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
              <p className="home-lead home-lead--on-dark home-why-lead-columns">{t("whyKoonPage.lead")}</p>
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
                <h3>{stages.secondaryTitle}</h3>
                <p>{stages.secondaryBody}</p>
              </article>
            </div>
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
                    <Link to="/admissions" className="home-program-card__cta">
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

      <section id="admissions" className="home-section home-section--surface">
        <div className="container home-section__inner">
          <div className="home-adm-layout">
            <div className="home-adm-steps card-elevated">
              <h2 className="home-display home-display--sm">{t("admissionsPage.campusTitle")}</h2>
              <ol className="home-stepper" aria-label={t("admissionsPage.title")}>
                {admissionSteps.map((step, i) => (
                  <li key={admissionKey(step, i)} className="home-stepper__item">
                    <span className="home-stepper__num" aria-hidden>
                      {i + 1}
                    </span>
                    <div>
                      <span className="home-stepper__title">{step.title}</span>
                      <p>{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="home-adm-checks-wrap card-elevated card-elevated--inset">
                <span className="home-adm-checks-label">{t("admissionsPage.policiesTitle")}</span>
                <ul className="home-adm-checks">
                  {policiesBullets.map((b) => (
                    <li key={b.slice(0, 40)}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="home-adm-cta card-elevated home-adm-cta--accent">
              <span className="home-eyebrow home-eyebrow--on-dark">{t("admissionsPage.title")}</span>
              <p className="home-adm-cta__text">{t("admissionsPage.description")}</p>
              <p className="home-adm-cta__highlight">{t("admissionsPage.campusLead")}</p>
              <div className="home-adm-cta__actions">
                <a href="#book-tour" className="home-btn home-btn--hero-book home-btn--lg home-btn--wide">
                  {t("nav.bookVisit")}
                </a>
                <Link to="/registration" className="home-btn home-btn--primary home-btn--lg home-btn--wide">
                  {t("nav.registration")}
                </Link>
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
          <div className="home-life-grid" role="list">
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
        </div>
      </section>

      <section id="articles" className="home-section home-section--muted">
        <div className="container home-section__inner">
          <header className="home-section__head">
            <h2 className="home-display">{t("articlesTeaser.title")}</h2>
            <p className="home-lead">{articlesIntro}</p>
          </header>
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
      </section>

      <section id="media" className="home-section home-section--dark">
        <div className="home-section__accent-line" aria-hidden />
        <div className="container home-section__inner">
          <header className="home-section__head home-section__head--center home-section__head--light">
            <h2 className="home-display home-display--light">{t("mediaCenterPage.title")}</h2>
            <p className="home-lead home-lead--light">{t("mediaCenterPage.intro")}</p>
          </header>
          <div className="home-ticker-shell">
            <NewsTicker fallbackItems={bundle.mediaTicker} />
          </div>
          <h3 className="home-subdisplay home-subdisplay--light">{t("mediaCenterPage.galleryTitle")}</h3>
          <ul className="home-gallery-grid home-gallery-grid--four" aria-label={t("mediaCenterPage.galleryTitle")}>
            {bundle.gallery.map((g) => (
              <li key={g.id} className="home-gallery-tile">
                <div className="home-gallery-tile__media">
                  <img src={g.src} alt={g.alt} width={960} height={540} loading="lazy" />
                  <div className="home-gallery-tile__overlay">
                    <span className="home-gallery-tile__kicker">{t("mediaCenterPage.galleryTitle")}</span>
                    <span className="home-gallery-tile__title">{g.caption}</span>
                    <span className="home-gallery-tile__link">{t("homePage.galleryCta")}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <h3 className="home-subdisplay home-subdisplay--light">{t("mediaCenterPage.socialTitle")}</h3>
          <div className="home-social-chips">
            <a className="home-social-chip" href={brand.social.youtube} target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
            <a className="home-social-chip" href={brand.social.x} target="_blank" rel="noopener noreferrer">
              X
            </a>
            <a className="home-social-chip" href={brand.social.snapchat} target="_blank" rel="noopener noreferrer">
              Snapchat
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
            <p className="home-lead">{t("bookTourPage.intro")}</p>
            <ul className="home-mini-list">
              <li>
                <a href={`tel:${t("footer.phone")}`}>{t("footer.phone")}</a>
              </li>
              <li>
                <a href={`mailto:${t("footer.email")}`}>{t("footer.email")}</a>
              </li>
            </ul>
          </div>
          <div className="home-book-form-shell">
            <HomeBookTourForm />
          </div>
        </div>
      </section>

      <section id="virtual-tour" className="home-section home-section--surface">
        <div className="container home-section__inner home-virtual-split">
          <div className="home-virtual-copy card-elevated">
            <h2 className="home-display">{t("virtualTourPage.title")}</h2>
            <p className="home-lead">{t("virtualTourPage.body")}</p>
          </div>
          <div className="home-virtual-preview card-elevated" role="region" aria-label={t("virtualTourPage.title")}>
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
              <p className="home-lead home-lead--light">{t("chatbot.body")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
