import type { ReactNode } from "react"

interface IconBadgeProps {
  children: ReactNode
  variant?: "default" | "light" | "sky"
  className?: string
}

export function IconBadge({ children, variant = "default", className = "" }: IconBadgeProps) {
  return (
    <span
      className={`icon-badge icon-badge--${variant} ${className}`.trim()}
      aria-hidden
    >
      {children}
    </span>
  )
}
