import axios from 'axios';

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

// 通知所有等待的请求
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach(callback => callback(newToken))
  refreshSubscribers = []
}

// 添加到等待队列
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback)
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

      // 401 或 403 都表示token过期或无效
      if ((status === 401 || status === 403) && !originalRequest._retry) {
        // 如果是refresh端点失败,直接跳转登录
        if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')

          if (window.message) {
            window.message.warning('登录已过期，请重新登录')
          }

          setTimeout(() => {
            window.location.href = '/login'
          }, 500)
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
          localStorage.removeItem('token')
          localStorage.removeItem('user')

          if (window.message) {
            window.message.warning('登录已过期，请重新登录')
          }

          setTimeout(() => {
            window.location.href = '/login'
          }, 500)
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
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')

          if (window.message) {
            window.message.warning('登录已过期，请重新登录')
          }

          setTimeout(() => {
            window.location.href = '/login'
          }, 500)
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