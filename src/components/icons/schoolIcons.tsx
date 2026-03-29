import type { ReactNode, SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.85,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function wrap(size: number, children: ReactNode, props: IconProps) {
  const { className, ...rest } = props
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...rest}
      {...stroke}
    >
      {children}
    </svg>
  )
}

export function IconLayers({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.84l8.57 3.91a2 2 0 0 0 1.66 0l8.57-3.9a1 1 0 0 0 0-1.84l-8.57-3.91Z" />
      <path d="m2 12 10 4.5L22 12" />
      <path d="m2 17 10 4.5L22 17" />
    </>,
    props,
  )
}

export function IconMapPin({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>,
    props,
  )
}

export function IconLanguages({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2v3" />
      <path d="M22 22l-5-10" />
      <path d="M17 22h10" />
    </>,
    props,
  )
}

export function IconShieldCheck({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>,
    props,
  )
}

export function IconCalendar({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </>,
    props,
  )
}

export function IconMessage({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </>,
    props,
  )
}

export function IconFileCheck({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4h4" />
      <path d="m9 15 2 2 4-4" />
    </>,
    props,
  )
}

export function IconSparkles({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </>,
    props,
  )
}

export function IconBook({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </>,
    props,
  )
}

export function IconTrending({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>,
    props,
  )
}

export function IconAward({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </>,
    props,
  )
}

export function IconGlobe({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </>,
    props,
  )
}

export function IconLandmark({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9v.01" />
      <path d="M9 12v.01" />
      <path d="M9 15v.01" />
      <path d="M9 18v.01" />
    </>,
    props,
  )
}

export function IconLightbulb({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </>,
    props,
  )
}

export function IconHeartHandshake({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.14.85 3 .06l.17-.15" />
    </>,
    props,
  )
}

export function IconUsers({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>,
    props,
  )
}

export function IconFlask({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M10 2v5.632c0 .896 0 1.344-.185 1.732a2 2 0 0 1-.83.83c-.387.185-.835.186-1.73.186H4.5c-.47 0-.705 0-.854.113a.5.5 0 0 0-.172.443c.067.282.37.49.978.9l7.022 4.681a2 2 0 0 1 .852 1.636V22" />
      <path d="M14 2v5.632c0 .896 0 1.344.185 1.732.258.387.508.687.83.83.387.185.836.186 1.731.186H19.5c.47 0 .705 0 .854.113a.5.5 0 0 1 .172.443c-.067.282-.37.49-.978.9l-7.022 4.681a2 2 0 0 0-.852 1.636V22" />
    </>,
    props,
  )
}

export function IconGraduation({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" />
      <path d="M6 12v5c0 1.5 1.1 2.7 3 3 1.9-.3 3-1.5 3-3v-5" />
    </>,
    props,
  )
}

export function IconHandshake({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14" />
      <path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91L11 14" />
      <path d="m2 8 6 6" />
      <path d="m22 8-6 6" />
    </>,
    props,
  )
}

export function IconRocket({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.32-.4.53-.9.7-1.3L7 13l-2.5 2c-.4.17-.9.38-1.3.7Z" />
      <path d="m12 15 3-3a6 6 0 0 0-7.5-7.5L9 7.5" />
      <path d="M15 12l5.5-5.5a2.2 2.2 0 0 1 3.1 0l.5.5c.86.86.86 2.25 0 3.1L18 15" />
      <path d="m22 2-1.5 1.5" />
    </>,
    props,
  )
}

export function IconFlag({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </>,
    props,
  )
}

export function IconHeartPulse({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5 1 2-4 1 4h4.27" />
    </>,
    props,
  )
}

export function IconCheckCircle({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </>,
    props,
  )
}

export function IconHelp({ size = 22, ...props }: IconProps) {
  return wrap(
    size,
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </>,
    props,
  )
}

export function IconSectionMark({ size = 40, ...props }: IconProps) {
  /** Decorative mark suggesting KOON “K” / ascending lines — logo-inspired, not a literal mark */
  return wrap(
    size,
    <>
      <path d="M8 20V4l4 8 4-8v16" opacity={0.35} />
      <path d="M6 4h12" opacity={0.5} />
    </>,
    props,
  )
}
