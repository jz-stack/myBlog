export interface Article {
  id: string
  title: string
  excerpt: string
  cover: string
  date: string
  tags: string[]
}

export interface ArticleListParams {
  page?: number
  pageSize?: number
  keyword?: string
  tag?: string
}