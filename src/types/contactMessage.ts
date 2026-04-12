import type { Paginated, RegistrationStatus } from "./registration"

export interface ContactMessageRow {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  internal_notes?: string | null
  status: RegistrationStatus
  staff_reply: string | null
  replied_at: string | null
  created_at: string
  updated_at: string
}

export interface ContactMessageStats {
  total: number
  pending: number
  replied: number
}

export type ContactMessageSortField = "created_at" | "id" | "name" | "email" | "status" | "subject"

export type PaginatedContactMessages = Paginated<ContactMessageRow>
