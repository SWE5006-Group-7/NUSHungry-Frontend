import apiClient from '@/utils/request'

export const favoriteService = {
  // 添加收藏
  async addFavorite(userId, stallId) {
    const response = await apiClient.post('/favorites', { userId, stallId })
    return response.data
  },

  // 取消收藏
  async removeFavorite(userId, stallId) {
    await apiClient.delete('/favorites', {
      params: { userId, stallId }
    })
  },

  // 获取用户收藏列表
  async getUserFavorites(userId) {
    const response = await apiClient.get(`/favorites/user/${userId}`)
    return response.data
  },

  // 检查是否已收藏
  async checkFavorite(userId, stallId) {
    try {
      const response = await apiClient.get('/favorites/check', {
        params: { userId, stallId }
      })
      return response.data.isFavorite
    } catch (error) {
      // 如果是403或401错误，返回false（未登录或未授权）
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        return false
      }
      throw error
    }
  }
}