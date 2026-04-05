import { motion, useReducedMotion } from "framer-motion"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useCmsSite } from "../../context/CmsSiteContext"

export function AdmissionsFunnelSection() {
  const { t } = useTranslation()
  const { whatsappHref } = useCmsSite()
  const reduce = useReducedMotion()

  const stepLinks = useMemo(
    () =>
      [
        { href: "/contact", external: false as const, btnClass: "btn-primary" as const },
        { href: whatsappHref, external: true as const, btnClass: "btn-secondary" as const },
        { href: "/registration", external: false as const, btnClass: "btn-accent" as const },
      ] as const,
    [whatsappHref],
  )
  const steps = t("home.admissionsFunnel.steps", { returnObjects: true }) as {
    title: string
    description: string
    cta: string
  }[]

  return (
    <section
      className="section admissions-funnel-section"
      aria-labelledby="admissions-funnel-heading"
    >
      <div className="container">
        <div className="section-head section-head--accent admissions-funnel-head">
          <p className="eyebrow">{t("home.admissionsFunnel.eyebrow")}</p>
          <h2 id="admissions-funnel-heading">{t("home.admissionsFunnel.title")}</h2>
          <p className="section-lead">{t("home.admissionsFunnel.lead")}</p>
        </div>
        <ol className="admissions-funnel-grid">
          {steps.map((step, i) => {
            const link = stepLinks[i]
            if (!link) {
              return null
            }
            return (
              <motion.li
                key={step.title}
                className="admissions-funnel-card"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: reduce ? 0 : i * 0.08, duration: 0.45 }}
              >
                <span className="admissions-funnel-card__step" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {link.external ? (
                  <a
                    href={link.href}
                    className={`btn ${link.btnClass} admissions-funnel-card__cta`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {step.cta}
                  </a>
                ) : (
                  <Link to={link.href} className={`btn ${link.btnClass} admissions-funnel-card__cta`}>
                    {step.cta}
                  </Link>
                )}
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
