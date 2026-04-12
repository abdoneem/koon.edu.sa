import type { Paginated, RegistrationStatus } from "./registration"

export interface BookTourRequestRow {
  id: number
  name: string
  phone: string
  email: string | null
  preferred_date: string | null
  notes: string | null
  internal_notes?: string | null
  status: RegistrationStatus
  staff_reply: string | null
  replied_at: string | null
  created_at: string
  updated_at: string
}

export interface BookTourStats {
  total: number
  pending: number
  replied: number
}

export type BookTourSortField = "created_at" | "id" | "name" | "status" | "phone"

export type PaginatedBookTour = Paginated<BookTourRequestRow>
