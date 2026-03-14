export interface GuestbookMessage {
  id: string
  author_name: string
  mail?: string
  content: string
  created_at: string
}

export interface GuestbookListParams {
  page?: number
  pageSize?: number
}

export interface GuestbookForm {
  author_name: string
  mail?: string
  content: string
}