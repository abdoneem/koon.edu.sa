import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { CmsStructuredBlocks } from "../components/cms/CmsStructuredBlocks"
import { PageLayout } from "../components/PageLayout"
import { SitePageHero } from "../components/site/SitePageHero"
import { siteImagery, studentLifeBlockImage } from "../content/siteImagery"

type Block = { title: string; description: string; photoAlt: string }

export function StudentLifePage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const pathKey = pathname.replace(/\/$/, "") || "/"
  const reduce = useReducedMotion()

  const blocksRaw = t("studentLifePage.blocks", { returnObjects: true }) as Block[] | undefined
  const blocks = Array.isArray(blocksRaw) ? blocksRaw : []

  const moaeenSectionsRaw = t("studentLifePage.moaeenSections", { returnObjects: true }) as string[] | undefined
  const moaeenSections = Array.isArray(moaeenSectionsRaw) ? moaeenSectionsRaw : []

  const afaqSectionsRaw = t("studentLifePage.afaqSections", { returnObjects: true }) as string[] | undefined
  const afaqSections = Array.isArray(afaqSectionsRaw) ? afaqSectionsRaw : []

  const coachSectionsRaw = t("studentLifePage.coachSections", { returnObjects: true }) as string[] | undefined
  const coachSections = Array.isArray(coachSectionsRaw) ? coachSectionsRaw : []

  const employerBulletsRaw = t("studentLifeEmployer.bullets", { returnObjects: true }) as string[] | undefined
  const employerBullets = Array.isArray(employerBulletsRaw) ? employerBulletsRaw : []

  const motionBlock = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-32px" },
        transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <PageLayout>
      <div className="site-page-premium">
        <SitePageHero
          eyebrow={t("nav.studentLife")}
          title={t("studentLifePage.title")}
          lead={t("studentLifePage.lead")}
          imageSrc={siteImagery.pageHero.studentLife}
          imageAlt={t("studentLifePage.heroImageAlt")}
        />

        <CmsStructuredBlocks pathKey={pathKey} />

        <section className="home-section home-section--surface site-page-premium__band-first">
          <div className="container home-section__inner">
            {blocks.length > 0 ? (
              <ul className="site-life-pillar-grid" role="list">
                {blocks.map((b, i) => (
                  <li key={b.title}>
                    <motion.article className="card-elevated site-life-pillar-card" {...motionBlock}>
                      <div className="site-life-pillar-card__media">
                        <img
                          src={studentLifeBlockImage(i)}
                          alt={b.photoAlt}
                          width={800}
                          height={360}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="site-life-pillar-card__body">
                        <h2 className="home-display home-display--sm">{b.title}</h2>
                        <p className="site-pillar-card__desc">{b.description}</p>
                      </div>
                    </motion.article>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section className="home-section home-section--muted">
          <div className="container home-section__inner site-student-programs">
            {moaeenSections.length > 0 ? (
              <motion.article className="card-elevated site-prose-card" {...motionBlock}>
                <h2 className="home-display home-display--sm">{t("studentLifePage.sectionMoaeenTitle")}</h2>
                {moaeenSections.map((para) => (
                  <p key={para.slice(0, 48)} className="site-prose-card__para">
                    {para}
                  </p>
                ))}
              </motion.article>
            ) : null}
            {afaqSections.length > 0 ? (
              <motion.article className="card-elevated site-prose-card" {...motionBlock}>
                <h2 className="home-display home-display--sm">{t("studentLifePage.sectionAfaqTitle")}</h2>
                {afaqSections.map((para) => (
                  <p key={para.slice(0, 48)} className="site-prose-card__para">
                    {para}
                  </p>
                ))}
              </motion.article>
            ) : null}
            {coachSections.length > 0 ? (
              <motion.article className="card-elevated site-prose-card" {...motionBlock}>
                <h2 className="home-display home-display--sm">{t("studentLifePage.sectionCoachTitle")}</h2>
                {coachSections.map((para) => (
                  <p key={para.slice(0, 48)} className="site-prose-card__para">
                    {para}
                  </p>
                ))}
              </motion.article>
            ) : null}
          </div>
        </section>

        <section className="home-section home-section--surface">
          <div className="container home-section__inner">
            <motion.article className="card-elevated site-content-card" {...motionBlock}>
              <h2 className="home-display home-display--sm">{t("studentLifeEmployer.title")}</h2>
              <p className="home-lead home-lead--tight">{t("studentLifeEmployer.lead")}</p>
              {employerBullets.length > 0 ? (
                <ul className="site-bullet-list">
                  {employerBullets.map((item) => (
                    <li key={item.slice(0, 40)}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </motion.article>

            <div className="site-page-cta-row site-page-cta-row--surface">
              <Link to="/contact" className="home-btn home-btn--primary home-btn--lg">
                {t("nav.contact")}
              </Link>
              <Link to="/registration" className="home-btn home-btn--secondary home-btn--lg">
                {t("nav.registration")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
