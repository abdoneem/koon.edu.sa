export type RegistrationStatus = "pending" | "reviewed" | "replied" | "new" | "contacted" | "closed"

export interface RegistrationSubmission {
  id: number
  father_full_name: string
  father_national_id: string
  student_full_name: string
  student_national_id: string
  parent_mobile: string
  gender: string
  grade_level: string
  nationality: string
  notes: string | null
  internal_notes?: string | null
  status: RegistrationStatus
  staff_reply: string | null
  replied_at: string | null
  created_at: string
  updated_at: string
}

export interface RegistrationStats {
  total: number
  pending: number
  reviewed: number
  replied: number
  new: number
  contacted: number
  closed: number
  last_7_days: number
}

export type RegistrationSortField =
  | "created_at"
  | "id"
  | "student_full_name"
  | "father_full_name"
  | "grade_level"
  | "status"
  | "parent_mobile"

export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
