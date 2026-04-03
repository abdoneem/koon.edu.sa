import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { programImageForId } from "../../content/siteImagery"
import type { ProgramContent } from "../../types/cms"

interface HomeProgramsLuxuryProps {
  programs: ProgramContent[]
  feeLabel: string
}

export function HomeProgramsLuxury({ programs, feeLabel }: HomeProgramsLuxuryProps) {
  const { t } = useTranslation()

  return (
    <section className="hl-section hl-programs" id="programs" aria-labelledby="hl-prog-heading">
      <div className="hl-wrap">
        <p className="hl-kicker">{t("homeLuxury.programs.kicker")}</p>
        <h2 id="hl-prog-heading">{t("homeLuxury.programs.title")}</h2>
        <p className="hl-lead">{t("homeLuxury.programs.lead")}</p>
        <div className="hl-programs__grid">
          {programs.map((program) => {
            const src = program.id ? programImageForId(program.id) : undefined
            const aria = t("programs.cardAria", { name: program.name })

            return (
              <Link
                key={program.id || program.name}
                to="/academics"
                className="hl-prog-card"
                aria-label={aria}
              >
                <div className="hl-prog-card__img">
                  {src ? (
                    <img src={src} alt="" width={480} height={360} loading="lazy" decoding="async" />
                  ) : (
                    <div
                      style={{
                        background: "var(--lux-bg-panel)",
                        minHeight: "12rem",
                        width: "100%",
                        height: "100%",
                      }}
                      aria-hidden
                    />
                  )}
                </div>
                <div className="hl-prog-card__body">
                  <h3>{program.name}</h3>
                  <p>{program.description}</p>
                  <p className="hl-prog-card__fee">
                    {feeLabel}: <strong>{program.annualFee}</strong>
                  </p>
                  <span className="hl-prog-card__arrow">{t("homeLuxury.programs.explore")}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
