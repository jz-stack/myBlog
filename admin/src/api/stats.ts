import request from '@/utils/request'

export interface OverviewData {
  totalVisits: number
  uniqueVisitors: number
  todayVisitors: number
  totalArticles: number
  totalComments: number
  totalGuestbook: number
}

export interface TrendData {
  dates: string[]
  visits: number[]
  uniqueVisitors: number[]
}

export interface IpItem {
  ip: string
  visit_count: number
  first_visit_time: string
  last_visit_time: string
}

export interface PopularArticle {
  id: string
  title: string
  views: number
  date: string
}

export const getOverview = () => {
  return request.get('/admin/stats/overview')
}

export const getVisitTrend = (days: number = 7) => {
  return request.get('/admin/stats/trend', { params: { days } })
}

export const getIpList = (params: { page?: number; pageSize?: number; orderBy?: string; order?: string }) => {
  return request.get('/admin/stats/ip-list', { params })
}

export const getPopularArticles = (limit: number = 5) => {
  return request.get('/admin/stats/popular-articles', { params: { limit } })
}
