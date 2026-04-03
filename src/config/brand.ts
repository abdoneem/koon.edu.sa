/** Official KOON brand assets and outbound links. */
export const brand = {
  logoSrc: "/brand/koon-logo-h.png",
  siteUrl: "https://koon.edu.sa",
  whatsappHref: "https://wa.me/966533126555",
  phoneDisplay: "0533126555",
  phoneTel: "+966533126555",
  /** Replace with official channel URLs when available */
  social: {
    youtube: "https://www.youtube.com",
    x: "https://x.com",
    snapchat: "https://www.snapchat.com",
  },
  /** Set when LMS URLs are live; empty shows “soon” in the portal strip */
  lmsParentUrl: (import.meta.env.VITE_LMS_PARENT_URL as string | undefined) ?? "",
  lmsStudentUrl: (import.meta.env.VITE_LMS_STUDENT_URL as string | undefined) ?? "",
  lmsTeacherUrl: (import.meta.env.VITE_LMS_TEACHER_URL as string | undefined) ?? "",
} as const
