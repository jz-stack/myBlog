import request from '@/utils/request'

export interface Comment {
  id: string
  article_id: string
  author_name: string
  content: string
  created_at: string
}


export const getCommentList = (articleId: string, params: {
  page?: number
  pageSize?: number
}) => {
  return request.get(`/articles/${articleId}/comments`, { params })
}

export const createComment = (data: {
  article_id: string
  name: string
  content: string
}) => {
  return request.post(`/articles/${data.article_id}/comments`, data)
}
