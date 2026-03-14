import request from '@/utils/request'

export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  cover_url: string
  publish_date: string
  tags: string[]
  created_at: string
}

export interface ArticleListParams {
  page?: number
  pageSize?: number
  keyword?: string
  tag?: string
}

export interface ArticleListResult {
  success: boolean
  data: {
    list: Article[]
    total: number
    page: number
    pageSize: number
  }
}

export interface CreateArticleParams {
  title: string
  content: string
  excerpt?: string
  cover_url?: string
  tags?: string[]
  publish_date?: string
}

export interface UpdateArticleParams {
  title?: string
  content?: string
  excerpt?: string
  cover_url?: string
  tags?: string[]
  publish_date?: string
}

export const getArticleList = (params: ArticleListParams) => {
  return request.get<ArticleListResult>('/admin/articles', { params })
}

export const getArticleDetail = (id: string) => {
  return request.get<{ success: boolean; data: Article }>(`/admin/articles/${id}`)
}

export const createArticle = (data: CreateArticleParams) => {
  return request.post<{ success: boolean; message: string; data: { id: string } }>('/admin/articles', data)
}

export const updateArticle = (id: string, data: UpdateArticleParams) => {
  return request.put<{ success: boolean; message: string }>(`/admin/articles/${id}`, data)
}

export const deleteArticle = (id: string) => {
  return request.delete<{ success: boolean; message: string }>(`/admin/articles/${id}`)
}

export const getAllTags = () => {
  return request.get<{ success: boolean; data: string[] }>('/admin/articles/tags')
}
