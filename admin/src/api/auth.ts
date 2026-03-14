import request from '@/utils/request'
import { LoginParams, LoginResult, ProfileResult } from '@/types/auth'

export const getWallpaper = () => {
  return request.get('/homeWallpaper')
}

export const login = (data: LoginParams) => {
  return request.post<LoginResult>('/auth/login', data)
}

export const getProfile = () => {
  return request.get<ProfileResult>('/admin/profile')
}

export const updateProfile = (data: { nickname?: string; avatar?: string }) => {
  return request.put('/admin/profile', data)
}

export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return request.put('/admin/password', data)
}
