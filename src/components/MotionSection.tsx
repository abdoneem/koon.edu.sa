import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

interface MotionSectionProps {
  children: ReactNode
  className?: string
  id?: string
}

export function MotionSection({ children, className, id }: MotionSectionProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
