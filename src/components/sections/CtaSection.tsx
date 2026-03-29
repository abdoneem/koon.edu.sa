import { motion, useReducedMotion } from "framer-motion"

interface CtaSectionProps {
  title: string
  action: string
  hint?: string
}

export function CtaSection({ title, action, hint }: CtaSectionProps) {
  const reduce = useReducedMotion()

  return (
    <motion.section
      className="cta-band"
      aria-label={title}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container cta-band__inner">
        <div className="cta-band__text">
          <h2>{title}</h2>
          {hint ? <p className="cta-band__hint">{hint}</p> : null}
        </div>
        <motion.button
          type="button"
          className="btn btn-accent"
          whileHover={reduce ? undefined : { scale: 1.03 }}
          whileTap={reduce ? undefined : { scale: 0.98 }}
        >
          {action}
        </motion.button>
      </div>
    </motion.section>
  )
}
