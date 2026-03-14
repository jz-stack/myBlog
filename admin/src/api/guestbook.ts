import request from '@/utils/request'

export interface GuestbookItem {
  id: string
  author_name: string
  mail: string
  content: string
  status: number
  created_at: string
}

export interface GuestbookListParams {
  page?: number
  pageSize?: number
  status?: number
}

export const getGuestbookList = (params: GuestbookListParams) => {
  return request.get('/admin/guestbook', { params })
}

export const deleteGuestbook = (id: string) => {
  return request.delete(`/admin/guestbook/${id}`)
}

export const updateGuestbookStatus = (id: string, status: number) => {
  return request.put(`/admin/guestbook/${id}/status`, { status })
}

export const batchDeleteGuestbook = (ids: string[]) => {
  return request.post('/admin/guestbook/batch-delete', { ids })
}
