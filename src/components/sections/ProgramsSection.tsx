import { useTranslation } from "react-i18next"
import { programImageForId } from "../../content/siteImagery"
import type { ProgramContent } from "../../types/cms"
import { IconBadge } from "../IconBadge"
import { IconAward, IconBook, IconSparkles, IconTrending } from "../icons/schoolIcons"

const programIconById: Record<string, typeof IconSparkles> = {
  ey: IconSparkles,
  el: IconBook,
  im: IconTrending,
  se: IconAward,
}

const PROGRAM_ALT_KEYS: Record<string, string> = {
  ey: "imagery.programEyAlt",
  el: "imagery.programElAlt",
  im: "imagery.programImAlt",
  se: "imagery.programSeAlt",
}

interface ProgramsSectionProps {
  title: string
  lead: string
  feeLabel: string
  programs: ProgramContent[]
}

export function ProgramsSection({ title, lead, feeLabel, programs }: ProgramsSectionProps) {
  const { t } = useTranslation()
  return (
    <section id="programs" className="section programs-section section-surface section-surface--azure">
      <div className="container">
        <div className="section-head section-head--with-mark section-head--accent">
          <span className="section-head__mark" aria-hidden>
            <IconBook className="section-head__mark-icon" size={28} />
          </span>
          <h2>{title}</h2>
          <p className="section-lead">{lead}</p>
        </div>
        <div className="cards-grid programs-grid">
          {programs.map((program) => {
            const imgSrc = program.id ? programImageForId(program.id) : undefined
            const altKey = program.id ? PROGRAM_ALT_KEYS[program.id] : undefined
            const alt = altKey ? t(altKey) : ""

            if (!imgSrc) {
              const Ic = (program.id && programIconById[program.id]) || IconBook
              return (
                <article key={program.id || program.name} className="card program-card">
                  <IconBadge variant="default">
                    <Ic className="icon-badge__svg" size={22} />
                  </IconBadge>
                  <h3>{program.name}</h3>
                  <p>{program.description}</p>
                  <p className="fee">
                    {feeLabel}: <strong>{program.annualFee}</strong>
                  </p>
                </article>
              )
            }

            return (
              <article
                key={program.id || program.name}
                className="card program-card program-card--stage"
              >
                <div className="program-card__stage">
                  <img
                    src={imgSrc}
                    alt={alt}
                    width={640}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="program-card__stage-img"
                  />
                  <div className="program-card__stage-scrim" aria-hidden="true" />
                  <div className="program-card__stage-content">
                    <h3>{program.name}</h3>
                    <p className="program-card__stage-desc">{program.description}</p>
                  </div>
                  <div className="program-card__stage-fee">
                    <p className="fee fee--on-dark">
                      {feeLabel}: <strong>{program.annualFee}</strong>
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
