import request from '@/utils/request'

export interface Comment {
  id: string
  article_id: string
  article_title: string
  author_name: string
  content: string
  created_at: string
}

export interface CommentListParams {
  page?: number
  pageSize?: number
  articleId?: string
}

export const getCommentList = (params: CommentListParams) => {
  return request.get('/admin/comments', { params })
}

export const deleteComment = (id: string) => {
  return request.delete(`/admin/comments/${id}`)
}

export const batchDeleteComments = (ids: string[]) => {
  return request.post('/admin/comments/batch-delete', { ids })
}

export const getRecentComments = (limit: number = 5) => {
  return request.get('/admin/comments/recent', { params: { limit } })
}
