import apiClient from '@/utils/request'

export default {
  // 用户注册
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData)
      const { token, refreshToken, id, username, email, avatarUrl } = response.data

      // 构建user对象
      const user = { id, username, email, avatarUrl }

      // 保存token、refresh token和用户信息
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
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
      const { token, refreshToken, id, username, email, avatarUrl } = response.data

      // 构建user对象
      const user = { id, username, email, avatarUrl }

      // 保存token、refresh token和用户信息
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }

      return { token, user }
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // 用户登出
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        // 调用后端撤销refresh token
        await apiClient.post('/auth/logout', { refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 无论是否成功,都清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userInfo')  // 同时清除管理员登录的信息
    }
  },

  // 获取当前用户信息
  getCurrentUser() {
    // 兼容两种存储方式：user 和 userInfo
    let userStr = localStorage.getItem('user')
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      // 如果没有 user，尝试获取 userInfo（管理员登录使用的）
      userStr = localStorage.getItem('userInfo')
    }

    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null
    }

    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error('Failed to parse user data:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('userInfo')
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
