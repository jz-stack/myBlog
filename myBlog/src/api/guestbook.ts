import request from '@/utils/request'
import type { GuestbookListParams, GuestbookMessage, GuestbookForm } from '@/types/guestbookTypes'

export const getGuestbookList = (params: GuestbookListParams) => {
  return request.get<GuestbookMessage[]>('/guestbook', { params })
}

export const createGuestbook = (data: GuestbookForm) => {
  return request.post('/guestbook', data)
}