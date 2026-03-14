import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getProfile } from '@/api/auth'
import type { LoginParams } from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<any>(null)

  const login = async (params: LoginParams) => {
    const res: any = await loginApi(params)
    token.value = res.token
    localStorage.setItem('token', res.token)
    await fetchProfile()
    return res
  }

  const fetchProfile = async () => {
    try {
      const res: any = await getProfile()
      userInfo.value = res.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  return {
    token,
    userInfo,
    login,
    logout,
    fetchProfile
  }
})
