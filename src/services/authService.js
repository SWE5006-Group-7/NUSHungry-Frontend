import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

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

// 响应拦截器 - 处理token过期
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token过期或无效,清除本地存储并重定向到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  // 用户注册
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData)
      const { token, id, username, email, avatarUrl } = response.data

      // 构建user对象
      const user = { id, username, email, avatarUrl }

      // 保存token和用户信息
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }

      return { token, user }
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // 用户登录
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const { token, id, username, email, avatarUrl } = response.data

      // 构建user对象
      const user = { id, username, email, avatarUrl }

      // 保存token和用户信息
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }

      return { token, user }
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // 用户登出
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // 获取当前用户信息
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null
    }
    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error('Failed to parse user data:', error)
      localStorage.removeItem('user')
      return null
    }
  },

  // 检查是否已登录
  isAuthenticated() {
    const token = localStorage.getItem('token')
    const user = this.getCurrentUser()
    // 必须同时有token和有效的user数据
    return !!token && !!user && token !== 'undefined' && token !== 'null'
  },

  // 获取token
  getToken() {
    return localStorage.getItem('token')
  },

  // 获取用户的收藏列表
  async getUserFavorites() {
    try {
      const response = await apiClient.get('/user/favorites')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // 获取用户的评价列表
  async getUserReviews() {
    try {
      const response = await apiClient.get('/user/reviews')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // 更新用户密码
  async updatePassword(passwordData) {
    try {
      const response = await apiClient.put('/user/password', passwordData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // 获取用户信息
  async getUserProfile() {
    try {
      const response = await apiClient.get('/user/profile')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // 更新用户信息
  async updateUserProfile(userData) {
    try {
      const response = await apiClient.put('/user/profile', userData)
      // 更新本地存储的用户信息
      localStorage.setItem('user', JSON.stringify(response.data))
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // 上传头像
  async uploadAvatar(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // 更新本地用户信息中的头像URL
      const currentUser = this.getCurrentUser()
      if (currentUser) {
        currentUser.avatarUrl = response.data.avatarUrl
        localStorage.setItem('user', JSON.stringify(currentUser))
      }

      return response.data.avatarUrl
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}
