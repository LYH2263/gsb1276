import axios from 'axios'
import { ElNotification } from 'element-plus'
import { clearAuth, getToken } from './auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 12000,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.error?.message || error?.message || '请求失败'

    if (status === 401) {
      clearAuth()
    }

    if (!error?.config?.silent) {
      ElNotification({
        title: '请求失败',
        message,
        type: 'error',
        duration: 2600,
      })
    }

    return Promise.reject(error)
  },
)
