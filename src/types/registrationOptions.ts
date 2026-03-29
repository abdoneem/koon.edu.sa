export type RegistrationOptionLocale = "ar" | "en"

export interface RegistrationOptionItem {
  code: string
  sort_order: number
  labels: Record<RegistrationOptionLocale, string>
}

export interface RegistrationOptionsPayload {
  grades: RegistrationOptionItem[]
  nationalities: RegistrationOptionItem[]
}
