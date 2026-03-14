import request from '@/utils/request'
import type { ArticleListParams } from '@/types/articleTypes'

export const getArticleList = (params: ArticleListParams) => {
  return request.get('/articles', { params })
}

export const getFeaturedArticles = () => {
  return request.get('/articles/featured')
}

export const getArticleDetail = (id: string) => {
  return request.get(`/articles/${id}`)
}
