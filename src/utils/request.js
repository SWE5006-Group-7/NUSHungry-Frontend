import axios from 'axios';
import { message } from 'ant-design-vue';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 是否正在刷新token
let isRefreshing = false
// 等待刷新token的请求队列
let refreshSubscribers = []
// 是否已经显示过登录过期提示
let hasShownExpiredMessage = false

// 通知所有等待的请求
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach(callback => callback(newToken))
  refreshSubscribers = []
}

// 添加到等待队列
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback)
}

// 处理登出逻辑
const handleLogout = (msg = '登录已过期，请重新登录') => {
  if (hasShownExpiredMessage) return;
  hasShownExpiredMessage = true;
  
  // 清除本地存储
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  
  // 显示提示
  message.warning(msg)
  
  // 延迟跳转登录页
  setTimeout(() => {
    hasShownExpiredMessage = false;
    window.location.href = '/login'
  }, 1500)
}

// 请求拦截器 - 自动添加token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理token过期并自动刷新
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response) {
      const status = error.response.status

      // 403表示权限不足或token过期
      if (status === 403) {
        // 如果有token，说明是token失效，需要登出
        const token = localStorage.getItem('token');
        if (token) {
          const errorMsg = error.response.data?.message || '会话已过期，请重新登录';
          handleLogout(errorMsg);
        }
        // 无论是否有token，都将错误传递出去，让调用方决定如何处理
        return Promise.reject(error)
      }

      // 401表示token过期或无效，尝试刷新token
      if (status === 401 && !originalRequest._retry) {
        // 如果是登录、注册或刷新token端点失败，直接返回错误，不做处理
        if (originalRequest.url && (
          originalRequest.url.includes('/auth/login') ||
          originalRequest.url.includes('/auth/register') ||
          originalRequest.url.includes('/admin/auth/login') ||
          originalRequest.url.includes('/auth/refresh')
        )) {
          return Promise.reject(error)
        }

        // 如果是refresh端点失败,直接跳转登录
        if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
          handleLogout()
          return Promise.reject(error)
        }

        // 标记该请求已经重试过
        originalRequest._retry = true

        // 如果正在刷新token,将请求加入队列
        if (isRefreshing) {
          return new Promise((resolve) => {
            addRefreshSubscriber((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              resolve(apiClient(originalRequest))
            })
          })
        }

        // 开始刷新token
        isRefreshing = true
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          // 没有refresh token,直接跳转登录
          handleLogout()
          return Promise.reject(error)
        }

        try {
          // 调用refresh token接口
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            { refreshToken: refreshToken }
          )

          const { accessToken } = response.data

          // 保存新的access token
          localStorage.setItem('token', accessToken)

          // 通知所有等待的请求
          onRefreshed(accessToken)

          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          // refresh token也失效了,跳转登录
          handleLogout()
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient;