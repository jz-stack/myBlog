import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

export default request
